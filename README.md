# TECH HORIZON 2.0 Hackathon Portal

A production-ready, secure, and responsive full-stack web application designed for **TECH HORIZON 2.0 – National Level 48-Hour Hackathon**. This website replaces the existing Google/GoAvo forms while maintaining the exact workflow, event descriptions, validations, and questions. 

Developed with a premium, modern, IEEE-inspired interface using React, Tailwind CSS, FastAPI, and PostgreSQL.

---

## 🚀 Registration & Verification Workflow

1. **Step 1 (External)**: Participant purchases a Ticket using the External Ticket Link.
2. **Step 2 (Portal)**: Participant completes Team Registration on this website.
   - Automatically generates a unique Team ID (e.g. `TH26-0001`).
   - Stores member details (up to 6) in structured database fields.
3. **Step 3 (Portal)**: Participant completes IEEE Membership ID / College ID Verification.
   - Autoloads registered team details using the Team ID as lookup.
   - Conditional drive link fields rendered based on team size.
4. **Step 4 (External)**: Participant submits Project Idea using the GoAvo external form link.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, React Router, React Hot Toast
- **Backend**: FastAPI (Python 3.14 compatible), SQLAlchemy, PyJWT, Passlib (Bcrypt)
- **Database**: PostgreSQL (Dialect-aware support for SQLite during automated test suites)
- **Excel Exports**: openpyxl, Python standard CSV module (High-speed compilations)

---

## 📦 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py          # Password hashing, JWT signing
│   │   ├── config.py        # Environmental loaders
│   │   ├── database.py      # SQLAlchemy connection engine
│   │   ├── email_service.py # Automated notification HTML templates
│   │   ├── excel_export.py  # 8-Sheet Excel generation
│   │   ├── models.py        # PostgreSQL model structures
│   │   ├── schemas.py       # Pydantic validation models
│   │   └── main.py          # App initialization and REST API routers
│   ├── tests/
│   │   └── test_api.py      # Automated endpoint test suites
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProgressTracker, Toast
│   │   ├── pages/           # Home, Register, Verify, Status, SubmitIdea, AdminDashboard
│   │   ├── App.jsx          # Route mappings
│   │   ├── index.css        # Global variables and scrollbar animations
│   │   └── main.jsx         # DOM entry
│   ├── index.html           # Document structure
│   ├── vite.config.js       # Proxies API requests to 8000
│   └── tailwind.config.js   # Tailored IEEE styling tokens
├── .env.example             # Global environment configurations
└── README.md                # System documentation
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory based on the following keys:

```ini
# PostgreSQL Database Connection String
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techhorizon

# JWT Authentication Config
JWT_SECRET=super-secret-tech-horizon-key-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Predefined Single Admin Account Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@Horizon2026

# Optional SMTP Settings (Logs to database sent_emails table if left blank)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=maradanahimatej27@gmail.com
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python (v3.10+)
- Node.js (v18+)
- PostgreSQL Database Server

### 1. Database Setup
1. Create a PostgreSQL database named `techhorizon`:
   ```sql
   CREATE DATABASE techhorizon;
   ```
2. Adjust your `DATABASE_URL` in the `backend/.env` file to match your PostgreSQL server credentials (user, password, host, port).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will run on `http://127.0.0.1:8000` and automatically create the required database tables and seed initial default values.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Vite will automatically proxy all `/api` requests to the backend server.*

---

## 🧪 Testing

We use `pytest` for automated backend integration testing. The test suite overrides database sessions to run on a local SQLite file so it doesn't contaminate your active PostgreSQL database:

1. Navigate to the backend directory and activate the virtual environment.
2. Run pytest with the python path set:
   ```bash
   # On Windows:
   $env:PYTHONPATH="."; .\venv\Scripts\pytest tests/
   # On macOS/Linux:
   PYTHONPATH=. pytest tests/
   ```

---

## 🛡️ Security Implementations

- **SQL Injection Prevention**: Built entirely with SQLAlchemy ORM using parameterized queries.
- **Cross-Site Scripting (XSS)**: Managed by React rendering, which automatically escapes user input before inserting it into the DOM.
- **Access Control & JWT**: The organizer dashboard endpoints are strictly locked behind JWT Bearer token authentication verified at the API level.
- **Predefined Credentials**: Single organizer account managed securely via `.env` environment variables. No signup routes are accessible.
