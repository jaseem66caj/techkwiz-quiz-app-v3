import hashlib
import os
import secrets
import smtplib
import ssl
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


class EmailService:
    def __init__(self):
        # Email configuration
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_username = os.getenv("EMAIL_USERNAME", "")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.email_username)

    async def send_password_reset_email(
        self, to_email: str, reset_token: str, admin_username: str
    ):
        """Send password reset email to admin."""
        try:
            # Create reset URL
            reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/admin/reset-password?token={reset_token}"

            # Email content
            subject = "TechKwiz Admin - Password Reset Request"

            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">TechKwiz Admin</h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0 0;">Password Reset Request</p>
                </div>
                
                <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #334155; margin-top: 0;">Hello {admin_username},</h2>
                    
                    <p style="color: #64748b; line-height: 1.6;">
                        We received a request to reset your password for the TechKwiz Admin Dashboard. 
                        If you made this request, click the button below to reset your password.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  text-decoration: none; 
                                  padding: 15px 30px; 
                                  border-radius: 8px; 
                                  font-weight: bold; 
                                  display: inline-block;
                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                            Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
                        This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
                        you can safely ignore this email.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                    
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        TechKwiz Admin Dashboard<br>
                        This is an automated email, please do not reply.
                    </p>
                </div>
            </body>
            </html>
            """

            text_content = f"""
            TechKwiz Admin - Password Reset Request
            
            Hello {admin_username},
            
            We received a request to reset your password for the TechKwiz Admin Dashboard.
            If you made this request, visit the following link to reset your password:
            
            {reset_url}
            
            This link will expire in 1 hour for security reasons.
            
            If you didn't request this password reset, you can safely ignore this email.
            
            TechKwiz Admin Dashboard
            """

            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email

            # Add both plain text and HTML versions
            text_part = MIMEText(text_content, "plain")
            html_part = MIMEText(html_content, "html")

            message.attach(text_part)
            message.attach(html_part)

            # Send email
            await self._send_email(to_email, message)
            return True

        except Exception as e:
            print(f"Failed to send password reset email: {e}")
            return False

    async def _send_email(self, to_email: str, message: MIMEMultipart):
        """Send email using SMTP."""
        # For now, we'll log the email content since we don't have SMTP credentials
        # In production, this would actually send the email

        print("=" * 50)
        print("PASSWORD RESET EMAIL WOULD BE SENT:")
        print(f"To: {to_email}")
        print(f"Subject: {message['Subject']}")
        print("Content:")
        print(message.as_string())
        print("=" * 50)

        # TODO: Uncomment and configure when SMTP credentials are available
        # context = ssl.create_default_context()
        # with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
        #     server.starttls(context=context)
        #     server.login(self.email_username, self.email_password)
        #     server.send_message(message)


def generate_reset_token():
    """Generate a secure reset token."""
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str):
    """Hash the reset token for database storage."""
    return hashlib.sha256(token.encode()).hexdigest()
