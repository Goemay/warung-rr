import requests

def main():
    try:
        r = requests.get('http://localhost:8000/api/products/', timeout=5)
        print('STATUS', r.status_code)
        print('CONTENT-TYPE', r.headers.get('content-type'))
        print('BODY', r.text[:2000])
    except Exception as e:
        print('ERROR', e)

if __name__ == '__main__':
    main()
