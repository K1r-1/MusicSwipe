from rest_framework import serializers
from .models import Cancion, CancionGuardada

class CancionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cancion
        fields = ["id", "spotify_id", "titulo", "artista"]
        read_only_fields = ["id"]

class CancionGuardadaSerializer(serializers.ModelSerializer):
    cancion = CancionSerializer(read_only=True)

    class Meta:
        model = CancionGuardada
        fields = ["id", "cancion", "guardada_en"]
        read_only_fields = ["id", "cancion", "guardada_en"]
    
class GuardarCancionSerializer(serializers.Serializer):
    cancion_id = serializers.PrimaryKeyRelatedField(
        queryset=Cancion.objects.all(),
        source="cancion",
    )
