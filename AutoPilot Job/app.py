"""
Flask dashboard for AutoPilot Job Application System
"""

from flask import Flask, render_template, jsonify, request
from database import JobDatabase
from email_module import EmailManager
import config
import threading
from main import AutoPilotSystem

app = Flask(__name__)
db = JobDatabase()
email_manager = EmailManager(db)

# Global state
automation_running = False
automation_thread = None
automation_system = None


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')


@app.route('/api/jobs')
def get_jobs():
    """Get all job applications"""
    platform = request.args.get('platform')
    jobs = db.get_all_applications()
    if platform:
        jobs = [job for job in jobs if job.get('platform', '').lower() == platform.lower()]
    return jsonify(jobs)


@app.route('/api/statistics')
def get_statistics():
    """Get application statistics"""
    stats = db.get_statistics()
    return jsonify(stats)


@app.route('/api/logs')
def get_logs():
    """Get recent logs"""
    limit = request.args.get('limit', 100, type=int)
    logs = db.get_recent_logs(limit)
    return jsonify(logs)


@app.route('/api/status')
def get_status():
    """Get automation status"""
    return jsonify({
        "running": automation_running,
        "platforms": ["linkedin", "naukri", "indeed", "wellfound", "hirist"]
    })


@app.route('/api/start', methods=['POST'])
def start_automation():
    """Start automation"""
    global automation_running, automation_thread, automation_system

    if automation_running:
        return jsonify({"error": "Automation already running"}), 400

    data = request.json or {}
    platforms = data.get('platforms', ['linkedin', 'naukri', 'wellfound', 'hirist'])
    max_jobs = data.get('max_jobs', 20)

    automation_running = True
    automation_system = AutoPilotSystem()

    def run_automation():
        global automation_running
        try:
            automation_system.run(platforms=platforms, max_jobs_per_platform=max_jobs)
        finally:
            automation_running = False

    automation_thread = threading.Thread(target=run_automation, daemon=True)
    automation_thread.start()

    return jsonify({"status": "started", "platforms": platforms})


@app.route('/api/stop', methods=['POST'])
def stop_automation():
    """Stop automation"""
    global automation_running
    automation_running = False
    return jsonify({"status": "stopped"})


@app.route('/api/jobs/<int:job_id>/status', methods=['PUT'])
def update_job_status(job_id):
    """Update job status"""
    data = request.json
    new_status = data.get('status')
    
    if new_status:
        db.update_job_status(job_id, new_status)
        return jsonify({"status": "updated"})
    
    return jsonify({"error": "Status required"}), 400


@app.route('/api/jobs/<int:job_id>/send-cv', methods=['POST'])
def send_cv_email(job_id):
    """Send CV to HR email"""
    data = request.json or {}
    hr_email = data.get('hr_email')
    
    if not hr_email:
        return jsonify({"error": "HR email required"}), 400
    
    # Get job details
    jobs = db.get_all_applications()
    job = next((j for j in jobs if j['id'] == job_id), None)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Send CV
    success = email_manager.send_cv_to_hr(
        hr_email,
        job.get('company', 'Company'),
        job['job_title'],
        job.get('job_description', '')
    )
    
    if success:
        db.update_hr_email(job_id, hr_email)
        db.mark_cv_sent(job_id)
        return jsonify({"status": "sent"})
    else:
        return jsonify({"error": "Failed to send email"}), 500


@app.route('/api/jobs/<int:job_id>/followup', methods=['POST'])
def send_followup(job_id):
    """Send follow-up email"""
    data = request.json or {}
    hr_email = data.get('hr_email')
    
    if not hr_email:
        return jsonify({"error": "HR email required"}), 400
    
    # Get job details
    jobs = db.get_all_applications()
    job = next((j for j in jobs if j['id'] == job_id), None)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Calculate days since application
    from datetime import datetime
    applied_date = datetime.fromisoformat(job['applied_at'])
    days_since = (datetime.now() - applied_date).days
    
    # Send follow-up
    success = email_manager.send_followup_email(
        hr_email,
        job.get('company', 'Company'),
        job['job_title'],
        days_since
    )
    
    if success:
        db.record_followup(job_id, hr_email, "followup", f"Follow-up for {job['job_title']}")
        return jsonify({"status": "sent"})
    else:
        return jsonify({"error": "Failed to send email"}), 500


@app.route('/api/jobs/<int:job_id>/emails')
def get_email_history(job_id):
    """Get email history for a job"""
    emails = db.get_email_history(job_id)
    return jsonify(emails)


@app.route('/api/followups/check', methods=['POST'])
def check_followups():
    """Manually trigger follow-up check"""
    email_manager.check_and_send_followups()
    return jsonify({"status": "checked"})


if __name__ == '__main__':
    import socket
    import os
    
    def find_free_port(start_port=5000):
        """Find a free port starting from start_port"""
        port = start_port
        max_attempts = 10
        attempts = 0
        
        while attempts < max_attempts:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('', port))
                    return port
                except OSError:
                    port += 1
                    attempts += 1
        return start_port  # Fallback to original port
    
    # Kill any existing processes on port 5000
    try:
        pid = os.popen(f"lsof -ti:5000").read().strip()
        if pid:
            os.system(f"kill -9 {pid} 2>/dev/null")
            print(f"✅ Freed port 5000 (killed process {pid})")
    except:
        pass
    
    port = find_free_port(5000)
    if port != 5000:
        print(f"⚠️  Port 5000 is in use. Using port {port} instead.")
    else:
        print(f"✅ Starting on port {port}")
    
    print(f"   Open your browser to: http://localhost:{port}")
    print(f"   Or: http://127.0.0.1:{port}")
    print("")
    
    app.run(debug=True, host='127.0.0.1', port=port, use_reloader=False)

