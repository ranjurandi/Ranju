# backend/api/index.py
"""Vercel entry‑point for FastAPI app.
This file is used by Vercel's Python runtime to locate the ASGI
application. It simply imports the FastAPI app defined in
backend/server.py.
"""

from server import app  # noqa: F401
