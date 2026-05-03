"""
Hirist.com job application automation using Playwright
"""

from playwright.sync_api import sync_playwright, Page, Browser
from typing import List, Dict, Optional
import config
from database import JobDatabase
from ollama_client import OllamaClient
from job_matcher import JobMatcher
from utils import (
    random_wait, safe_click, safe_fill, wait_for_selector,
    extract_text_safe, random_mouse_movement, scroll_randomly
)


class HiristAutomation:
    def __init__(self, db: JobDatabase, ollama: OllamaClient):
        self.db = db
        self.ollama = ollama
        self.job_matcher = JobMatcher()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.credentials = config.CREDENTIALS["hirist"]

    def login(self, page: Page) -> bool:
        """Login to Hirist"""
        try:
            self.db.add_log("INFO", "Starting Hirist login", "hirist")

            page.goto("https://hirist.com/login")
            random_wait(3, 5)

            # Fill email
            if not safe_fill(page, 'input[type="email"], input[name="email"], #email', self.credentials["email"]):
                self.db.add_log("ERROR", "Failed to fill email", "hirist")
                return False

            random_wait(1, 2)

            # Fill password
            if not safe_fill(page, 'input[type="password"], input[name="password"], #password', self.credentials["password"]):
                self.db.add_log("ERROR", "Failed to fill password", "hirist")
                return False

            random_wait(1, 2)

            # Click login
            if not safe_click(page, 'button[type="submit"], button:has-text("Login"), .login-btn'):
                self.db.add_log("ERROR", "Failed to click login", "hirist")
                return False

            random_wait(5, 8)

            # Check if login successful
            if "hirist.com/dashboard" in page.url or "profile" in page.url.lower():
                self.db.add_log("INFO", "Login successful", "hirist")
                return True
            else:
                self.db.add_log("ERROR", "Login failed - check credentials", "hirist")
                return False

        except Exception as e:
            self.db.add_log("ERROR", f"Login error: {str(e)}", "hirist")
            return False

    def search_jobs(self, page: Page, max_jobs: int = 20) -> List[Dict]:
        """Search for latest jobs"""
        try:
            self.db.add_log("INFO", "Starting job search", "hirist")

            # Navigate to jobs
            page.goto("https://hirist.com/jobs")
            random_wait(3, 5)

            # Search for Java Backend jobs
            search_query = "Java Backend Developer"
            search_input = 'input[placeholder*="Search"], input[name="search"], #search'
            
            if wait_for_selector(page, search_input):
                safe_fill(page, search_input, search_query)
                random_wait(1, 2)
                page.keyboard.press("Enter")
                random_wait(3, 5)

            # Filter by experience (1-5 years)
            try:
                exp_filter = page.locator('text="Experience"').first
                if exp_filter.count() > 0:
                    exp_filter.click()
                    random_wait(1, 2)
                    page.locator('text="1-5"').first.click()
                    random_wait(2, 3)
            except:
                pass

            # Filter by date (recent)
            try:
                date_filter = page.locator('text="Date Posted"').first
                if date_filter.count() > 0:
                    date_filter.click()
                    random_wait(1, 2)
                    page.locator('text="Last 7 days"').first.click()
                    random_wait(2, 3)
            except:
                pass

            # Extract job listings
            jobs = []
            job_cards = page.locator('.job-card, .job-item, [data-job-id]')
            job_count = min(job_cards.count(), max_jobs)

            for i in range(job_count):
                try:
                    card = job_cards.nth(i)
                    card.scroll_into_view_if_needed()
                    random_wait(1, 2)

                    # Extract job details
                    job_title = extract_text_safe(page, '.job-title, h3, .title', "")
                    company = extract_text_safe(page, '.company-name, .company', "")
                    
                    # Get job URL
                    job_link = card.locator('a').first
                    if job_link.count() > 0:
                        job_url = job_link.get_attribute('href') or ""
                        if job_url and not job_url.startswith('http'):
                            job_url = "https://hirist.com" + job_url
                    else:
                        continue

                    # Click to get description
                    job_link.click()
                    random_wait(2, 3)

                    # Get job description
                    job_description = extract_text_safe(page, '.job-description, .description, .jd', "")

                    # Try to extract HR email
                    hr_email = None
                    try:
                        email_element = page.locator('a[href^="mailto:"]').first
                        if email_element.count() > 0:
                            hr_email = email_element.get_attribute('href').replace('mailto:', '')
                    except:
                        pass

                    if job_title and job_url:
                        jobs.append({
                            "title": job_title,
                            "company": company,
                            "url": job_url,
                            "description": job_description,
                            "hr_email": hr_email
                        })

                    scroll_randomly(page)
                    random_wait(1, 2)

                except Exception as e:
                    self.db.add_log("WARNING", f"Error extracting job {i}: {str(e)}", "hirist")
                    continue

            self.db.add_log("INFO", f"Found {len(jobs)} jobs", "hirist")
            return jobs

        except Exception as e:
            self.db.add_log("ERROR", f"Job search error: {str(e)}", "hirist")
            return []

    def apply_to_job(self, page: Page, job: Dict) -> bool:
        """Apply to a job"""
        try:
            self.db.add_log("INFO", f"Applying to: {job['title']}", "hirist")

            # Navigate to job
            page.goto(job["url"])
            random_wait(3, 5)

            # Look for Apply button
            apply_selectors = [
                'button:has-text("Apply"), button:has-text("Apply Now")',
                'a:has-text("Apply")',
                '.apply-btn'
            ]

            apply_button = None
            for selector in apply_selectors:
                try:
                    button = page.locator(selector).first
                    if button.count() > 0 and button.is_visible():
                        apply_button = button
                        break
                except:
                    continue

            if not apply_button:
                self.db.add_log("WARNING", "Apply button not found", "hirist")
                return False

            # Click Apply
            apply_button.click()
            random_wait(2, 4)

            # Handle application form
            try:
                # Fill any required fields
                text_areas = page.locator('textarea')
                if text_areas.count() > 0:
                    response = self.ollama.tailor_resume_text(
                        job["title"], job.get("description", ""), config.USER_PROFILE
                    )
                    safe_fill(page, 'textarea', response[:500])
                    random_wait(1, 2)

                # Submit application
                submit_button = page.locator('button:has-text("Submit"), button:has-text("Apply")').first
                if submit_button.count() > 0 and submit_button.is_visible():
                    submit_button.click()
                    random_wait(3, 5)
                    return True

                # Check if application successful
                if page.locator('text="Application submitted", text="Applied"').count() > 0:
                    return True

            except Exception as e:
                self.db.add_log("WARNING", f"Application form error: {str(e)}", "hirist")

            return False

        except Exception as e:
            self.db.add_log("ERROR", f"Application error: {str(e)}", "hirist")
            return False

    def run(self, max_jobs: int = 20):
        """Main automation flow"""
        try:
            with sync_playwright() as p:
                self.browser = p.chromium.launch(
                    headless=config.AUTOMATION_CONFIG["headless"],
                    slow_mo=config.AUTOMATION_CONFIG["slow_mo"]
                )
                context = self.browser.new_context(
                    viewport={"width": 1920, "height": 1080},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                self.page = context.new_page()

                # Login
                if not self.login(self.page):
                    self.db.add_log("ERROR", "Login failed, aborting", "hirist")
                    return

                # Search jobs
                jobs = self.search_jobs(self.page, max_jobs)

                # Process each job
                applied_count = 0
                for job in jobs:
                    if self.db.job_exists(job["url"]):
                        self.db.add_log("INFO", f"Already applied: {job['title']}", "hirist")
                        continue

                    evaluation = self.ollama.evaluate_job_relevance(
                        job["title"], job.get("description", ""), config.USER_PROFILE
                    )

                    should_apply, score, reason = self.job_matcher.match_job(
                        job["title"], job.get("description", "")
                    )

                    final_decision = should_apply and evaluation.get("should_apply", False)
                    final_score = (score + evaluation.get("score", 0)) / 2

                    if final_decision and final_score >= 50:
                        if self.apply_to_job(self.page, job):
                            job_id = self.db.add_job_application(
                                platform="hirist",
                                company=job.get("company", "Unknown"),
                                job_title=job["title"],
                                job_url=job["url"],
                                resume_used=config.RESUME_PATHS.get("default", ""),
                                relevance_score=final_score,
                                job_description=job.get("description", ""),
                                notes=f"LLM: {evaluation.get('reasoning', '')}; Rules: {reason}",
                                hr_email=job.get("hr_email")
                            )
                            applied_count += 1
                            self.db.add_log("SUCCESS", f"Applied to: {job['title']}", "hirist")
                        else:
                            self.db.add_log("WARNING", f"Failed to apply: {job['title']}", "hirist")
                    else:
                        self.db.add_log("INFO", f"Skipped (low relevance): {job['title']}", "hirist")

                    random_wait(3, 6)

                self.db.add_log("INFO", f"Hirist automation complete. Applied to {applied_count} jobs", "hirist")

        except Exception as e:
            self.db.add_log("ERROR", f"Hirist automation error: {str(e)}", "hirist")
        finally:
            if self.browser:
                self.browser.close()


