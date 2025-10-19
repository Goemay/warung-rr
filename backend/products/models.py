from django.db import models

# Create your models here.
from django.db import models

class Product(models.Model):
    barcode = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.barcode})"
