import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Database
# Default to a local postgres DB connection. Provide SQLite as local fallback if DB_URL is not set.
# Note: Prompt requested PostgreSQL as primary, so we default to a standard PostgreSQL connection URI.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/techhorizon")

# JWT Security
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-tech-horizon-key-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

import hashlib

# Predefined Admin Credentials
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "techhorizon2.0")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "techH@$1122333")
# Self-heal if env parser strips $ or # characters
if ADMIN_PASSWORD in ("techH@", "techH@#", "techH"):
    ADMIN_PASSWORD = "techH@$1122333"

ADMIN_PASSWORD_HASH = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()

# SMTP Configuration (Optional, logs to DB if not configured)
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "maradanahimatej27@gmail.com")

# Dynamic Event Config Defaults (Can be modified via Admin Panel settings DB table)
DEFAULT_EVENT_NAME = "TECH HORIZON 2.0"
DEFAULT_TICKET_LINK = "https://share.goavo.ai/og/event?meetup_id=6a0c454ba281d0d9de4d77d4&redirect_to=%2Fevents%2Fticket%2Ffillup%3Fid%3D6a0c454ba281d0d9de4d77d4&title=TECH+HORIZON+2.0+%E2%80%93+National+Level+Hackathon"
DEFAULT_WEBSITE_LINK = "https://ieeetechhorizon.gt.tc/"
