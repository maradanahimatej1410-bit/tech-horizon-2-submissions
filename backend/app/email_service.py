import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from . import models
from .config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, DEFAULT_EVENT_NAME, DEFAULT_WEBSITE_LINK

def log_and_send_email(db: Session, recipient: str, subject: str, body_html: str):
    # Always log to database
    db_email = models.SentEmail(
        recipient=recipient,
        subject=subject,
        body=body_html,
        status="Pending"
    )
    db.add(db_email)
    db.commit()
    db.refresh(db_email)

    # Check if SMTP is configured
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        # If not configured, mark as Logged (local simulation)
        db_email.status = "Logged (No SMTP Configured)"
        db.commit()
        return

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = recipient

        # Attach HTML body
        part = MIMEText(body_html, "html")
        msg.attach(part)

        # Connect and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, recipient, msg.as_string())
        
        db_email.status = "Sent Successfully"
        db.commit()
    except Exception as e:
        db_email.status = f"Failed: {str(e)}"
        db.commit()

# --- HTML TEMPLATES ---

def send_registration_email(db: Session, recipient: str, team_name: str, team_id: str, lead_name: str):
    subject = f"🚀 Team Registration Completed - {DEFAULT_EVENT_NAME}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #0066cc; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">🚀 TECH HORIZON 2.0</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">National Level 48-Hour Hackathon</p>
            </div>
            <div style="padding: 24px;">
                <p>Hello <strong>{lead_name}</strong>,</p>
                <p>Congratulations! Your team <strong>{team_name}</strong> has successfully completed the registration process for TECH HORIZON 2.0.</p>
                
                <div style="background-color: #f7fafc; border-left: 4px solid #0066cc; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-weight: bold; color: #2d3748;">Your Unique Team ID: <span style="color: #0066cc; font-size: 18px;">{team_id}</span></p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #718096;">Please save this Team ID for all future communications, status checks, and verification.</p>
                </div>

                <h3 style="color: #2d3748; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">Next Step: Participant Verification</h3>
                <p>To finalize your participation, your team must complete the **Participant Verification Form** immediately using your Team ID.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://ieeetechhorizon.gt.tc/verify?team_id={team_id}" 
                       style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                       Complete Verification Form
                    </a>
                </div>

                <p style="font-size: 13px; color: #718096;">If the button above does not work, copy and paste this link: <br>
                <a href="https://ieeetechhorizon.gt.tc/verify?team_id={team_id}">https://ieeetechhorizon.gt.tc/verify?team_id={team_id}</a></p>

                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">IEEE SMC GNITC Student Branch Chapter<br>Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad</p>
            </div>
        </div>
    </body>
    </html>
    """
    log_and_send_email(db, recipient, subject, body)

def send_verification_submission_email(db: Session, recipient: str, team_name: str, team_id: str):
    subject = f"📋 Verification Proofs Submitted - {DEFAULT_EVENT_NAME}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #0066cc; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">📋 TECH HORIZON 2.0</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">National Level 48-Hour Hackathon</p>
            </div>
            <div style="padding: 24px;">
                <p>Hello Team <strong>{team_name}</strong>,</p>
                <p>This is to confirm that we have received your participant verification proofs (IEEE ID/College ID links) for Team ID: <strong>{team_id}</strong>.</p>
                <p>Our organizing team is currently reviewing your submitted details and links. This process typically takes 24-48 hours. You will receive an email update once verified.</p>
                
                <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-weight: bold; color: #2b6cb0;">Current Status: Under Review</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #4a5568;">You can track your team's live status here: <a href="https://ieeetechhorizon.gt.tc/status">Check Live Status</a></p>
                </div>

                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">IEEE SMC GNITC Student Branch Chapter<br>Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad</p>
            </div>
        </div>
    </body>
    </html>
    """
    log_and_send_email(db, recipient, subject, body)

def send_verification_approved_email(db: Session, recipient: str, team_name: str, team_id: str):
    subject = f"✅ Participant Verification Approved! - {DEFAULT_EVENT_NAME}"
    submit_idea_url = f"{DEFAULT_WEBSITE_LINK.rstrip('/')}/submit-idea"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #38a169; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">🎉 Verification Approved!</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">TECH HORIZON 2.0 National Hackathon</p>
            </div>
            <div style="padding: 24px;">
                <p>Hello Team <strong>{team_name}</strong>,</p>
                <p>Great news! Your team's participant verification proofs for Team ID: <strong>{team_id}</strong> have been reviewed and successfully **APPROVED** by the organizing committee. 🚀</p>
                
                <h3 style="color: #2d3748; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">Final Step: Submit Project Idea</h3>
                <p>Now, you must submit your project idea presentation (PDF format) directly on the website before <strong>11th November 2026</strong> to secure your slot.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{submit_idea_url}" 
                       style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                       Submit Project Idea
                    </a>
                </div>

                <p style="font-size: 13px; color: #718096;">If the link above does not work, use this: <br>
                <a href="{submit_idea_url}">{submit_idea_url}</a></p>

                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">IEEE SMC GNITC Student Branch Chapter<br>Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad</p>
            </div>
        </div>
    </body>
    </html>
    """
    log_and_send_email(db, recipient, subject, body)

def send_verification_rejected_email(db: Session, recipient: str, team_name: str, team_id: str, remarks: str):
    subject = f"❌ Verification Rejected - {DEFAULT_EVENT_NAME}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #e53e3e; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">❌ Verification Rejected</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">TECH HORIZON 2.0 National Hackathon</p>
            </div>
            <div style="padding: 24px;">
                <p>Hello Team <strong>{team_name}</strong>,</p>
                <p>Unfortunately, your participant verification proofs for Team ID: <strong>{team_id}</strong> were **REJECTED** by the organizing team.</p>
                
                <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-weight: bold; color: #c53030;">Reason / Remarks:</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">{remarks if remarks else 'Drive link permissions not set to public or incorrect documents submitted.'}</p>
                </div>

                <p>Please log in to the status checker and submit a correction, or contact the student coordinators immediately.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://ieeetechhorizon.gt.tc/status" 
                       style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                       Check Team Status
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">IEEE SMC GNITC Student Branch Chapter<br>Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad</p>
            </div>
        </div>
    </body>
    </html>
    """
    log_and_send_email(db, recipient, subject, body)

def send_correction_request_email(db: Session, recipient: str, team_name: str, team_id: str, remarks: str):
    subject = f"⚠️ Action Required: Verification Correction Needed - {DEFAULT_EVENT_NAME}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background-color: #dd6b20; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">⚠️ Verification Correction Required</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">TECH HORIZON 2.0 National Hackathon</p>
            </div>
            <div style="padding: 24px;">
                <p>Hello Team <strong>{team_name}</strong>,</p>
                <p>We need minor corrections to finalize your participant verification for Team ID: <strong>{team_id}</strong>.</p>
                
                <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-weight: bold; color: #dd6b20;">Required Corrections:</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">{remarks if remarks else 'Please ensure your Google Drive proof links are set to "Anyone with the link can view".'}</p>
                </div>

                <p>Kindly re-verify and update your verification links as soon as possible to proceed to project idea submission.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://ieeetechhorizon.gt.tc/verify?team_id={team_id}" 
                       style="background-color: #dd6b20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                       Update Verification Proofs
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">IEEE SMC GNITC Student Branch Chapter<br>Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad</p>
            </div>
        </div>
    </body>
    </html>
    """
    log_and_send_email(db, recipient, subject, body)
