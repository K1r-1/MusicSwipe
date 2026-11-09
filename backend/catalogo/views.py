from rest_framework import serializers, generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.validators import UniqueValidator 
from django.contrib.auth import get_user_model
from .models import Cancion
from .serializers import CancionSerializer
from django.http import JsonResponse
from .models import Servicio

User = get_user_model()

@api_view(["GET", "POST"])
def cancion_list(request):
    if request.method == "GET":
        canciones = Cancion.objects.all()
        serializer = CancionSerializer(canciones, many=True)
        return Response(serializer.data)

    serializer = CancionSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status = status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status = status.HTTP_400_BAD_REQUEST,
    )

@api_view(["GET", "PATCH", "DELETE"])
def cancion_detail(request, pk):
    cancion = get_object_or_404(Cancion, pk=pk)

    if request.method == "GET":
        serializer = CancionSerializer(cancion)
        return Response(serializer.data)

    if request.method == "DELETE":
        cancion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CancionSerializer(cancion, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True, 
        validators = [
            UniqueValidator(queryset=User.objects.all(), lookup="iexact", message="Ya existe una cuenta con ese correo",)
        ],)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny] # Permite crear cuenta sin haber iniciado sesión

def servicio_list(request):
    """Devuelve en JSON los servicios activos."""
    # .values() entrega cada fila como diccionario {campo: valor}.
    # Elegimos los campos a exponer: nunca publiques más de lo necesario.
    servicios = list(
        Servicio.objects.values(
            "titulo", "artista", "lanzamiento"
        )
    ) # list() fuerza la ejecución de la consulta (QuerySet perezoso)

    # Se envuelve la lista en un objeto para poder agregar metadatos después
    return JsonResponse({"count": len(servicios), "results": servicios})
