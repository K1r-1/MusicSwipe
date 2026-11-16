from rest_framework import serializers
from .models import Cancion

class CancionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cancion
        fields = ["id", "spotify_id", "titulo", "artista"]
        read_only_fields = ["id"]

    def validate_spotify_id(self, value):
        if len(value) != 22 or not value.isascii() or not value.isalnum():
            raise serializers.ValidationError(
                "El identificador de Spotify debe tener 22 letras y/o números"
            )

        return value
