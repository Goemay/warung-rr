import requests
import json

url = 'http://127.0.0.1:8000/api/orders/'
payload = {
    'items': [
        {'product_id': 1, 'quantity': 2, 'price': '15000.00'},
    ],
    'total': '30000.00'
}

r = requests.post(url, json=payload)
print(r.status_code)
print(r.text)
