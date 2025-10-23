# Warung-RR

This repository contains a small point-of-sale (cashier) demo application built with:

- Backend: Django + Django REST Framework (SQLite development DB)
- Frontend: Vite + React + Axios

Summary of what was implemented
- Frontend SPA entry: `frontend/index.html` → `frontend/src/main.jsx` → `frontend/src/pages/FirstLook.jsx` (main cashier UI)
- Cashier UI: product list, cart, quantity +/- buttons, subtotal, pay flow
- Denomination buttons on the checkout panel for quick cash entry (Rp 500, 1.000, 2.000, 5.000, 10.000, 20.000, 50.000, 100.000)
- Invoice overlay with print support: `frontend/src/pages/Invoice.jsx`
- Simple scanner UI exists in the codebase (`frontend/src/pages/Scanner.jsx`) but is intentionally disabled from the main UI (not fully developed)

Backend
- Product model and API (GET `/api/products/`)
- Order and OrderItem models and API (POST `/api/orders/`) with transactional stock decrement logic
- Demo products insertion script in `backend/scripts/insert_demo_products.py`

What I tested
- Frontend builds successfully with Vite (production build)
- Backend migrations were created and applied for Product, Order, and OrderItem models
- Demo products were inserted into `backend/db.sqlite3`

Known issues / warnings (notes)
- Scanner feature is not fully developed and is intentionally disabled in the main UI to keep the cashier interface simple. The scanner component remains in `frontend/src/pages/Scanner.jsx` if you want to finish it later.
- The frontend expects the backend API base at `http://127.0.0.1:8000/api` by default. If your backend is bound to a different host or port, update `frontend/src/utils/api.js`.
- For local development, make sure to run the Django server bound to 127.0.0.1 (or 0.0.0.0) to avoid IPv6/localhost resolution issues that can cause connection refused errors.
- The app uses a SQLite DB (`backend/db.sqlite3`) for development — this file should not be committed to source control.

Quick start (development)
1. Backend (Python):

```powershell
Set-Location 'd:\Project-J\warung-rr\backend'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

2. Frontend (node):

```powershell
Set-Location 'd:\Project-J\warung-rr\frontend'
npm install
npm run dev
```

Open the frontend (Vite) URL shown in the terminal (usually `http://localhost:5173`) and make sure the backend is running at `http://127.0.0.1:8000`.

If the frontend can't reach the backend, use the "Use demo data" button in the Products panel to continue working without the API.

Git / deployment notes
- Do not commit `backend/db.sqlite3` — it's included in `.gitignore` below.
- The `frontend/dist` build output is ignored; commit only source files.

Where to find things
- Frontend source: `frontend/src/`
- Main cashier UI: `frontend/src/pages/FirstLook.jsx`
- Invoice view: `frontend/src/pages/Invoice.jsx`
- Scanner (disabled in UI): `frontend/src/pages/Scanner.jsx`
- Backend Django app: `backend/` (manage.py, core settings, products app)

If you want, I can create a short checklist or scripts to help deploy a production-ready container or a simple run script.
