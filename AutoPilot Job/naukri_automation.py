"""
Naukri.com job application automation using Playwright
"""

from playwright.sync_api import sync_playwright, Page, Browser
import time
import random
from typing import List, Dict, Optional
import config
from database import JobDatabase
from ollama_client import OllamaClient
from job_matcher import JobMatcher
from utils import (
    random_wait, safe_click, safe_fill, wait_for_selector,
    extract_text_safe, random_mouse_movement, scroll_randomly
)


class NaukriAutomation:
    def __init__(self, db: JobDatabase, ollama: OllamaClient):
        self.db = db
        self.ollama = ollama
        self.job_matcher = JobMatcher()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.credentials = config.CREDENTIALS["naukri"]

    def login(self, page: Page) -> bool:
        """Login to Naukri"""
        try:
            self.db.add_log("INFO", "Starting Naukri login", "naukri")

            # Direct navigation to login
            page.goto("https://www.naukri.com/nlogin/login", wait_until="domcontentloaded", timeout=60000)
            random_wait(2, 4)

            # Check if already logged in (redirected to dashboard)
            if "mnjuser" in page.url or "homepage" in page.url:
                self.db.add_log("INFO", "Already logged in to Naukri", "naukri")
                return True

            # Fill email
            email_selectors = ['#usernameField', 'input[name="email"]', 'input[placeholder*="Email"]']
            email_filled = False
            for selector in email_selectors:
                if wait_for_selector(page, selector, timeout=5000):
                    safe_fill(page, selector, self.credentials["email"])
                    email_filled = True
                    break
            
            if not email_filled:
                self.db.add_log("ERROR", "Failed to fill email", "naukri")
                return False

            random_wait(1, 2)

            # Fill password
            password_selectors = ['#passwordField', 'input[name="password"]', 'input[type="password"]']
            password_filled = False
            for selector in password_selectors:
                if wait_for_selector(page, selector, timeout=5000):
                    safe_fill(page, selector, self.credentials["password"])
                    password_filled = True
                    break
            
            if not password_filled:
                self.db.add_log("ERROR", "Failed to fill password", "naukri")
                return False

            random_wait(1, 2)

            # Click login
            login_btn = page.locator('button.waves-effect, button:has-text("Login")').first
            if login_btn.count() > 0:
                login_btn.click()
            else:
                self.db.add_log("ERROR", "Login button not found", "naukri")
                return False

            random_wait(5, 8)

            # Verify login / Handle OTP bypass if possible (not really possible automating OTP)
            if "otp" in page.url.lower():
                self.db.add_log("WARNING", "OTP requested. Please enter OTP manually.", "naukri")
                random_wait(30, 60)

            # Aggressive check for common post-login popups
            try:
                # "Chat" or "Update Profile" modals
                page.locator('.crossIcon, #crossIcon, .close-modal').click(timeout=2000)
            except: pass

            # Return true if URL indicates success or we can see nav bar
            if "mnjuser" in page.url or "homepage" in page.url or page.locator('.nI-gNb-header').count() > 0:
                self.db.add_log("INFO", "Login successful", "naukri")
                return True
            
            self.db.add_log("WARNING", f"Login verification ambiguous URL: {page.url} - assuming success and proceeding", "naukri")
            return True

        except Exception as e:
            self.db.add_log("ERROR", f"Login error: {str(e)}", "naukri")
            return False

    def search_jobs(self, page: Page, max_jobs: int = 20) -> List[Dict]:
        """Search for latest jobs"""
        try:
            self.db.add_log("INFO", "Starting job search", "naukri")

            # Construct direct URL
            base_url = "https://www.naukri.com/"
            search_query = config.USER_PROFILE.get("role", "Java Backend Developer")
            encoded_query = search_query.replace(" ",("-")).lower() + "-jobs"
            search_url = f"{base_url}{encoded_query}?k={search_query.replace(' ', '%20')}&sortByDate=1"
            
            self.db.add_log("INFO", f"Navigating to search URL: {search_url}", "naukri")

            # Force navigation with retry
            try:
                page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
                random_wait(4, 6)
            except Exception as e:
                 self.db.add_log("WARNING", f"Navigation timeout usage (retrying): {str(e)}", "naukri")
                 page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
                 random_wait(4, 6)

            # Check if we are stuck on homepage
            if "mnjuser" in page.url or "homepage" in page.url:
                 self.db.add_log("WARNING", "Stuck on homepage, trying manual search input", "naukri")
                 try:
                     search_bar = page.locator('input.suggestor-input').first
                     if search_bar.is_visible():
                         search_bar.click()
                         search_bar.fill(search_query)
                         page.locator('div.nI-gNb-search-btn').click()
                         random_wait(4, 6)
                 except: pass

            # Explicit Wait for job list
            try:
                page.wait_for_selector('.srp-jobtuple-wrapper, .list', timeout=10000)
            except:
                self.db.add_log("WARNING", "Job list not found (timeout)", "naukri")

            # Extract job listings
            jobs = []
            
            # Use broad selector for job cards
            job_cards = page.locator('.srp-jobtuple-wrapper, [data-job-id], .jobTuple')
            count = job_cards.count()
            self.db.add_log("INFO", f"Found {count} potential jobs", "naukri")

            if count == 0:
                self.db.add_log("WARNING", "No jobs found. Possible partial page load.", "naukri")
                return []
            
            job_count = min(count, max_jobs)

            for i in range(job_count):
                try:
                    card = job_cards.nth(i)
                    card.scroll_into_view_if_needed()
                    
                    # Extract basics ONLY from card to be fast
                    job_title = extract_text_safe(card, '.title, a.title', "")
                    company = extract_text_safe(card, '.comp-name, a.comp-name', "")
                    
                    # Get URL
                    link = card.locator('a.title, a.title').first
                    if link.count() > 0:
                        job_url = link.get_attribute('href')
                        # If simple apply, add to list
                        if job_url:
                            jobs.append({
                                "title": job_title,
                                "company": company,
                                "url": job_url,
                                "description": "", # Fetch later
                                "hr_email": None
                            })
                            
                except Exception as e:
                    continue

            return jobs

        except Exception as e:
            self.db.add_log("ERROR", f"Job search error: {str(e)}", "naukri")
            return []

    def apply_to_job(self, page: Page, job: Dict) -> bool:
        """Apply to a job"""
        try:
            self.db.add_log("INFO", f"Applying to: {job['title']}", "naukri")

            # Navigate to job
            page.goto(job["url"])
            random_wait(3, 5)
            
            # Fetch full description now for logging/database
            job["description"] = extract_text_safe(page, '.job-desc, .jd, .description', "")
            
            # Try to extract HR email
            try:
                import re
                email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                emails = re.findall(email_pattern, job["description"])
                if emails:
                    job["hr_email"] = emails[0]
            except:
                pass


            # Look for Apply button
            # Naukri has "Apply on Company Site" or "Apply" (Easy apply equivalent)
            
            # Prioritize internal apply
            apply_button = None
            
            # Check for "Applied already"
            if page.locator('.applied-status, text="Applied"').count() > 0:
                 self.db.add_log("INFO", "Already applied (detected on page)", "naukri")
                 return True

            apply_selectors = [
                'button#apply-button',
                'div.apply-button-container button',
                'button.apply-button',
                'button:has-text("Apply")'
            ]
            
            company_site_selectors = [
                 'button:has-text("Apply on Company Website")',
                 'button:has-text("Register to Apply")'
            ]
            
            is_company_site = False

            for selector in apply_selectors:
                try:
                    button = page.locator(selector).first
                    if button.count() > 0 and button.is_visible():
                        apply_button = button
                        break
                except:
                    continue
            
            # Check if it is company site apply if no direct apply found
            if not apply_button:
                 for selector in company_site_selectors:
                    if page.locator(selector).count() > 0:
                        is_company_site = True
                        break
            
            if is_company_site:
                self.db.add_log("INFO", "Skipping failure-prone external company site application", "naukri")
                return False

            if not apply_button:
                self.db.add_log("WARNING", "Apply button not found", "naukri")
                return False

            # Click Apply
            apply_button.click()
            random_wait(2, 4)

            # Handle application form
            # Naukri usually uses saved profile, but may ask for chat/questions
            try:
                # Handle "Chat" based application or Modal
                # Sometimes a modal opens with "Your daily quota has been reached" or similar
                if page.locator('text="Daily quota"').count() > 0:
                    self.db.add_log("WARNING", "Daily apply quota reached", "naukri")
                    return False

                # Check for any additional inputs
                # Naukri 1-click apply often just confirms.
                
                # Verify Success
                # Wait a bit
                random_wait(2, 3)
                if page.locator('text="Applied Successfully"').count() > 0 or \
                   page.locator('text="You have successfully applied"').count() > 0 or \
                   page.locator('.success-message').count() > 0:
                    return True
                
                # Check for "Update Profile" prompt (often appears after apply)
               # If "Applied" text appears on button
                if apply_button.inner_text().lower() == "applied":
                    return True

            except Exception as e:
                self.db.add_log("WARNING", f"Application form error: {str(e)}", "naukri")

            # Final check if URL changed to success page
            if "apply/success" in page.url:
                return True

            return False

        except Exception as e:
            self.db.add_log("ERROR", f"Application error: {str(e)}", "naukri")
            return False

    def run(self, max_jobs: int = 20):
        """Main automation flow"""
        playwright = None
        context = None
        try:
            with sync_playwright() as p:
                playwright = p
                self.browser = p.chromium.launch(
                    headless=config.AUTOMATION_CONFIG["headless"],
                    slow_mo=config.AUTOMATION_CONFIG["slow_mo"]
                )
                context = self.browser.new_context(
                    viewport={"width": 1920, "height": 1080},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                )
                self.page = context.new_page()

                # Login
                if not self.login(self.page):
                    self.db.add_log("ERROR", "Login failed, aborting", "naukri")
                    return

                # Search jobs
                jobs = self.search_jobs(self.page, max_jobs)

                # Process each job
                applied_count = 0
                for job in jobs:
                    # Check if already applied
                    if self.db.job_exists(job["url"]):
                        self.db.add_log("INFO", f"Already applied: {job['title']}", "naukri")
                        continue
                    
                    # We need to visit the job page to get description for evaluation if we skipped it in search
                    if not job.get("description"):
                         # Will be fetched in apply_to_job
                         # But we need it for evaluation logic BEFORE applying
                         # So let's peek
                         try:
                             if self.page.url != job["url"]:
                                 self.page.goto(job["url"])
                                 random_wait(2, 3)
                             job["description"] = extract_text_safe(self.page, '.job-desc, .jd, .description', "")
                         except:
                             pass

                    # Evaluate job
                    evaluation = self.ollama.evaluate_job_relevance(
                        job["title"], job.get("description", ""), config.USER_PROFILE
                    )

                    should_apply, score, reason = self.job_matcher.match_job(
                        job["title"], job.get("description", "")
                    )

                    final_decision = should_apply or evaluation.get("should_apply", False)
                    final_score = (score + evaluation.get("score", 0)) / 2

                    if final_decision and final_score >= 40:
                        if self.apply_to_job(self.page, job):
                            job_id = self.db.add_job_application(
                                platform="naukri",
                                company=job.get("company", "Unknown"),
                                job_title=job["title"],
                                job_url=job["url"],
                                resume_used=config.RESUME_PATHS.get("default", ""),
                                relevance_score=final_score,
                                job_description=job.get("description", ""),
                                notes=f"LLM: {evaluation.get('reasoning', '')}; Rules: {reason}",
                                hr_email=job.get("hr_email")
                            )
                            
                            # Send CV via email if HR email is available
                            if job.get("hr_email") and config.EMAIL_CONFIG.get("sender_password"):
                                try:
                                    from email_module import EmailManager
                                    email_mgr = EmailManager(self.db)
                                    if email_mgr.send_cv_to_hr(
                                        job["hr_email"],
                                        job.get("company", "Unknown"),
                                        job["title"],
                                        job.get("description", "")
                                    ):
                                        self.db.mark_cv_sent(job_id)
                                        self.db.add_log("SUCCESS", f"CV sent via email to {job['hr_email']}", "naukri")
                                except Exception as e:
                                    self.db.add_log("WARNING", f"Failed to send CV email: {str(e)}", "naukri")
                            applied_count += 1
                            self.db.add_log("SUCCESS", f"Applied to: {job['title']}", "naukri")
                        else:
                            self.db.add_log("WARNING", f"Failed to apply: {job['title']}", "naukri")
                    else:
                        self.db.add_log("INFO", f"Skipped (low relevance): {job['title']} - Score: {final_score}", "naukri")

                    random_wait(3, 6)

                self.db.add_log("INFO", f"Naukri automation complete. Applied to {applied_count} jobs", "naukri")

        except Exception as e:
            self.db.add_log("ERROR", f"Naukri automation error: {str(e)}", "naukri")
            import traceback
            self.db.add_log("ERROR", f"Traceback: {traceback.format_exc()}", "naukri")
        finally:
            try:
                if context:
                    context.close()
                if self.browser:
                    self.browser.close()
            except:
                pass
