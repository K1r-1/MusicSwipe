from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet


router = DefaultRouter()
router.register("servicios", ServicioViewSet, basename="servicio")

# El router genera /servicios/ y /servicios/<id>/ con sus métodos HTTP
urlpatterns = router.urls