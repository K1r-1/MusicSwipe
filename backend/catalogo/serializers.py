from rest_framework import serializers
from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ["id", "titulo", "artista", "lanzamiento"]
        read_only_fields = ["id"] # los genera el servidor, no el cliente

    # Validación a medida: se ejecuta automáticamente para el campo "precio"
    # No hay validación útil todavía
    def validate_lanzamiento(self, value):
        if value.year >= 2026:
            raise serializers.ValidationError("El precio debe ser igual o menor a 2026")
        return value