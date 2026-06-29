# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Settings Schemas
class SettingsOut(BaseModel):
    key: str
    value: str
    model_config = ConfigDict(from_attributes=True)

class SettingsUpdate(BaseModel):
    value: str

# Participant Schemas
class ParticipantCreate(BaseModel):
    name: str = Field(..., min_length=1)
    gender: str
    email: EmailStr
    whatsapp: str = Field(..., min_length=8)
    linkedin: str
    college: str
    designation: str
    grad_year_sem: str
    state: str
    city: str
    is_ieee_member: bool
    ieee_id_proof_link: str  # Drive URL or "N/A"
    college_id_proof_link: str  # Drive URL or "N/A"

class ParticipantOut(BaseModel):
    id: int
    team_id: str
    name: str
    gender: Optional[str] = None
    email: str
    whatsapp: str
    linkedin: Optional[str]
    college: str
    designation: str
    grad_year_sem: str
    state: str
    city: str
    is_ieee_member: bool
    ieee_id_proof_link: Optional[str]
    college_id_proof_link: Optional[str]
    member_index: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Admin Note Schemas
class AdminNoteCreate(BaseModel):
    note_text: str

class AdminNoteOut(BaseModel):
    id: int
    team_id: str
    note_text: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Verification Schemas
class VerificationCreate(BaseModel):
    team_id: str
    team_lead_name: str
    company_college: str
    team_name: str
    team_size: int = Field(..., ge=1, le=6)
    ieee_members_count: str
    non_ieee_members_count: str
    member1_link: str
    member2_link: str
    member3_link: str
    member4_link: Optional[str] = "N/A"
    member5_link: Optional[str] = "N/A"
    member6_link: Optional[str] = "N/A"
    remarks: Optional[str] = None

class VerificationOut(BaseModel):
    id: int
    team_id: str
    team_lead_name: str
    company_college: str
    team_name: str
    team_size: int
    ieee_members_count: str
    non_ieee_members_count: str
    member1_link: str
    member2_link: str
    member3_link: str
    member4_link: Optional[str]
    member5_link: Optional[str]
    member6_link: Optional[str]
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Team Schemas
class TeamCreate(BaseModel):
    team_name: str
    selected_theme: str
    accommodation_required: bool
    referral_source: str
    additional_comments: Optional[str] = None
    members: List[ParticipantCreate]

class TeamOut(BaseModel):
    id: str
    team_name: str
    selected_theme: str
    accommodation_required: bool
    referral_source: str
    additional_comments: Optional[str]
    registration_status: str
    verification_status: str
    ticket_status: str
    idea_submission_status: str
    project_idea_link: Optional[str] = None
    project_idea_date: Optional[str] = None
    project_idea_time: Optional[str] = None
    project_idea_verification_status: Optional[str] = None
    project_idea_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantOut] = []
    verification: Optional[VerificationOut] = None
    notes: List[AdminNoteOut] = []

    model_config = ConfigDict(from_attributes=True)

# Admin Editing Participant Schema
class ParticipantEdit(BaseModel):
    id: int
    name: str
    gender: str
    email: str
    whatsapp: str
    linkedin: Optional[str] = None
    college: str
    designation: str
    grad_year_sem: str
    state: str
    city: str
    is_ieee_member: bool
    ieee_id_proof_link: Optional[str] = None
    college_id_proof_link: Optional[str] = None

# Admin Editing Team Schema
class TeamEditRequest(BaseModel):
    team_name: str
    selected_theme: str
    accommodation_required: bool
    referral_source: str
    additional_comments: Optional[str] = None
    registration_status: str
    verification_status: str
    ticket_status: str
    idea_submission_status: str
    project_idea_link: Optional[str] = None
    project_idea_date: Optional[str] = None
    project_idea_time: Optional[str] = None
    project_idea_verification_status: Optional[str] = None
    project_idea_remarks: Optional[str] = None
    participants: List[ParticipantEdit]
    verification: Optional[VerificationCreate] = None

# Project Idea Schemas
class ProjectIdeaSubmit(BaseModel):
    team_id: str
    project_idea_link: str

class ProjectIdeaVerifyRequest(BaseModel):
    status: str
    remarks: Optional[str] = None

