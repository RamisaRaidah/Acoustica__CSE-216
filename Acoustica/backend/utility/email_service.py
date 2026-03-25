import smtplib
import ssl
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_password_reset_email(to_email: str, reset_link: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Reset Your Password"
        message["From"] = GMAIL_USER
        message["To"] = to_email

        html = f"""
        <html><body style="font-family: 'DM Sans', sans-serif; color: #1a1a1a; padding: 2rem;">
            <h2 style="font-family: 'Playfair Display', serif;">Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
            <a href="{reset_link}" style="
                background-color: #e07b2a;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
                margin: 1rem 0;
            ">Reset Password</a>
            <p style="color: #888; font-size: 0.85rem;">If you didn't request this, you can safely ignore this email.</p>
        </body></html>
        """

        message.attach(MIMEText(html, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, message.as_string())

        return True

    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return False