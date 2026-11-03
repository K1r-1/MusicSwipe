from django.urls import path
from . import views


urlpatterns = [
    path("servicios/", views.servicio_list, name="servicio-list"),
    path("canciones/", views.cancion_list, name="cancion-list"),
    path("canciones/<int:pk>/", views.cancion_detail, name="cancion-detail"),
]
