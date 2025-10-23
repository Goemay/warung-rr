from django.db import migrations


def create_demo_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    demo = [
        {'barcode': '000000000001', 'name': 'Nasi Goreng Special', 'price': '15000.00', 'stock': 50},
        {'barcode': '000000000002', 'name': 'Es Teh Manis', 'price': '5000.00', 'stock': 100},
        {'barcode': '000000000003', 'name': 'Ayam Goreng Crispy', 'price': '25000.00', 'stock': 40},
    ]
    for d in demo:
        Product.objects.update_or_create(barcode=d['barcode'], defaults=d)


def remove_demo_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    barcodes = ['000000000001', '000000000002', '000000000003']
    Product.objects.filter(barcode__in=barcodes).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_demo_products, remove_demo_products),
    ]
