import secrets
import time
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def spotify_conectar(request):
    state = secrets.token_urlsafe(32)

    request.session.cycle_key()
    request.session["spotify_oauth"] = {
        "state": state,
        "usuario_id": request.user.pk,
        "iniciado_en": time.time(),
    }

    parametros = {
        "response_type": "code",
        "client_id": settings.SPOTIFY_CLIENT_ID,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        "state": state,
        "scope": " ".join(settings.SPOTIFY_SCOPES),
    }

    url = "https://accounts.spotify.com/authorize?" + urlencode(parametros)

    return Response({"url": url})

@require_GET
def spotify_callback(request):
    pendiente = request.session.pop("spotify_oauth", None)
    state = request.GET.get("state", "")

    if not pendiente:
        return HttpResponse(
            "No hay una conexión pendiente. Vuelve a MusicSwipe e inténtalo otra vez.",
            status=400,
        )

    state_valido = secrets.compare_digest(
        state,
        pendiente["state"],
    )

    tiempo_valido = time.time() - pendiente["iniciado_en"] < 600

    if not state_valido or not tiempo_valido:
        return HttpResponse(
            "La autorización no es válida o ha vencido. Inicia la conexión nuevamente.",
            status=400,
        )

    if request.GET.get("error"):
        return HttpResponse(
            "No se completó la autorización de Spotify.",
            status=400,
        )

    code = request.GET.get("code")

    if not code:
        return HttpResponse(
            "Spotify no devolvió el código de autorización.",
            status=400,
        )

    try:
        respuesta = requests.post(
            "https://accounts.spotify.com/api/token",
            auth=(
                settings.SPOTIFY_CLIENT_ID,
                settings.SPOTIFY_CLIENT_SECRET,
            ),
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
            },
            timeout=10,
        )
    except requests.RequestException:
        return HttpResponse(
            "No se pudo contactar con Spotify. Inicia la conexión nuevamente.",
            status=502,
        )

    if respuesta.status_code != 200:
        return HttpResponse(
            "Spotify rechazó el intercambio de autorización. Revisa las credenciales e inicia la conexión nuevamente.",
            status=502,
        )

    try:
        datos = respuesta.json()
        access_token = datos["access_token"]
        refresh_token = datos["refresh_token"]
        expires_in = int(datos["expires_in"])
    except (ValueError, KeyError, TypeError):
        return HttpResponse(
            "Spotify devolvió una respuesta inesperada.",
            status=502,
        )

    request.session["spotify_conexion"] = {
        "usuario_id": pendiente["usuario_id"],
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": time.time() + expires_in,
        "scope": datos.get("scope", ""),
    }

    respuesta_final = HttpResponse(
        "Spotify conectado correctamente. Puedes cerrar esta pestaña y volver a MusicSwipe."
    )
    respuesta_final["Cache-Control"] = "no-store"

    return respuesta_final

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def spotify_token(request):
    def responder(datos, codigo=200):
        respuesta = Response(datos, status=codigo)
        respuesta["Cache-Control"] = "no-store"
        return respuesta

    conexion = request.session.get("spotify_conexion")

    if not conexion:
        return responder(
            {
                "detail": "Primero conecta Spotify.",
                "code": "spotify_no_conectado",
            },
            409,
        )

    if conexion["usuario_id"] != request.user.pk:
        return responder(
            {
                "detail": "La conexión de Spotify pertenece a otro usuario.",
                "code": "spotify_usuario_distinto",
            },
            403,
        )

    permisos = set(conexion.get("scope", "").split())

    if not set(settings.SPOTIFY_SCOPES).issubset(permisos):
        return responder(
            {
                "detail": "Vuelve a conectar Spotify para autorizar la reproducción.",
                "code": "spotify_permisos_insuficientes",
            },
            409,
        )

    ahora = time.time()
    renovado = False

    if conexion["expires_at"] <= ahora + 60:
        proximo_intento = conexion.get("retry_at", 0)

        if ahora < proximo_intento:
            espera = max(1, int(proximo_intento - ahora) + 1)

            respuesta = responder(
                {
                    "detail": "Espera antes de volver a solicitar el token.",
                    "retry_after": espera,
                },
                429,
            )
            respuesta["Retry-After"] = str(espera)
            return respuesta

        try:
            resultado = requests.post(
                "https://accounts.spotify.com/api/token",
                auth=(
                    settings.SPOTIFY_CLIENT_ID,
                    settings.SPOTIFY_CLIENT_SECRET,
                ),
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": conexion["refresh_token"],
                },
                timeout=10,
            )
        except requests.RequestException:
            return responder(
                {"detail": "No se pudo contactar con Spotify."},
                502,
            )

        if resultado.status_code == 429:
            try:
                retry_after = max(
                    1,
                    int(resultado.headers.get("Retry-After", "30")),
                )
            except ValueError:
                retry_after = 30

            intentos = min(conexion.get("intentos_429", 0) + 1, 8)
            espera = max(retry_after, 2 ** intentos)

            conexion["intentos_429"] = intentos
            conexion["retry_at"] = time.time() + espera
            request.session["spotify_conexion"] = conexion

            respuesta = responder(
                {
                    "detail": "Spotify limitó las solicitudes. Inténtalo más tarde.",
                    "retry_after": espera,
                },
                429,
            )
            respuesta["Retry-After"] = str(espera)
            return respuesta

        try:
            datos = resultado.json()
        except ValueError:
            return responder(
                {"detail": "Spotify devolvió una respuesta inesperada."},
                502,
            )

        if not isinstance(datos, dict):
            return responder(
                {"detail": "Spotify devolvió una respuesta inesperada."},
                502,
            )

        if datos.get("error") == "invalid_grant":
            request.session.pop("spotify_conexion", None)

            return responder(
                {
                    "detail": "La autorización venció o fue revocada. Conecta Spotify nuevamente.",
                    "code": "spotify_reautorizar",
                },
                409,
            )

        if resultado.status_code != 200:
            return responder(
                {
                    "detail": "Spotify rechazó la renovación del token.",
                    "code": "spotify_error_renovacion",
                },
                502,
            )

        try:
            nuevo_access = datos["access_token"]
            duracion = int(datos["expires_in"])

            if not isinstance(nuevo_access, str) or not nuevo_access or duracion <= 0:
                raise ValueError
        except (KeyError, ValueError, TypeError):
            return responder(
                {"detail": "Spotify devolvió un token o una duración inválidos."},
                502,
            )

        conexion["access_token"] = nuevo_access
        conexion["expires_at"] = time.time() + duracion

        if datos.get("refresh_token"):
            conexion["refresh_token"] = datos["refresh_token"]

        if "scope" in datos:
            conexion["scope"] = datos["scope"]

        conexion.pop("retry_at", None)
        conexion.pop("intentos_429", None)

        request.session["spotify_conexion"] = conexion
        renovado = True

    return responder(
        {
            "access_token": conexion["access_token"],
            "expires_at": conexion["expires_at"],
            "renovado": renovado,
        }
    )