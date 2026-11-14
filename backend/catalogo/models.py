from django.db import models


# Tabla Canción
class Cancion(models.Model):
    spotify_id = models.CharField(max_length=100, unique=True)
    titulo = models.CharField(max_length=100)
    artista = models.CharField(max_length=100)

    class Meta:
        ordering = ["titulo"]
        verbose_name_plural = "canciones"

    def __str__(self):
        return f"{self.titulo} - {self.artista}"
