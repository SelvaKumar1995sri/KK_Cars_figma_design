Django REST API for Car Selling Web Page

Quick start

1. Create a Python virtual environment and activate it:

   python -m venv .venv
   .\.venv\Scripts\activate   (Windows)
   source .venv/bin/activate  (macOS/Linux)

2. Install dependencies:

   pip install -r requirements.txt

3. Create a `.env` file (you can copy `.env.example`) and set the DB and secret key. By default the project uses SQLite for convenience. To use MySQL, set the DB env vars.

4. Run migrations and create superuser:

   python manage.py migrate
   python manage.py createsuperuser

5. Start the dev server:

   python manage.py runserver

API endpoints (default local):
- /api/auth/token/  (JWT token obtain)
- /api/auth/token/refresh/  (JWT refresh)
- /api/cars/  (CRUD)
- /api/enquiries/  (CRUD)
- /api/sales/  (CRUD)
- /api/testimonials/  (CRUD)

Frontend integration
- Update frontend requests to point to `http://localhost:8000/api/...` or your deployed backend URL.

Notes
- This is a minimal starter. Add pagination, permissions, rate-limiting, and validation for production use.
