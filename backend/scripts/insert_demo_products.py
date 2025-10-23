#!/usr/bin/env python3
"""Insert demo products directly into the project's SQLite database.

This script uses sqlite3 directly to avoid importing Django when the environment
is not prepared. It will create the `products_product` table if it doesn't exist
and insert or replace demo rows identified by barcode.
"""
from pathlib import Path
import sqlite3


DB = Path(__file__).resolve().parent.parent / 'db.sqlite3'

PRODUCTS = [
    ('000000000001', 'Nasi Goreng Special', '15000.00', 50),
    ('000000000002', 'Es Teh Manis', '5000.00', 100),
    ('000000000003', 'Ayam Goreng Crispy', '25000.00', 40),
]


def main():
    print('Using DB:', DB)
    DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    # Ensure table exists (mirror of Django model)
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS products_product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode VARCHAR(100) UNIQUE,
            name VARCHAR(100),
            price NUMERIC,
            stock INTEGER DEFAULT 0
        );
        '''
    )

    for barcode, name, price, stock in PRODUCTS:
        cur.execute(
            '''INSERT OR REPLACE INTO products_product (barcode, name, price, stock)
               VALUES (?, ?, ?, ?)''',
            (barcode, name, price, stock),
        )

    conn.commit()

    print('\nProducts in DB:')
    for row in cur.execute('SELECT id, barcode, name, price, stock FROM products_product ORDER BY id'):
        print(row)

    conn.close()


if __name__ == '__main__':
    main()
