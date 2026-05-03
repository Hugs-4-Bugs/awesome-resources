# 🚀 AutoPilot Job Application System

A fully functional **ZERO-COST** autonomous job-applying system that runs locally on your machine without requiring any paid API or cloud credits.

## Features

- ✅ **Zero Cost**: Uses only open-source tools (Python, Playwright, SQLite, Ollama)
- ✅ **AI-Powered Matching**: Local LLM (Ollama) for job relevance evaluation
- ✅ **Multi-Platform**: Supports LinkedIn, Naukri.com, Indeed, Wellfound, and Hirist
- ✅ **Smart Filtering**: Rule-based + AI matching to find relevant jobs
- ✅ **Resume Tailoring**: AI-generated tailored resume text using your actual resume content
- ✅ **Email Integration**: Automatically send CV to HR emails and follow-up emails
- ✅ **Follow-up Automation**: Automatic follow-up emails after 7 days (configurable)
- ✅ **HR Email Extraction**: Automatically extracts HR emails from job postings
- ✅ **Human-Like Behavior**: Random delays, mouse movements, natural typing
- ✅ **Dashboard UI**: Beautiful Flask-based web dashboard with email tracking
- ✅ **Application Tracking**: SQLite database to track all applications and emails
- ✅ **Status Updates**: Daily status tracking (Applied, In Review, Interview, Rejected)
- ✅ **Recent Jobs Only**: Filters jobs posted in last 7 days (configurable)

## Prerequisites

1. **Python 3.8+** installed
2. **Ollama** installed and running
   - Download from: https://ollama.ai
   - Install and start: `ollama serve`
   - Pull a model: `ollama pull llama3` (or `mistral-nemo`, `codellama`)

## Installation

### 1. Clone/Download this repository

```bash
cd "AutoPilot Job"
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Playwright browsers

```bash
playwright install chromium
```

### 4. Install and Setup Ollama

```bash
# Install Ollama (if not already installed)
# macOS/Linux: curl https://ollama.ai/install.sh | sh
# Windows: Download from https://ollama.ai

# Start Ollama server
ollama serve

# In another terminal, pull a model
ollama pull llama3
# OR
ollama pull mistral-nemo
# OR
ollama pull codellama
```

### 5. Configure your credentials

Edit `config.py` and fill in your credentials:

```python
CREDENTIALS = {
    "linkedin": {
        "email": "your-email@example.com",
        "password": "your-password",
        "use_cookies": True
    },
    "naukri": {
        "email": "your-email@example.com",
        "password": "your-password"
    },
    "indeed": {
        "email": "your-email@example.com",
        "password": "your-password"
    }
}
```

### 6. Add your resume

Create a `resumes/` directory and add your resume PDF:

```bash
mkdir resumes
# Copy your resume to resumes/resume_default.pdf
```

You can also create multiple resume versions:
- `resumes/resume_default.pdf`
- `resumes/resume_java_backend.pdf`
- `resumes/resume_microservices.pdf`

### 7. (Optional) Update user profile

Edit `config.py` to match your profile if different from the default. Your actual resume content is already configured!

### 8. Setup Email (Optional but Recommended)

To enable CV sending and follow-up emails:

1. **For Gmail**: See `README_EMAIL_SETUP.md` for detailed instructions
2. Generate an App Password from your Google Account
3. Update `EMAIL_CONFIG` in `config.py` with your email and app password

**Note**: Email functionality is optional. The system will work without it, but you'll miss automatic CV sending and follow-ups.

## Usage

### Option 1: Web Dashboard (Recommended)

Start the Flask dashboard:

```bash
python app.py
```

Then open your browser to: **http://localhost:5000**

Click **"START AUTO APPLY"** to begin automation.

### Option 2: Command Line

Run directly from command line:

```bash
python main.py
```

## How It Works

1. **Job Search**: Searches for latest jobs (posted in last 7 days) on LinkedIn, Naukri, Indeed, Wellfound, and Hirist
2. **Job Matching**: 
   - Rule-based filtering (title, experience, location, keywords)
   - AI evaluation using Ollama LLM with your actual resume content
   - Only applies if relevance score ≥ 50
3. **Application**: 
   - Fills application forms automatically
   - Uploads tailored resume
   - Generates job-specific responses using your actual experience
   - Extracts HR emails from job postings
4. **Email Sending** (if configured):
   - Automatically sends CV to HR email if found
   - Sends follow-up emails after 7 days
   - Tracks all email communications
5. **Tracking**: Stores all applications and emails in SQLite database
6. **Dashboard**: View statistics, logs, email history, and update job statuses

## Job Matching Criteria

The system accepts jobs ONLY if:

- **Title matches**: Java Developer, Backend Developer, Spring Boot Developer, Java Engineer, Microservices Engineer
- **Experience**: 1-5 years required
- **Location**: Remote, Hybrid, or Any country with visa sponsorship
- **Rejects**: .NET, Python, PHP, frontend-only roles, Senior 6+ years roles

## Configuration

### Ollama Model

Edit `config.py` to change the model:

```python
OLLAMA_CONFIG = {
    "base_url": "http://localhost:11434",
    "model": "llama3",  # Change to mistral-nemo, codellama, etc.
    "timeout": 120
}
```

### Automation Settings

```python
AUTOMATION_CONFIG = {
    "min_wait_seconds": 2,
    "max_wait_seconds": 9,
    "headless": False,  # Set True for background operation
    "slow_mo": 100,
    "max_jobs_per_run": 20,
    "enable_mouse_movement": True
}
```

## Database

The system uses SQLite database (`job_applications.db`) with three tables:

- **jobs_applied**: All job applications
- **status_updates**: Status change history
- **application_logs**: Activity logs

## Dashboard Features

- **Real-time Statistics**: Total applications, status breakdown
- **Jobs Table**: View all applications with filtering by platform
- **Email Tracking**: See HR emails, CV sent status, and follow-up counts
- **Email Actions**: Send CV or follow-up emails directly from dashboard
- **Status Updates**: Manually update job status
- **Activity Logs**: Real-time automation logs
- **Start/Stop Controls**: Control automation from UI
- **Follow-up Check**: Manually trigger follow-up email check

## Troubleshooting

### Ollama Connection Error

```bash
# Make sure Ollama is running
ollama serve

# Check if model is available
ollama list

# Pull model if missing
ollama pull llama3
```

### Playwright Issues

```bash
# Reinstall browsers
playwright install chromium --force
```

### Login Failures

- Check credentials in `config.py`
- For LinkedIn, you can use saved cookies (set `use_cookies: True`)
- Some platforms may require 2FA - handle manually first time

### No Jobs Found

- Check internet connection
- Verify search filters in automation scripts
- Some platforms may have rate limiting
- Jobs are filtered to last 7 days only - adjust `recent_posting_days` in config if needed

### Email Not Sending

- Check `README_EMAIL_SETUP.md` for email configuration
- Verify you're using App Password (not regular password) for Gmail
- Check SMTP server and port settings
- Ensure email credentials are correct in `config.py`

## Safety & Ethics

⚠️ **Important Notes**:

- Use responsibly and ethically
- Respect platform terms of service
- Don't spam applications
- Review applications before submitting (when possible)
- This is for educational/personal use

## File Structure

```
AutoPilot Job/
├── config.py                 # Configuration file
├── database.py               # SQLite database operations
├── ollama_client.py          # Ollama LLM integration
├── job_matcher.py            # Job matching logic
├── utils.py                  # Utility functions
├── linkedin_automation.py    # LinkedIn automation
├── naukri_automation.py      # Naukri automation
├── indeed_automation.py      # Indeed automation
├── wellfound_automation.py   # Wellfound automation
├── hirist_automation.py      # Hirist automation
├── email_module.py           # Email sending and follow-ups
├── followup_scheduler.py     # Daily follow-up email scheduler
├── main.py                   # Main orchestrator
├── app.py                    # Flask dashboard
├── templates/
│   └── dashboard.html        # Dashboard UI
├── resumes/                  # Resume files (create this)
├── requirements.txt          # Python dependencies
├── README.md                 # This file
└── README_EMAIL_SETUP.md     # Email setup guide
```

## License

This project is provided as-is for educational and personal use.

## Email Features

### Automatic CV Sending
- System automatically extracts HR emails from job postings
- Sends tailored CV via email when HR email is found
- Tracks CV sending status in dashboard

### Follow-up Emails
- Automatically sends follow-up emails 7 days after application
- Configurable follow-up schedule
- Maximum 2 follow-ups per application (configurable)
- Run `python followup_scheduler.py` for daily automatic checks

### Manual Email Actions
- Send CV to HR email from dashboard
- Send follow-up email manually
- View email history for each application

See `README_EMAIL_SETUP.md` for detailed email setup instructions.

## Support

For issues or questions:
1. Check the logs in the dashboard
2. Verify Ollama is running
3. Check credentials are correct
4. Review error messages in console
5. For email issues, see `README_EMAIL_SETUP.md`

---

**Happy Job Hunting! 🎯**

