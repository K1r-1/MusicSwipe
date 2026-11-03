from rest_framework import serializers
from .models import Cancion

class CancionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cancion
        fields = ["id", "spotify_id", "titulo", "artista"]
        read_only_fields = ["id"]