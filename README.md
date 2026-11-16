# MusicSwipe

MusicSwipe permite escuchar canciones, pasar a la siguiente y guardar las que te gusten en Spotify. También tiene un catálogo donde se pueden agregar, editar y eliminar canciones.
Desarrollado con React, Django REST Framework y SQLite.

## Requisitos

- Python y Node.js instalados.
- Una aplicación creada en Spotify for Developers.
- Una cuenta Spotify Premium para reproducir música.

## Configuración de Spotify

En el panel de Spotify, habilitar Web API y Web Playback SDK.

Agregar esta dirección en Redirect URIs:

```text
http://127.0.0.1:8000/api/spotify/callback/
```

Copiar el Client ID y el Client Secret para configurar el backend.

## Backend

Desde la carpeta principal del proyecto:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Abrir `backend/.env` y completar las credenciales de Spotify.

Después ejecutar:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

El usuario creado se utiliza para iniciar sesión en MusicSwipe.

## Frontend

Abrir otra terminal desde la carpeta principal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir:

```text
http://127.0.0.1:5173
```

Ambos servidores deben permanecer ejecutándose.

## Uso

1. Iniciar sesión.
2. Entrar en Catálogo para agregar canciones con su ID de Spotify, título y artista.
3. Desde el catálogo también se pueden editar y eliminar canciones.
4. Entrar en Descubrir y pulsar Conectar Spotify.
5. Completar la autorización y volver a MusicSwipe.
6. Pulsar Preparar reproductor y después Escuchar tarjeta.
7. Usar Me gusta para guardar en Spotify o Pasar para avanzar sin guardar.

El ID de una canción está entre `/track/` y `?` en su enlace de Spotify.

El catálogo se guarda en SQLite. Las canciones marcadas con Me gusta se guardan en la cuenta de Spotify.

En una instalación nueva, el catálogo comienza vacío.

## Variables de entorno

`backend/.env`:

```env
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/api/spotify/callback/
```

`frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```
