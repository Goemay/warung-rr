from django.shortcuts import render
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import OrderSerializer, OrderCreateSerializer
from .models import Order, OrderItem
from django.db import transaction
from django.shortcuts import get_object_or_404


class OrderViewSet(viewsets.ViewSet):
    """Simple Order API to create orders and return invoice data"""

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Validate stock and create order atomically
        with transaction.atomic():
            # check stock for each item
            for it in data['items']:
                product = get_object_or_404(__import__('products.models', fromlist=['Product']).Product, pk=it['product_id'])
                if product.stock < it['quantity']:
                    return Response({'detail': f"Insufficient stock for {product.name}: available {product.stock}, requested {it['quantity']}"}, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(total=data['total'])
            for it in data['items']:
                product = get_object_or_404(__import__('products.models', fromlist=['Product']).Product, pk=it['product_id'])
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=it['quantity'],
                    price=it['price']
                )
                # decrement stock
                product.stock = product.stock - it['quantity']
                product.save()

        out = OrderSerializer(order)
        return Response(out.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        out = OrderSerializer(order)
        return Response(out.data)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        order = Order.objects.order_by('-created_at').first()
        if not order:
            return Response(status=status.HTTP_404_NOT_FOUND)
        out = OrderSerializer(order)
        return Response(out.data)
