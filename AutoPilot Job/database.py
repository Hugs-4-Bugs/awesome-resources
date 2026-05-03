"""
SQLite database operations for job applications tracking
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import os


class JobDatabase:
    def __init__(self, db_path: str = "job_applications.db"):
        self.db_path = db_path
        self.init_database()

    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def init_database(self):
        """Initialize database schema"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Jobs Applied Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs_applied (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                company TEXT,
                job_title TEXT NOT NULL,
                job_url TEXT UNIQUE,
                applied_at TEXT NOT NULL,
                resume_used TEXT,
                status TEXT DEFAULT 'Applied',
                relevance_score REAL,
                job_description TEXT,
                notes TEXT,
                last_updated TEXT,
                hr_email TEXT,
                cv_sent_via_email INTEGER DEFAULT 0,
                followup_count INTEGER DEFAULT 0
            )
        """)
        
        # Add new columns if they don't exist (for existing databases)
        try:
            cursor.execute("ALTER TABLE jobs_applied ADD COLUMN hr_email TEXT")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE jobs_applied ADD COLUMN cv_sent_via_email INTEGER DEFAULT 0")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE jobs_applied ADD COLUMN followup_count INTEGER DEFAULT 0")
        except:
            pass

        # Status Updates Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS status_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER,
                old_status TEXT,
                new_status TEXT,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (job_id) REFERENCES jobs_applied(id)
            )
        """)

        # Application Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS application_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                platform TEXT,
                job_id INTEGER
            )
        """)

        # Email Follow-ups Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_followups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                email_sent_to TEXT NOT NULL,
                email_type TEXT NOT NULL,
                sent_at TEXT NOT NULL,
                subject TEXT,
                FOREIGN KEY (job_id) REFERENCES jobs_applied(id)
            )
        """)

        conn.commit()
        conn.close()

    def add_job_application(
        self,
        platform: str,
        company: str,
        job_title: str,
        job_url: str,
        resume_used: str,
        relevance_score: float = 0.0,
        job_description: str = "",
        notes: str = "",
        hr_email: str = None
    ) -> int:
        """Add a new job application"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO jobs_applied 
                (platform, company, job_title, job_url, applied_at, resume_used, 
                 status, relevance_score, job_description, notes, last_updated, hr_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                platform,
                company,
                job_title,
                job_url,
                datetime.now().isoformat(),
                resume_used,
                "Applied",
                relevance_score,
                job_description,
                notes,
                datetime.now().isoformat(),
                hr_email
            ))
            job_id = cursor.lastrowid
            conn.commit()
            return job_id
        except sqlite3.IntegrityError:
            # Job already exists
            cursor.execute("""
                SELECT id FROM jobs_applied WHERE job_url = ?
            """, (job_url,))
            result = cursor.fetchone()
            return result[0] if result else None
        finally:
            conn.close()

    def update_job_status(self, job_id: int, new_status: str):
        """Update job status and log the change"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get old status
        cursor.execute("SELECT status FROM jobs_applied WHERE id = ?", (job_id,))
        result = cursor.fetchone()
        if not result:
            conn.close()
            return

        old_status = result[0]

        if old_status != new_status:
            # Update status
            cursor.execute("""
                UPDATE jobs_applied 
                SET status = ?, last_updated = ?
                WHERE id = ?
            """, (new_status, datetime.now().isoformat(), job_id))

            # Log status change
            cursor.execute("""
                INSERT INTO status_updates (job_id, old_status, new_status, updated_at)
                VALUES (?, ?, ?, ?)
            """, (job_id, old_status, new_status, datetime.now().isoformat()))

            conn.commit()
        conn.close()

    def get_all_applications(self) -> List[Dict]:
        """Get all job applications"""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM jobs_applied 
            ORDER BY applied_at DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def get_applications_by_status(self, status: str) -> List[Dict]:
        """Get applications by status"""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM jobs_applied 
            WHERE status = ?
            ORDER BY applied_at DESC
        """, (status,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def get_recent_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent application logs"""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM application_logs 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def add_log(self, level: str, message: str, platform: str = None, job_id: int = None):
        """Add a log entry"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO application_logs (timestamp, level, message, platform, job_id)
            VALUES (?, ?, ?, ?, ?)
        """, (datetime.now().isoformat(), level, message, platform, job_id))

        conn.commit()
        conn.close()

    def job_exists(self, job_url: str) -> bool:
        """Check if job already exists in database"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM jobs_applied WHERE job_url = ?", (job_url,))
        result = cursor.fetchone()
        conn.close()

        return result is not None

    def get_statistics(self) -> Dict:
        """Get application statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Total applications
        cursor.execute("SELECT COUNT(*) FROM jobs_applied")
        total = cursor.fetchone()[0]

        # By status
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM jobs_applied 
            GROUP BY status
        """)
        status_counts = {row[0]: row[1] for row in cursor.fetchall()}

        # By platform
        cursor.execute("""
            SELECT platform, COUNT(*) as count 
            FROM jobs_applied 
            GROUP BY platform
        """)
        platform_counts = {row[0]: row[1] for row in cursor.fetchall()}

        conn.close()

        return {
            "total": total,
            "by_status": status_counts,
            "by_platform": platform_counts
        }

    def update_hr_email(self, job_id: int, hr_email: str):
        """Update HR email for a job application"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE jobs_applied 
            SET hr_email = ?
            WHERE id = ?
        """, (hr_email, job_id))

        conn.commit()
        conn.close()

    def mark_cv_sent(self, job_id: int):
        """Mark CV as sent via email"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE jobs_applied 
            SET cv_sent_via_email = 1
            WHERE id = ?
        """, (job_id,))

        conn.commit()
        conn.close()

    def record_followup(self, job_id: int, email_to: str, email_type: str = "followup", subject: str = ""):
        """Record a follow-up email"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Record in followups table
        cursor.execute("""
            INSERT INTO email_followups (job_id, email_sent_to, email_type, sent_at, subject)
            VALUES (?, ?, ?, ?, ?)
        """, (job_id, email_to, email_type, datetime.now().isoformat(), subject))

        # Update followup count
        cursor.execute("""
            UPDATE jobs_applied 
            SET followup_count = followup_count + 1
            WHERE id = ?
        """, (job_id,))

        conn.commit()
        conn.close()

    def get_followup_count(self, job_id: int) -> int:
        """Get number of follow-ups sent for a job"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT followup_count FROM jobs_applied WHERE id = ?", (job_id,))
        result = cursor.fetchone()
        conn.close()

        return result[0] if result else 0

    def get_last_followup_date(self, job_id: int) -> Optional[str]:
        """Get date of last follow-up email"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sent_at FROM email_followups 
            WHERE job_id = ? 
            ORDER BY sent_at DESC 
            LIMIT 1
        """, (job_id,))
        result = cursor.fetchone()
        conn.close()

        return result[0] if result else None

    def get_email_history(self, job_id: int) -> List[Dict]:
        """Get email history for a job"""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM email_followups 
            WHERE job_id = ?
            ORDER BY sent_at DESC
        """, (job_id,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

