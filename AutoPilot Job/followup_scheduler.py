"""
Follow-up email scheduler - runs daily to check and send follow-up emails
"""

import time
import schedule
from database import JobDatabase
from email_module import EmailManager
import config


class FollowUpScheduler:
    def __init__(self):
        self.db = JobDatabase()
        self.email_manager = EmailManager(self.db)

    def run_followup_check(self):
        """Check and send follow-up emails"""
        print("Checking for follow-up emails...")
        self.email_manager.check_and_send_followups()
        print("Follow-up check complete.")

    def start_daily_scheduler(self):
        """Start daily scheduler for follow-up emails"""
        if not config.FOLLOWUP_CONFIG["enabled"]:
            print("Follow-up emails are disabled in config.")
            return

        # Schedule daily check at 10 AM
        schedule.every().day.at("10:00").do(self.run_followup_check)

        print("Follow-up email scheduler started. Will check daily at 10:00 AM.")
        print("Press Ctrl+C to stop.")

        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\nScheduler stopped.")


if __name__ == "__main__":
    scheduler = FollowUpScheduler()
    scheduler.start_daily_scheduler()


