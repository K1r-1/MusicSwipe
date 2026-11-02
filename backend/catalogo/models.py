from django.db import models
from django.conf import settings



class Servicio(models.Model):
    """Servicio que ofrece el negocio (ejemplo; adáptalo a tu proyecto)."""
        
    titulo = models.CharField(max_length=100) # texto corto
    artista = models.CharField(max_length=100) # texto largo, opcional
    lanzamiento = models.DateField(null=False, blank=False) 

    class Meta:
        ordering = ["titulo"] # orden por defecto de las consultas
        verbose_name_plural = "servicios" # cómo se ve en el admin
    
    def __str__(self):
    #   Texto que Django muestra cuando imprime el objeto (admin, shell)
        return self.artista


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


class CancionGuardada(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "canciones_guardadas",
    )
    cancion = models.ForeignKey(
        Cancion,
        on_delete = models.CASCADE,
        related_name = "guardados",
    )
    guardada_en = models.DateTimeField(auto_now_add = True)

    class Meta:
        ordering = ["-guardada_en"]
        verbose_name_plural = "canciones guardadas"
        constraints = [
            models.UniqueConstraint(
                fields = ["usuario", "cancion"],
                name = "cancion_unica_por_usuario",
            )
        ]

    def __str__(self):
        return f"{self.usuario} - {self.cancion}"