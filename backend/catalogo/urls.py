from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView
    )
from . import views, spotify_views


urlpatterns = [
    path("canciones/", views.cancion_list, name="cancion-list"),
    path("canciones/<int:pk>/", views.cancion_detail, name="cancion-detail"),
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh", TokenRefreshView.as_view()),
    path("registro/", views.RegistroView.as_view(), name='registro'),
    path("spotify/conectar/", spotify_views.spotify_conectar, name="spotify-conectar"),
    path("spotify/callback/", spotify_views.spotify_callback, name="spotify-callback"),
    path("spotify/token/", spotify_views.spotify_token, name="spotify-token"),
    ]
