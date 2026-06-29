import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import StreamingResponse, Response
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func, desc, or_

from . import models, schemas, auth, database, config, email_service, excel_export
from .database import engine, get_db

# pyrefly: ignore [missing-import]
from sqlalchemy import text, inspect
# Initialize database tables
models.Base.metadata.create_all(bind=engine)

# Dynamic DB Auto-Migration check
try:
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('teams')]
    with engine.begin() as conn:
        if 'project_idea_link' not in columns:
            conn.execute(text("ALTER TABLE teams ADD COLUMN project_idea_link VARCHAR(255)"))
        if 'project_idea_date' not in columns:
            conn.execute(text("ALTER TABLE teams ADD COLUMN project_idea_date VARCHAR(50)"))
        if 'project_idea_time' not in columns:
            conn.execute(text("ALTER TABLE teams ADD COLUMN project_idea_time VARCHAR(50)"))
        if 'project_idea_verification_status' not in columns:
            conn.execute(text("ALTER TABLE teams ADD COLUMN project_idea_verification_status VARCHAR(50) DEFAULT 'Pending Review'"))
        if 'project_idea_remarks' not in columns:
            conn.execute(text("ALTER TABLE teams ADD COLUMN project_idea_remarks TEXT"))
    
    p_columns = [col['name'] for col in inspector.get_columns('participants')]
    with engine.begin() as conn:
        if 'gender' not in p_columns:
            conn.execute(text("ALTER TABLE participants ADD COLUMN gender VARCHAR(50)"))
except Exception as e:
    print(f"Auto-migration check skipped or error encountered: {e}")

# Startup Seeding (via Lifespan Context Manager)
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = database.SessionLocal()
    try:
        # Seed default configurations
        defaults = {
            "event_name": config.DEFAULT_EVENT_NAME,
            "ticket_link": config.DEFAULT_TICKET_LINK,
            "website_link": config.DEFAULT_WEBSITE_LINK,
            "registration_deadline": "2026-11-11T23:59:59",
            "idea_deadline": "2026-11-11T23:59:59",
            "themes": json.dumps([
                "Generative AI", "Health & Biotech", "Security & Surveillance", 
                "E-Commerce", "Clean & Green Technology", "Smart Automation", 
                "Blockchain & Cryptography", "Game Development", "Circuit Design", 
                "Embedded Systems", "Defense Technologies", "Next-Generation Communication", 
                "Sustainable Development", "Open Innovation (Any Real-World Problem)"
            ])
        }
        for key, val in defaults.items():
            db_setting = db.query(models.Settings).filter_by(key=key).first()
            if not db_setting:
                db.add(models.Settings(key=key, value=val))
        # Ensure deprecated goavo_link is removed from DB
        db.query(models.Settings).filter_by(key="goavo_link").delete()
        db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title="TECH HORIZON 2.0 Hackathon Portal Backend",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to generate Team ID
def generate_team_id(db: Session) -> str:
    # Query the database for the team with the highest Team ID matching the prefix
    last_team = db.query(models.Team).filter(models.Team.id.like("TH26-%")).order_by(desc(models.Team.id)).first()
    if not last_team:
        return "TH26-0001"
    try:
        last_num = int(last_team.id.split("-")[1])
        new_num = last_num + 1
        return f"TH26-{new_num:04d}"
    except (IndexError, ValueError):
        return "TH26-0001"

# --- PUBLIC ROUTERS ---

@app.get("/api/settings", response_model=List[schemas.SettingsOut])
def get_settings(db: Session = Depends(get_db)):
    return db.query(models.Settings).all()

# Admin Login
@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    if form_data.username != config.ADMIN_USERNAME or not auth.verify_password(form_data.password, config.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Username or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Team Registration
@app.post("/api/registration", response_model=schemas.TeamOut)
def register_team(payload: schemas.TeamCreate, db: Session = Depends(get_db)):
    # 0. Enforce minimum team size of 3
    if len(payload.members) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team must have at least 3 members. Teams with fewer than 3 members cannot be registered."
        )

    # 1. Check duplicate Email or WhatsApp numbers
    for m in payload.members:
        dup_p = db.query(models.Participant).filter(
            or_(
                models.Participant.email == m.email,
                models.Participant.whatsapp == m.whatsapp
            )
        ).first()
        if dup_p:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email or WhatsApp number '{m.email}' / '{m.whatsapp}' is already registered."
            )
            
    # 2. Generate Team ID
    team_id = generate_team_id(db)
    
    # 3. Create Team
    db_team = models.Team(
        id=team_id,
        team_name=payload.team_name,
        selected_theme=payload.selected_theme,
        accommodation_required=payload.accommodation_required,
        referral_source=payload.referral_source,
        additional_comments=payload.additional_comments,
        registration_status="Completed",
        verification_status="Pending",
        ticket_status="Confirmed",
        idea_submission_status="Not Submitted"
    )
    db.add(db_team)
    
    # 4. Create structured members
    lead_email = None
    lead_name = None
    lead_state = None
    lead_city = None
    if payload.members:
        lead_state = payload.members[0].state
        lead_city = payload.members[0].city

    for idx, m in enumerate(payload.members):
        p_state = m.state if (m.state and m.state.strip()) else (lead_state or "N/A")
        p_city = m.city if (m.city and m.city.strip()) else (lead_city or "N/A")
        
        db_p = models.Participant(
            team_id=team_id,
            name=m.name,
            gender=m.gender,
            email=m.email,
            whatsapp=m.whatsapp,
            linkedin=m.linkedin,
            college=m.college,
            designation=m.designation,
            grad_year_sem=m.grad_year_sem,
            state=p_state,
            city=p_city,
            is_ieee_member=m.is_ieee_member,
            ieee_id_proof_link=m.ieee_id_proof_link,
            college_id_proof_link=m.college_id_proof_link,
            member_index=idx + 1
        )
        db.add(db_p)
        if idx == 0:
            lead_email = m.email
            lead_name = m.name
            
    # 5. Add initial Admin Note
    initial_note = models.AdminNote(
        team_id=team_id,
        note_text="System: Team registered successfully."
    )
    db.add(initial_note)

    db.commit()
    db.refresh(db_team)

    # 6. Send automatic confirmation email
    if lead_email:
        try:
            email_service.send_registration_email(db, lead_email, db_team.team_name, team_id, lead_name)
        except Exception:
            pass  # Suppress SMTP sending errors so registration doesn't fail

    return db_team

# Team Verification Form Submission
@app.post("/api/verification", response_model=schemas.VerificationOut)
def verify_participants(payload: schemas.VerificationCreate, db: Session = Depends(get_db)):
    # Check if team exists
    team = db.query(models.Team).filter_by(id=payload.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team ID not found."
        )
        
    # Check if verification already exists – block re-submission
    v = db.query(models.Verification).filter_by(team_id=payload.team_id).first()
    if v:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID Verification has already been submitted for this Team ID. Multiple submissions are not allowed."
        )
    # Create new verification record (first-time only, re-submissions are blocked above)
    v = models.Verification(
        team_id=payload.team_id,
        team_lead_name=payload.team_lead_name,
        company_college=payload.company_college,
        team_name=payload.team_name,
        team_size=payload.team_size,
        ieee_members_count=payload.ieee_members_count,
        non_ieee_members_count=payload.non_ieee_members_count,
        member1_link=payload.member1_link,
        member2_link=payload.member2_link,
        member3_link=payload.member3_link,
        member4_link=payload.member4_link,
        member5_link=payload.member5_link,
        member6_link=payload.member6_link,
        remarks=payload.remarks
    )
    db.add(v)
        
    # Set status
    team.verification_status = "Under Review"
    
    # Add Admin Note
    db.add(models.AdminNote(
        team_id=payload.team_id,
        note_text="System: Verification files submitted/updated."
    ))
    
    db.commit()
    db.refresh(v)
    
    # Send verification notification email to lead
    lead = next((p for p in team.participants if p.member_index == 1), None)
    if lead:
        try:
            email_service.send_verification_submission_email(db, lead.email, team.team_name, team.id)
        except Exception:
            pass

    return v

# Project Idea Submit
@app.post("/api/project-idea/submit")
def submit_project_idea(payload: schemas.ProjectIdeaSubmit, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=payload.team_id.strip()).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team ID not found."
        )

    # Block duplicate project idea submissions
    if team.idea_submission_status == "Submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project Idea has already been submitted for this Team ID. Multiple submissions are not allowed."
        )

    now = datetime.now()
    team.project_idea_link = payload.project_idea_link.strip()
    team.project_idea_date = now.strftime("%Y-%m-%d")
    team.project_idea_time = now.strftime("%H:%M:%S")
    team.idea_submission_status = "Submitted"
    team.project_idea_verification_status = "Pending Review"
    
    # Add Note
    db.add(models.AdminNote(
        team_id=team.id,
        note_text=f"System: Project Idea submitted. Link: {payload.project_idea_link}"
    ))
    db.commit()
    db.refresh(team)
    return {"message": "Project Idea Submitted Successfully"}

# Check Project Idea Status
@app.get("/api/project-idea/status/{search_query}")
def check_project_idea_status(search_query: str, db: Session = Depends(get_db)):
    # Search by Team ID or Team Name
    team = db.query(models.Team).filter(
        or_(
            models.Team.id == search_query.strip(),
            models.Team.team_name.ilike(search_query.strip())
        )
    ).first()
    
    if not team:
        # Try finding lead's email or member's email as backup
        team = db.query(models.Team).join(models.Participant).filter(
            or_(
                models.Participant.email == search_query.strip()
            )
        ).first()
        
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found matching the Team ID or Name."
        )
    
    lead = next((p for p in team.participants if p.member_index == 1), None)
    return {
        "id": team.id,
        "team_name": team.team_name,
        "lead_name": lead.name if lead else "N/A",
        "college": lead.college if lead else "N/A",
        "selected_theme": team.selected_theme,
        "team_size": len(team.participants),
        "idea_submission_status": team.idea_submission_status,
        "project_idea_verification_status": team.project_idea_verification_status or "Pending Review",
        "project_idea_remarks": team.project_idea_remarks or ""
    }

# Search Team Status
@app.get("/api/status/{search_query}", response_model=schemas.TeamOut)
def check_status(search_query: str, db: Session = Depends(get_db)):
    # Search by Team ID or Lead Email
    team = db.query(models.Team).join(models.Participant).filter(
        or_(
            models.Team.id == search_query.strip(),
            models.Participant.email == search_query.strip()
        )
    ).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found matching the Team ID or Email."
        )
    return team

# --- SECURE ADMIN ROUTERS ---

@app.get("/api/admin/dashboard", dependencies=[Depends(auth.get_current_user)])
def get_dashboard_data(db: Session = Depends(get_db)):
    # Core widget stats
    total_registrations = db.query(models.Participant).count()
    total_teams = db.query(models.Team).count()
    verified_teams = db.query(models.Team).filter_by(verification_status="Approved").count()
    pending_verification = db.query(models.Team).filter(models.Team.verification_status.in_(["Pending", "Under Review", "Needs Correction"])).count()
    rejected_teams = db.query(models.Team).filter_by(verification_status="Rejected").count()
    accommodation_requests = db.query(models.Team).filter_by(accommodation_required=True).count()
    
    ieee_members = db.query(models.Participant).filter_by(is_ieee_member=True).count()
    non_ieee_members = total_registrations - ieee_members
    
    idea_submitted = db.query(models.Team).filter_by(idea_submission_status="Submitted").count()
    idea_pending = db.query(models.Team).filter(models.Team.idea_submission_status != "Submitted").count()
    idea_verified = db.query(models.Team).filter_by(project_idea_verification_status="Verified").count()
    idea_rejected = db.query(models.Team).filter_by(project_idea_verification_status="Rejected").count()
    idea_pending_review = db.query(models.Team).filter_by(project_idea_verification_status="Pending Review").count()
    
    # Registrations created today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_registrations = db.query(models.Team).filter(models.Team.created_at >= today_start).count()
    
    # Popular themes
    theme_counts = db.query(models.Team.selected_theme, func.count(models.Team.id)).group_by(models.Team.selected_theme).order_by(desc(func.count(models.Team.id))).all()
    popular_theme = theme_counts[0][0] if theme_counts else "N/A"
    
    # Dynamic counts
    total_colleges = db.query(models.Participant.college).distinct().count()
    total_states = db.query(models.Participant.state).distinct().count()
    
    avg_team_size = db.query(func.avg(models.Team.id)).select_from(models.Team).scalar() # fallback
    # Correct calculation: total participants / total teams
    avg_team_size = round(total_registrations / total_teams, 1) if total_teams > 0 else 0
    
    # Recent lists
    recent_registrations = db.query(models.Team).order_by(desc(models.Team.created_at)).limit(5).all()
    recent_verifications = db.query(models.Verification).order_by(desc(models.Verification.created_at)).limit(5).all()
    recent_approved = db.query(models.Team).filter_by(verification_status="Approved").order_by(desc(models.Team.updated_at)).limit(5).all()
    
    # Trends - dialect-aware grouping
    if db.bind.dialect.name == "sqlite":
        daily_registrations = db.query(
            func.strftime('%Y-%m-%d', models.Team.created_at).label('date'),
            func.count(models.Team.id).label('count')
        ).group_by('date').order_by('date').all()
        trend_data = []
        for r in daily_registrations:
            try:
                date_str = datetime.strptime(r[0], "%Y-%m-%d").strftime("%b %d")
            except Exception:
                date_str = str(r[0])
            trend_data.append({"date": date_str, "count": r[1]})
    else:
        daily_registrations = db.query(
            func.date_trunc('day', models.Team.created_at).label('date'),
            func.count(models.Team.id).label('count')
        ).group_by('date').order_by('date').all()
        trend_data = [{"date": str(r[0].strftime("%b %d")), "count": r[1]} for r in daily_registrations]

    
    return {
        "widgets": {
            "totalRegistrations": total_registrations,
            "totalTeams": total_teams,
            "verifiedTeams": verified_teams,
            "pendingVerification": pending_verification,
            "rejectedTeams": rejected_teams,
            "accommodationRequests": accommodation_requests,
            "ieeeMembers": ieee_members,
            "nonIeeeMembers": non_ieee_members,
            "ideaSubmitted": idea_submitted,
            "ideaPending": idea_pending,
            "ideaVerified": idea_verified,
            "ideaRejected": idea_rejected,
            "ideaPendingReview": idea_pending_review,
            "todaysRegistrations": todays_registrations,
            "popularTheme": popular_theme,
            "totalColleges": total_colleges,
            "totalStates": total_states,
            "avgTeamSize": avg_team_size
        },
        "recent": {
            "registrations": [
                {
                    "id": t.id,
                    "team_name": t.team_name,
                    "lead_name": next((p.name for p in t.participants if p.member_index == 1), "N/A"),
                    "created_at": t.created_at
                } for t in recent_registrations
            ],
            "verifications": [
                {
                    "team_id": v.team_id,
                    "team_name": v.team_name,
                    "lead_name": v.team_lead_name,
                    "created_at": v.created_at
                } for v in recent_verifications
            ],
            "approved": [
                {
                    "id": t.id,
                    "team_name": t.team_name,
                    "lead_name": next((p.name for p in t.participants if p.member_index == 1), "N/A"),
                    "updated_at": t.updated_at
                } for t in recent_approved
            ]
        },
        "charts": {
            "registrationTrend": trend_data,
            "themeDistribution": [{"name": tc[0], "value": tc[1]} for tc in theme_counts[:5]],
            "stateDistribution": [{"name": sc[0], "value": sc[1]} for sc in db.query(models.Participant.state, func.count(models.Participant.id)).filter(models.Participant.member_index == 1).group_by(models.Participant.state).limit(5).all()],
            "collegeDistribution": [{"name": cc[0], "value": cc[1]} for cc in db.query(models.Participant.college, func.count(models.Participant.id)).filter(models.Participant.member_index == 1).group_by(models.Participant.college).limit(5).all()]
        }
    }

# Update Settings
@app.put("/api/admin/settings/{key}", dependencies=[Depends(auth.get_current_user)])
def update_setting(key: str, payload: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    setting = db.query(models.Settings).filter_by(key=key).first()
    if not setting:
        setting = models.Settings(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    return {"message": f"Setting {key} updated successfully."}

# Get Teams list with query options
@app.get("/api/admin/teams", response_model=List[schemas.TeamOut], dependencies=[Depends(auth.get_current_user)])
def list_teams(
    db: Session = Depends(get_db),
    status: str = None,
    theme: str = None,
    search: str = None
):
    query = db.query(models.Team)
    
    if status:
        query = query.filter(models.Team.verification_status == status)
    if theme:
        query = query.filter(models.Team.selected_theme == theme)
    if search:
        search = f"%{search.strip()}%"
        query = query.join(models.Participant).filter(
            or_(
                models.Team.id.ilike(search),
                models.Team.team_name.ilike(search),
                models.Participant.name.ilike(search),
                models.Participant.email.ilike(search),
                models.Participant.whatsapp.ilike(search),
                models.Participant.college.ilike(search),
                models.Participant.state.ilike(search)
            )
        ).distinct()
        
    return query.order_by(desc(models.Team.created_at)).all()

# Get Single Team Detail
@app.get("/api/admin/teams/{team_id}", response_model=schemas.TeamOut, dependencies=[Depends(auth.get_current_user)])
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    return team

# Edit Team & Members (Admin Update)
@app.put("/api/admin/teams/{team_id}", response_model=schemas.TeamOut, dependencies=[Depends(auth.get_current_user)])
def edit_team(team_id: str, payload: schemas.TeamEditRequest, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
        
    # Capture status changes for emails
    old_verification_status = team.verification_status

    # Update team details
    team.team_name = payload.team_name
    team.selected_theme = payload.selected_theme
    team.accommodation_required = payload.accommodation_required
    team.referral_source = payload.referral_source
    team.additional_comments = payload.additional_comments
    team.registration_status = payload.registration_status
    team.verification_status = payload.verification_status
    team.ticket_status = payload.ticket_status
    team.idea_submission_status = payload.idea_submission_status
    team.project_idea_link = payload.project_idea_link
    team.project_idea_date = payload.project_idea_date
    team.project_idea_time = payload.project_idea_time
    team.project_idea_verification_status = payload.project_idea_verification_status
    team.project_idea_remarks = payload.project_idea_remarks

    # Update members details
    for pm in payload.participants:
        db_member = db.query(models.Participant).filter_by(id=pm.id, team_id=team_id).first()
        if db_member:
            db_member.name = pm.name
            db_member.gender = pm.gender
            db_member.email = pm.email
            db_member.whatsapp = pm.whatsapp
            db_member.linkedin = pm.linkedin
            db_member.college = pm.college
            db_member.designation = pm.designation
            db_member.grad_year_sem = pm.grad_year_sem
            db_member.state = pm.state
            db_member.city = pm.city
            db_member.is_ieee_member = pm.is_ieee_member
            db_member.ieee_id_proof_link = pm.ieee_id_proof_link
            db_member.college_id_proof_link = pm.college_id_proof_link

    # Update verification link details if submitted
    if payload.verification:
        v = db.query(models.Verification).filter_by(team_id=team_id).first()
        pv = payload.verification
        if v:
            v.team_lead_name = pv.team_lead_name
            v.company_college = pv.company_college
            v.team_name = pv.team_name
            v.team_size = pv.team_size
            v.ieee_members_count = pv.ieee_members_count
            v.non_ieee_members_count = pv.non_ieee_members_count
            v.member1_link = pv.member1_link
            v.member2_link = pv.member2_link
            v.member3_link = pv.member3_link
            v.member4_link = pv.member4_link
            v.member5_link = pv.member5_link
            v.member6_link = pv.member6_link
            v.remarks = pv.remarks
            
    # Audit trail note
    db.add(models.AdminNote(
        team_id=team_id,
        note_text=f"Admin: Team details modified. Verification status: {team.verification_status}."
    ))

    db.commit()
    db.refresh(team)

    # Trigger automatic status update emails if the verification status changed
    if old_verification_status != team.verification_status:
        lead = next((p for p in team.participants if p.member_index == 1), None)
        if lead:
            try:
                if team.verification_status == "Approved":
                    email_service.send_verification_approved_email(db, lead.email, team.team_name, team.id)
                elif team.verification_status == "Rejected":
                    email_service.send_verification_rejected_email(db, lead.email, team.team_name, team.id, payload.additional_comments or "")
                elif team.verification_status == "Needs Correction":
                    email_service.send_correction_request_email(db, lead.email, team.team_name, team.id, payload.additional_comments or "")
            except Exception:
                pass

    return team

# Add Admin Note
@app.post("/api/admin/teams/{team_id}/notes", response_model=schemas.AdminNoteOut, dependencies=[Depends(auth.get_current_user)])
def add_admin_note(team_id: str, payload: schemas.AdminNoteCreate, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
        
    db_note = models.AdminNote(
        team_id=team_id,
        note_text=payload.note_text
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# Get Note history
@app.get("/api/admin/teams/{team_id}/notes", response_model=List[schemas.AdminNoteOut], dependencies=[Depends(auth.get_current_user)])
def get_admin_notes(team_id: str, db: Session = Depends(get_db)):
    return db.query(models.AdminNote).filter_by(team_id=team_id).order_by(desc(models.AdminNote.created_at)).all()

# Project Idea Verification endpoint
@app.put("/api/admin/project-idea/verify/{team_id}", dependencies=[Depends(auth.get_current_user)])
def verify_project_idea(team_id: str, payload: schemas.ProjectIdeaVerifyRequest, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
        
    team.project_idea_verification_status = payload.status
    if payload.status == "Rejected":
        team.project_idea_remarks = payload.remarks
    else:
        team.project_idea_remarks = ""
        
    # Log to notes
    db.add(models.AdminNote(
        team_id=team_id,
        note_text=f"Admin: Project Idea status updated to {payload.status}. Remarks: {payload.remarks or 'None'}"
    ))
    db.commit()
    db.refresh(team)
    return team

# Download Registration Excel File (EXCEL 1)
@app.get("/api/admin/export/excel/registration", dependencies=[Depends(auth.get_current_user)])
def export_excel_registration(db: Session = Depends(get_db)):
    excel_stream = excel_export.generate_registration_excel(db)
    filename = f"TECH_HORIZON_Registration_Details_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        excel_stream,
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

# Download Project Idea Excel File (EXCEL 2)
@app.get("/api/admin/export/excel/project-idea", dependencies=[Depends(auth.get_current_user)])
def export_excel_project_idea(db: Session = Depends(get_db)):
    excel_stream = excel_export.generate_project_idea_excel(db)
    filename = f"TECH_HORIZON_Project_Idea_Submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        excel_stream,
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

# Download CSV Registration Export
@app.get("/api/admin/export/csv/registration", dependencies=[Depends(auth.get_current_user)])
def export_csv_registration(db: Session = Depends(get_db)):
    csv_str = excel_export.generate_registration_csv(db)
    filename = f"TECH_HORIZON_Registration_Details_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Download CSV Project Idea Export
@app.get("/api/admin/export/csv/project-idea", dependencies=[Depends(auth.get_current_user)])
def export_csv_project_idea(db: Session = Depends(get_db)):
    csv_str = excel_export.generate_project_idea_csv(db)
    filename = f"TECH_HORIZON_Project_Idea_Submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# JSON Database Backup
@app.get("/api/admin/export/backup", dependencies=[Depends(auth.get_current_user)])
def export_json_backup(db: Session = Depends(get_db)):
    json_str = excel_export.generate_json_backup(db)
    filename = f"TECH_HORIZON_DB_Backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Trigger Manual Email Alerts
@app.post("/api/admin/teams/{team_id}/email", dependencies=[Depends(auth.get_current_user)])
def trigger_manual_email(
    team_id: str,
    email_type: str,  # reminder, approval, correction, rejection
    remarks: str = "",
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).filter_by(id=team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    
    lead = next((p for p in team.participants if p.member_index == 1), None)
    if not lead:
        raise HTTPException(status_code=400, detail="Team Lead details missing.")

    try:
        if email_type == "approval":
            email_service.send_verification_approved_email(db, lead.email, team.team_name, team.id)
            team.verification_status = "Approved"
        elif email_type == "correction":
            email_service.send_correction_request_email(db, lead.email, team.team_name, team.id, remarks)
            team.verification_status = "Needs Correction"
        elif email_type == "rejection":
            email_service.send_verification_rejected_email(db, lead.email, team.team_name, team.id, remarks)
            team.verification_status = "Rejected"
        elif email_type == "reminder":
            # Send general reminder to complete verification
            email_service.send_registration_email(db, lead.email, team.team_name, team.id, lead.name)
        
        # Log to DB Notes
        db.add(models.AdminNote(
            team_id=team_id,
            note_text=f"System: Sent manual {email_type} email. Remarks: {remarks}"
        ))
        db.commit()
        return {"message": f"Email '{email_type}' sent to {lead.email}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# Get System Logs of Sent Emails
@app.get("/api/admin/emails", response_model=List[schemas.AdminNoteOut], dependencies=[Depends(auth.get_current_user)])
def get_sent_emails(db: Session = Depends(get_db)):
    # Fetch all sent email logs
    logs = db.query(models.SentEmail).order_by(desc(models.SentEmail.sent_at)).all()
    # Serialize to note schema for easy viewing in front
    return [
        schemas.AdminNoteOut(
            id=l.id,
            team_id=l.recipient,
            note_text=f"Subject: {l.subject} | Status: {l.status} | Time: {l.sent_at.strftime('%Y-%m-%d %H:%M:%S')}",
            created_at=l.created_at,
            updated_at=l.updated_at
        ) for l in logs
    ]
