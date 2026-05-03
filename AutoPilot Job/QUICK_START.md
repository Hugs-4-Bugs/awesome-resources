# Quick Start Guide

## 🚀 Run the Application

### Step 1: Install Dependencies (First Time Only)

```bash
cd "/Users/prabhatkumar/Downloads/AutoPilot Job"
pip3 install -r requirements.txt
playwright install chromium
```

### Step 2: Start Ollama (Required for AI features)

```bash
# In a separate terminal window
ollama serve
```

Then in another terminal:
```bash
ollama pull llama3
```

### Step 3: Configure Credentials

Edit `config.py` and add your credentials:
- LinkedIn email/password
- Naukri email/password
- Wellfound email/password (optional)
- Hirist email/password (optional)
- Email config for CV sending (optional)

### Step 4: Add Your Resume

```bash
# Place your resume PDF here:
resumes/resume_default.pdf
```

### Step 5: Run the Application

**Option A: Using Start Script (Recommended)**
```bash
./start.sh
```

**Option B: Direct Python Command**
```bash
python3 app.py
```

### Step 6: Open Dashboard

Open your browser and go to:
```
http://localhost:5000
```

### Step 7: Start Automation

1. Click **"START AUTO APPLY"** button in the dashboard
2. System will automatically:
   - Search for recent jobs
   - Match jobs using AI
   - Apply automatically
   - Send CVs via email (if configured)
   - Track everything in the dashboard

## 📧 Optional: Setup Email for CV Sending

1. Generate Gmail App Password (see `README_EMAIL_SETUP.md`)
2. Update `EMAIL_CONFIG` in `config.py`
3. System will automatically send CVs to HR emails

## 🔄 Optional: Enable Follow-up Emails

Run in a separate terminal:
```bash
python3 followup_scheduler.py
```

This will check and send follow-up emails daily at 10:00 AM.

## 🛑 Stop the Application

Press `Ctrl+C` in the terminal where the app is running.

## 📊 View Results

- Open dashboard: http://localhost:5000
- View all applications
- Check email status
- Update job statuses
- View logs

## ⚠️ Troubleshooting

**Port 5000 already in use?**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Ollama not running?**
```bash
ollama serve
```

**Dependencies missing?**
```bash
pip3 install -r requirements.txt
playwright install chromium
```

**Browser not installing?**
```bash
playwright install chromium --force
```

---

**That's it! Your AutoPilot Job Application System is ready to use! 🎉**


