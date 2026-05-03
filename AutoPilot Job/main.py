"""
Main orchestrator for AutoPilot Job Application System
"""

import sys
import time
from database import JobDatabase
from ollama_client import OllamaClient
from linkedin_automation import LinkedInAutomation
from naukri_automation import NaukriAutomation
from indeed_automation import IndeedAutomation
from wellfound_automation import WellfoundAutomation
from hirist_automation import HiristAutomation
from email_module import EmailManager
import config


class AutoPilotSystem:
    def __init__(self):
        self.db = JobDatabase()
        self.ollama = OllamaClient()
        self.email_manager = EmailManager(self.db)
        self.linkedin = LinkedInAutomation(self.db, self.ollama)
        self.naukri = NaukriAutomation(self.db, self.ollama)
        self.indeed = IndeedAutomation(self.db, self.ollama)
        self.wellfound = WellfoundAutomation(self.db, self.ollama)
        self.hirist = HiristAutomation(self.db, self.ollama)

    def check_ollama(self) -> bool:
        """Check if Ollama is running"""
        try:
            import requests
            response = requests.get(f"{config.OLLAMA_CONFIG['base_url']}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_name = config.OLLAMA_CONFIG["model"]
                available = any(m.get("name", "").startswith(model_name) for m in models)
                if not available:
                    print(f"Warning: Model '{model_name}' not found. Available models: {[m.get('name') for m in models]}")
                    print(f"Please run: ollama pull {model_name}")
                return available
            return False
        except Exception as e:
            print(f"Error connecting to Ollama: {e}")
            print("Please make sure Ollama is running: ollama serve")
            return False

    def run(self, platforms: list = None, max_jobs_per_platform: int = 20):
        """Run automation on specified platforms"""
        if platforms is None:
            platforms = ["linkedin", "naukri"]  # Default to LinkedIn and Naukri only

        self.db.add_log("INFO", "Starting AutoPilot Job Application System", "system")

        # Check Ollama
        if not self.check_ollama():
            self.db.add_log("WARNING", "Ollama not available, using fallback matching", "system")
        else:
            self.db.add_log("INFO", "Ollama connected successfully", "system")

        # Check credentials
        missing_creds = []
        if "linkedin" in platforms:
            try:
                if not config.CREDENTIALS.get("linkedin", {}).get("email") or not config.CREDENTIALS.get("linkedin", {}).get("password"):
                    missing_creds.append("LinkedIn")
            except (KeyError, AttributeError):
                missing_creds.append("LinkedIn")
        if "naukri" in platforms:
            try:
                if not config.CREDENTIALS.get("naukri", {}).get("email") or not config.CREDENTIALS.get("naukri", {}).get("password"):
                    missing_creds.append("Naukri")
            except (KeyError, AttributeError):
                missing_creds.append("Naukri")
        if "indeed" in platforms:
            try:
                if not config.CREDENTIALS.get("indeed", {}).get("email") or not config.CREDENTIALS.get("indeed", {}).get("password"):
                    missing_creds.append("Indeed")
            except (KeyError, AttributeError):
                missing_creds.append("Indeed")
        if "wellfound" in platforms:
            try:
                if not config.CREDENTIALS.get("wellfound", {}).get("email") or not config.CREDENTIALS.get("wellfound", {}).get("password"):
                    missing_creds.append("Wellfound")
            except (KeyError, AttributeError):
                missing_creds.append("Wellfound")
        if "hirist" in platforms:
            try:
                if not config.CREDENTIALS.get("hirist", {}).get("email") or not config.CREDENTIALS.get("hirist", {}).get("password"):
                    missing_creds.append("Hirist")
            except (KeyError, AttributeError):
                missing_creds.append("Hirist")

        if missing_creds:
            self.db.add_log("WARNING", f"Missing credentials for: {', '.join(missing_creds)}. Skipping these platforms.", "system")
            print(f"⚠️  Missing credentials for: {', '.join(missing_creds)}. These platforms will be skipped.")
            # Remove platforms without credentials from the list
            platforms = [p for p in platforms if p not in [m.lower() for m in missing_creds]]
            
            if not platforms:
                self.db.add_log("ERROR", "No platforms available with valid credentials", "system")
                print("❌ No platforms available. Please add credentials in config.py")
                return

        self.db.add_log("INFO", f"Running automation on: {', '.join(platforms)}", "system")
        
        # Run automation for each platform
        successful_platforms = []
        failed_platforms = []
        
        for platform in platforms:
            try:
                self.db.add_log("INFO", f"Starting {platform} automation", "system")
                print(f"\n🔄 Starting {platform} automation...")
                
                if platform == "linkedin":
                    self.linkedin.run(max_jobs=max_jobs_per_platform)
                    successful_platforms.append(platform)
                elif platform == "naukri":
                    self.naukri.run(max_jobs=max_jobs_per_platform)
                    successful_platforms.append(platform)
                elif platform == "indeed":
                    self.indeed.run(max_jobs=max_jobs_per_platform)
                    successful_platforms.append(platform)
                elif platform == "wellfound":
                    self.wellfound.run(max_jobs=max_jobs_per_platform)
                    successful_platforms.append(platform)
                elif platform == "hirist":
                    self.hirist.run(max_jobs=max_jobs_per_platform)
                    successful_platforms.append(platform)
                else:
                    self.db.add_log("WARNING", f"Unknown platform: {platform}", "system")
                    failed_platforms.append(platform)

                time.sleep(3)  # Wait between platforms

            except Exception as e:
                error_msg = str(e)
                self.db.add_log("ERROR", f"Error running {platform}: {error_msg}", "system")
                print(f"❌ Error with {platform}: {error_msg}")
                failed_platforms.append(platform)
                # Continue with next platform instead of stopping
                continue
        
        # Summary
        if successful_platforms:
            self.db.add_log("SUCCESS", f"Completed automation on: {', '.join(successful_platforms)}", "system")
            print(f"\n✅ Successfully completed: {', '.join(successful_platforms)}")
        
        if failed_platforms:
            self.db.add_log("WARNING", f"Failed platforms: {', '.join(failed_platforms)}", "system")
            print(f"⚠️  Failed platforms: {', '.join(failed_platforms)}")

        # Check and send follow-up emails
        if config.FOLLOWUP_CONFIG["enabled"]:
            self.db.add_log("INFO", "Checking for follow-up emails", "system")
            self.email_manager.check_and_send_followups()

        self.db.add_log("INFO", "AutoPilot automation complete", "system")
        print("\n✅ Automation complete! Check the dashboard for results.")


def main():
    """Entry point"""
    print("=" * 60)
    print("🚀 AutoPilot Job Application System")
    print("=" * 60)
    print("\nStarting automation...\n")

    system = AutoPilotSystem()
    system.run(platforms=["linkedin", "naukri"], max_jobs_per_platform=20)


if __name__ == "__main__":
    main()

