from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)

from .views import OrderViewSet
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = router.urls
