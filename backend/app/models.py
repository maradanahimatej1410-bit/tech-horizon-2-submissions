# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime, func
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from .database import Base

class Settings(Base):
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Team(Base):
    __tablename__ = "teams"

    id = Column(String(50), primary_key=True, index=True)  # Format: TH26-XXXX
    team_name = Column(String(150), nullable=False)  # Not unique per requirements
    selected_theme = Column(String(100), nullable=False)
    accommodation_required = Column(Boolean, default=False)
    referral_source = Column(String(100), nullable=False)
    additional_comments = Column(Text, nullable=True)
    
    registration_status = Column(String(50), default="Completed")
    verification_status = Column(String(50), default="Pending")  # Pending, Under Review, Approved, Rejected, Needs Correction
    ticket_status = Column(String(50), default="Confirmed")  # Default to Confirmed after registration
    idea_submission_status = Column(String(50), default="Not Submitted")  # Not Submitted, Submitted
    
    # New Project Idea details
    project_idea_link = Column(String(255), nullable=True)
    project_idea_date = Column(String(50), nullable=True)
    project_idea_time = Column(String(50), nullable=True)
    project_idea_verification_status = Column(String(50), default="Pending Review")
    project_idea_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    participants = relationship("Participant", back_populates="team", cascade="all, delete-orphan")
    verification = relationship("Verification", back_populates="team", uselist=False, cascade="all, delete-orphan")
    notes = relationship("AdminNote", back_populates="team", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String(50), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(150), nullable=False)
    gender = Column(String(50), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    whatsapp = Column(String(50), unique=True, index=True, nullable=False)
    linkedin = Column(String(255), nullable=True)
    college = Column(String(255), nullable=False)
    designation = Column(String(100), nullable=False)
    grad_year_sem = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    
    is_ieee_member = Column(Boolean, default=False)
    ieee_id_proof_link = Column(String(255), nullable=True)  # Drive link or N/A
    college_id_proof_link = Column(String(255), nullable=True)  # Drive link or N/A
    member_index = Column(Integer, nullable=False)  # 1 = Team Lead, 2-6 = Members

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    team = relationship("Team", back_populates="participants")

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String(50), ForeignKey("teams.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    team_lead_name = Column(String(150), nullable=False)
    company_college = Column(String(255), nullable=False)
    team_name = Column(String(150), nullable=False)
    team_size = Column(Integer, nullable=False)
    
    ieee_members_count = Column(String(50), nullable=False)  # supports N/A or count
    non_ieee_members_count = Column(String(50), nullable=False)  # supports N/A or count
    
    # Drive links for verification (Member 1 - 6)
    member1_link = Column(String(255), nullable=False)
    member2_link = Column(String(255), nullable=False)
    member3_link = Column(String(255), nullable=False)
    member4_link = Column(String(255), nullable=True)  # Conditional/Optional
    member5_link = Column(String(255), nullable=True)  # Conditional/Optional
    member6_link = Column(String(255), nullable=True)  # Conditional/Optional
    
    remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    team = relationship("Team", back_populates="verification")

class AdminNote(Base):
    __tablename__ = "admin_notes"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String(50), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    note_text = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    team = relationship("Team", back_populates="notes")

class SentEmail(Base):
    __tablename__ = "sent_emails"

    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="Sent")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
