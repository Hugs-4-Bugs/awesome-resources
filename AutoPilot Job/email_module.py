"""
Email module for sending CV and follow-up emails
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta
from typing import Optional, List
import os
import config
from database import JobDatabase


class EmailManager:
    def __init__(self, db: JobDatabase):
        self.db = db
        self.email_config = config.EMAIL_CONFIG
        self.followup_config = config.FOLLOWUP_CONFIG

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        attachment_path: Optional[str] = None,
        cc: Optional[List[str]] = None
    ) -> bool:
        """Send an email with optional attachment"""
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{self.email_config['sender_name']} <{self.email_config['sender_email']}>"
            msg['To'] = to_email
            if cc:
                msg['Cc'] = ', '.join(cc)
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            # Attach resume if provided
            if attachment_path and os.path.exists(attachment_path):
                with open(attachment_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {os.path.basename(attachment_path)}'
                    )
                    msg.attach(part)

            # Connect to server and send
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            if self.email_config['enable_tls']:
                server.starttls()
            server.login(self.email_config['sender_email'], self.email_config['sender_password'])
            
            recipients = [to_email]
            if cc:
                recipients.extend(cc)
            
            server.send_message(msg)
            server.quit()

            self.db.add_log("SUCCESS", f"Email sent to {to_email}: {subject}", "email")
            return True

        except Exception as e:
            self.db.add_log("ERROR", f"Failed to send email to {to_email}: {str(e)}", "email")
            return False

    def send_cv_to_hr(
        self,
        hr_email: str,
        company: str,
        job_title: str,
        job_description: str = "",
        custom_message: str = ""
    ) -> bool:
        """Send CV to HR email with tailored message"""
        user_profile = config.USER_PROFILE

        # Generate tailored message using LLM if available
        if not custom_message:
            custom_message = self._generate_email_message(job_title, company, job_description)

        subject = f"Application for {job_title} Position at {company}"

        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear Hiring Manager,</p>
            
            <p>{custom_message}</p>
            
            <p>I have attached my resume for your review. I am excited about the opportunity to contribute to {company} 
            and would welcome the chance to discuss how my skills and experience align with your needs.</p>
            
            <p><strong>Key Highlights:</strong></p>
            <ul>
                <li>{user_profile['experience_years']}+ years of experience as a {user_profile['role']}</li>
                <li>Expertise in {', '.join(user_profile['skills'][:5])}</li>
                <li>Proven track record in developing scalable backend solutions</li>
            </ul>
            
            <p>I am available for an interview at your convenience and can be reached at:</p>
            <ul>
                <li>Email: {user_profile['email']}</li>
                <li>Phone: {user_profile['phone']}</li>
                <li>Portfolio: <a href="{user_profile['portfolio']}">{user_profile['portfolio']}</a></li>
            </ul>
            
            <p>Thank you for considering my application.</p>
            
            <p>Best regards,<br>
            {user_profile['name']}<br>
            {user_profile['phone']}<br>
            {user_profile['email']}</p>
        </body>
        </html>
        """

        resume_path = config.RESUME_PATHS.get("default", "resumes/resume_default.pdf")
        return self.send_email(hr_email, subject, body, attachment_path=resume_path)

    def send_followup_email(
        self,
        hr_email: str,
        company: str,
        job_title: str,
        days_since_application: int
    ) -> bool:
        """Send follow-up email"""
        user_profile = config.USER_PROFILE

        subject = f"Follow-up: Application for {job_title} Position at {company}"

        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear Hiring Manager,</p>
            
            <p>I hope this email finds you well. I wanted to follow up on my application for the {job_title} position 
            at {company}, which I submitted {days_since_application} days ago.</p>
            
            <p>I remain very interested in this opportunity and would be grateful for any update on the status of my 
            application. I am confident that my {user_profile['experience_years']}+ years of experience in Java backend 
            development and my expertise with Spring Boot, Hibernate, and AWS would make me a valuable addition to your team.</p>
            
            <p>I have attached my resume again for your convenience. Please let me know if you need any additional 
            information or if there's a convenient time for us to discuss this opportunity further.</p>
            
            <p>Thank you for your time and consideration.</p>
            
            <p>Best regards,<br>
            {user_profile['name']}<br>
            {user_profile['phone']}<br>
            {user_profile['email']}</p>
        </body>
        </html>
        """

        resume_path = config.RESUME_PATHS.get("default", "resumes/resume_default.pdf")
        return self.send_email(hr_email, subject, body, attachment_path=resume_path)

    def _generate_email_message(self, job_title: str, company: str, job_description: str) -> str:
        """Generate tailored email message (can be enhanced with LLM)"""
        user_profile = config.USER_PROFILE
        return f"""I am writing to express my strong interest in the {job_title} position at {company}. 
        With {user_profile['experience_years']}+ years of experience as a {user_profile['role']}, I bring expertise 
        in {', '.join(user_profile['skills'][:5])} and a proven track record of developing scalable backend solutions."""

    def check_and_send_followups(self):
        """Check for applications that need follow-up emails"""
        if not self.followup_config['enabled']:
            return

        applications = self.db.get_all_applications()
        today = datetime.now()

        for app in applications:
            try:
                applied_date = datetime.fromisoformat(app['applied_at'])
                days_since = (today - applied_date).days

                # Check if follow-up is due
                if days_since >= self.followup_config['days_after_application']:
                    # Get follow-up count from database
                    followup_count = self.db.get_followup_count(app['id'])

                    if followup_count < self.followup_config['max_followups']:
                        # Check if enough time has passed since last follow-up
                        last_followup = self.db.get_last_followup_date(app['id'])
                        if last_followup:
                            last_date = datetime.fromisoformat(last_followup)
                            days_since_last = (today - last_date).days
                            if days_since_last < self.followup_config['followup_interval_days']:
                                continue

                        # Send follow-up if HR email is available
                        hr_email = app.get('hr_email')
                        if hr_email:
                            if self.send_followup_email(
                                hr_email,
                                app.get('company', 'Company'),
                                app['job_title'],
                                days_since
                            ):
                                self.db.record_followup(app['id'], hr_email)
                        else:
                            self.db.add_log(
                                "INFO",
                                f"No HR email for {app['job_title']} at {app.get('company')}, skipping follow-up",
                                "email"
                            )

            except Exception as e:
                self.db.add_log("ERROR", f"Error processing follow-up for job {app.get('id')}: {str(e)}", "email")


