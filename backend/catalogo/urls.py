from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView
    )
from . import views


urlpatterns = [
    path("servicios/", views.servicio_list, name="servicio-list"),
    path("canciones/", views.cancion_list, name="cancion-list"),
    path("canciones/<int:pk>/", views.cancion_detail, name="cancion-detail"),
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh", TokenRefreshView.as_view()),
    path("registro/", views.RegistroView.as_view(), name='registro')
]
