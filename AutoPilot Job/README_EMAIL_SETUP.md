# Email Setup Guide

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "AutoPilot Job System"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update config.py
```python
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "mailtoprabhat72@gmail.com",
    "sender_password": "your-16-char-app-password-here",  # Paste the app password
    "sender_name": "Prabhat Kumar",
    "enable_tls": True
}
```

## Other Email Providers

### Outlook/Hotmail
```python
EMAIL_CONFIG = {
    "smtp_server": "smtp-mail.outlook.com",
    "smtp_port": 587,
    "sender_email": "your-email@outlook.com",
    "sender_password": "your-password",
    "sender_name": "Prabhat Kumar",
    "enable_tls": True
}
```

### Yahoo
```python
EMAIL_CONFIG = {
    "smtp_server": "smtp.mail.yahoo.com",
    "smtp_port": 587,
    "sender_email": "your-email@yahoo.com",
    "sender_password": "your-app-password",
    "sender_name": "Prabhat Kumar",
    "enable_tls": True
}
```

## Follow-up Email Settings

Edit `config.py` to customize follow-up behavior:

```python
FOLLOWUP_CONFIG = {
    "enabled": True,
    "days_after_application": 7,  # Send first follow-up after 7 days
    "max_followups": 2,  # Maximum 2 follow-ups per application
    "followup_interval_days": 5  # 5 days between follow-ups
}
```

## Running Follow-up Scheduler

To automatically check and send follow-ups daily:

```bash
python followup_scheduler.py
```

This will check for follow-up emails every day at 10:00 AM.

## Manual Follow-up Check

You can also trigger follow-up checks manually from the dashboard by clicking "Check Follow-ups" button.

## Testing Email

Test your email configuration:

```python
from database import JobDatabase
from email_module import EmailManager

db = JobDatabase()
email_mgr = EmailManager(db)

# Test sending CV
email_mgr.send_cv_to_hr(
    "test@company.com",
    "Test Company",
    "Java Developer",
    "Test job description"
)
```

## Troubleshooting

### "Authentication failed" error
- Make sure you're using an App Password, not your regular password
- For Gmail, ensure 2FA is enabled
- Check that the email and password are correct

### "Connection refused" error
- Check your internet connection
- Verify SMTP server and port are correct
- Some networks block SMTP ports - try a different network

### Emails going to spam
- Make sure your email account is verified
- Use a professional email address
- Avoid sending too many emails in a short time


