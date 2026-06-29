# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
import os
import json

# Set test environment database
os.environ["DATABASE_URL"] = "sqlite:///./test_horizon.db"

from app.main import app
from app.database import Base, get_db
from app import models, config

# Create test database engine
engine = create_engine("sqlite:///./test_horizon.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clean and rebuild tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Clean tables before each test
    db = TestingSessionLocal()
    for tbl in reversed(Base.metadata.sorted_tables):
        db.execute(tbl.delete())
    db.commit()
    
    # Seed default settings for testing
    defaults = {
        "event_name": "TECH HORIZON 2.0",
        "ticket_link": "https://ticket",
        "registration_deadline": "2026-11-11T23:59:59",
        "idea_deadline": "2026-11-11T23:59:59"
    }
    for key, val in defaults.items():
        db.add(models.Settings(key=key, value=val))
    db.commit()
    db.close()


def test_public_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Check default keys exist
    keys = [item["key"] for item in data]
    assert "event_name" in keys

def test_team_registration_and_duplication():
    # Test valid registration
    reg_payload = {
        "team_name": "Test Hackers",
        "selected_theme": "Generative AI",
        "accommodation_required": True,
        "referral_source": "LinkedIn",
        "additional_comments": "Excited to join!",
        "members": [
            {
                "name": "Alice Lead",
                "gender": "Female",
                "email": "alice@gmail.com",
                "whatsapp": "9876543210",
                "linkedin": "https://linkedin.com/in/alice",
                "college": "GNITC",
                "designation": "Student",
                "grad_year_sem": "2027 / 3-1",
                "state": "Telangana",
                "city": "Hyderabad",
                "is_ieee_member": True,
                "ieee_id_proof_link": "https://drive.google.com/drive/alice-ieee",
                "college_id_proof_link": "https://drive.google.com/drive/alice-college"
            },
            {
                "name": "Bob Member",
                "gender": "Male",
                "email": "bob@gmail.com",
                "whatsapp": "9876543211",
                "linkedin": "https://linkedin.com/in/bob",
                "college": "GNITC",
                "designation": "Student",
                "grad_year_sem": "2027 / 3-1",
                "state": "Telangana",
                "city": "Hyderabad",
                "is_ieee_member": False,
                "ieee_id_proof_link": "N/A",
                "college_id_proof_link": "https://drive.google.com/drive/bob-college"
            },
            {
                "name": "Charlie Member",
                "gender": "Male",
                "email": "charlie@gmail.com",
                "whatsapp": "9876543212",
                "linkedin": "https://linkedin.com/in/charlie",
                "college": "GNITC",
                "designation": "Student",
                "grad_year_sem": "2027 / 3-1",
                "state": "Telangana",
                "city": "Hyderabad",
                "is_ieee_member": False,
                "ieee_id_proof_link": "N/A",
                "college_id_proof_link": "https://drive.google.com/drive/charlie-college"
            }
        ]
    }

    response = client.post("/api/registration", json=reg_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"].startswith("TH26-")
    assert data["team_name"] == "Test Hackers"
    assert len(data["participants"]) == 3
    assert data["participants"][0]["name"] == "Alice Lead"
    
    # Test duplicate registration with same Lead Email
    response_dup = client.post("/api/registration", json=reg_payload)
    assert response_dup.status_code == 400
    assert "already registered" in response_dup.json()["detail"]

def test_participant_verification_flow():
    # 1. Register team to get ID
    reg_payload = {
        "team_name": "Test Hackers",
        "selected_theme": "Generative AI",
        "accommodation_required": False,
        "referral_source": "Instagram",
        "members": [
            {
                "name": "Alice Lead", "gender": "Female", "email": "alice@gmail.com", "whatsapp": "9876543210", "linkedin": "link",
                "college": "GNITC", "designation": "Student", "grad_year_sem": "2027", "state": "TS", "city": "Hyd",
                "is_ieee_member": True, "ieee_id_proof_link": "http://ieee", "college_id_proof_link": "http://college"
            },
            {
                "name": "Bob", "gender": "Male", "email": "bob@gmail.com", "whatsapp": "9876543211", "linkedin": "link",
                "college": "GNITC", "designation": "Student", "grad_year_sem": "2027", "state": "TS", "city": "Hyd",
                "is_ieee_member": False, "ieee_id_proof_link": "N/A", "college_id_proof_link": "http://college"
            },
            {
                "name": "Charlie", "gender": "Male", "email": "charlie@gmail.com", "whatsapp": "9876543212", "linkedin": "link",
                "college": "GNITC", "designation": "Student", "grad_year_sem": "2027", "state": "TS", "city": "Hyd",
                "is_ieee_member": False, "ieee_id_proof_link": "N/A", "college_id_proof_link": "http://college"
            }
        ]
    }
    reg_res = client.post("/api/registration", json=reg_payload)
    team_id = reg_res.json()["id"]

    # 2. Check team status before verification
    status_res = client.get(f"/api/status/{team_id}")
    assert status_res.status_code == 200
    assert status_res.json()["verification_status"] == "Pending"

    # 3. Submit verification
    v_payload = {
        "team_id": team_id,
        "team_lead_name": "Alice Lead",
        "company_college": "GNITC",
        "team_name": "Test Hackers",
        "team_size": 3,
        "ieee_members_count": "1",
        "non_ieee_members_count": "2",
        "member1_link": "https://drive.google.com/alice-verify",
        "member2_link": "https://drive.google.com/bob-verify",
        "member3_link": "https://drive.google.com/charlie-verify",
        "member4_link": "N/A",
        "member5_link": "N/A",
        "member6_link": "N/A",
        "remarks": "Please review soon."
    }
    v_res = client.post("/api/verification", json=v_payload)
    assert v_res.status_code == 200
    assert v_res.json()["member1_link"] == "https://drive.google.com/alice-verify"

    # 4. Check status updated to Under Review
    status_res = client.get(f"/api/status/{team_id}")
    assert status_res.json()["verification_status"] == "Under Review"

def test_admin_auth_and_dashboard():
    # Login with incorrect details
    login_fail = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert login_fail.status_code == 401

    # Login with correct credentials (default settings loaded from config)
    login_success = client.post("/api/auth/login", json={
        "username": config.ADMIN_USERNAME,
        "password": config.ADMIN_PASSWORD
    })
    assert login_success.status_code == 200
    token = login_success.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify protected dashboard route
    dash_res = client.get("/api/admin/dashboard", headers=headers)
    assert dash_res.status_code == 200
    assert "widgets" in dash_res.json()
    assert "charts" in dash_res.json()
