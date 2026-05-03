"""
Indeed.com job application automation using Playwright (Optional)
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


class IndeedAutomation:
    def __init__(self, db: JobDatabase, ollama: OllamaClient):
        self.db = db
        self.ollama = ollama
        self.job_matcher = JobMatcher()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.credentials = config.CREDENTIALS["indeed"]

    def login(self, page: Page) -> bool:
        """Login to Indeed"""
        try:
            self.db.add_log("INFO", "Starting Indeed login", "indeed")

            page.goto("https://secure.indeed.com/account/login")
            random_wait(3, 5)

            # Fill email
            if not safe_fill(page, 'input[name="__email"], input[type="email"]', self.credentials["email"]):
                self.db.add_log("ERROR", "Failed to fill email", "indeed")
                return False

            random_wait(1, 2)

            # Click continue
            if safe_click(page, 'button:has-text("Continue"), button[type="submit"]'):
                random_wait(2, 3)

            # Fill password
            if not safe_fill(page, 'input[name="__password"], input[type="password"]', self.credentials["password"]):
                self.db.add_log("ERROR", "Failed to fill password", "indeed")
                return False

            random_wait(1, 2)

            # Click sign in
            if not safe_click(page, 'button:has-text("Sign in"), button[type="submit"]'):
                self.db.add_log("ERROR", "Failed to click sign in", "indeed")
                return False

            random_wait(5, 8)

            # Check if login successful
            if "indeed.com/m" in page.url or "myaccount" in page.url:
                self.db.add_log("INFO", "Login successful", "indeed")
                return True
            else:
                self.db.add_log("ERROR", "Login failed - check credentials", "indeed")
                return False

        except Exception as e:
            self.db.add_log("ERROR", f"Login error: {str(e)}", "indeed")
            return False

    def search_jobs(self, page: Page, max_jobs: int = 20) -> List[Dict]:
        """Search for latest jobs"""
        try:
            self.db.add_log("INFO", "Starting job search", "indeed")

            # Navigate to jobs
            page.goto("https://www.indeed.com/jobs")
            random_wait(3, 5)

            # Search for Java Backend jobs
            search_query = "Java Backend Developer"
            search_input = 'input[name="q"], input[id="text-input-what"]'
            
            if wait_for_selector(page, search_input):
                safe_fill(page, search_input, search_query)
                random_wait(1, 2)
                page.keyboard.press("Enter")
                random_wait(3, 5)

            # Filter by date (last 7 days)
            try:
                date_filter = page.locator('text="Date posted"').first
                if date_filter.count() > 0:
                    date_filter.click()
                    random_wait(1, 2)
                    page.locator('text="Last 7 days"').first.click()
                    random_wait(2, 3)
            except:
                pass

            # Extract job listings
            jobs = []
            job_cards = page.locator('.job_seen_beacon, [data-jk], .jobTitle')
            job_count = min(job_cards.count(), max_jobs)

            for i in range(job_count):
                try:
                    card = job_cards.nth(i)
                    card.scroll_into_view_if_needed()
                    random_wait(1, 2)

                    # Extract job details
                    job_title = extract_text_safe(page, '.jobTitle a, .jobTitle', "")
                    company = extract_text_safe(page, '.companyName, [data-testid="company-name"]', "")
                    
                    # Get job URL
                    job_link = card.locator('a').first
                    if job_link.count() > 0:
                        job_url = job_link.get_attribute('href') or ""
                        if job_url and not job_url.startswith('http'):
                            job_url = "https://www.indeed.com" + job_url
                    else:
                        continue

                    # Click to get description
                    job_link.click()
                    random_wait(2, 3)

                    # Get job description
                    job_description = extract_text_safe(page, '#jobDescriptionText, .jobsearch-jobDescriptionText', "")

                    if job_title and job_url:
                        jobs.append({
                            "title": job_title,
                            "company": company,
                            "url": job_url,
                            "description": job_description
                        })

                    scroll_randomly(page)
                    random_wait(1, 2)

                except Exception as e:
                    self.db.add_log("WARNING", f"Error extracting job {i}: {str(e)}", "indeed")
                    continue

            self.db.add_log("INFO", f"Found {len(jobs)} jobs", "indeed")
            return jobs

        except Exception as e:
            self.db.add_log("ERROR", f"Job search error: {str(e)}", "indeed")
            return []

    def apply_to_job(self, page: Page, job: Dict) -> bool:
        """Apply to a job"""
        try:
            self.db.add_log("INFO", f"Applying to: {job['title']}", "indeed")

            # Navigate to job
            page.goto(job["url"])
            random_wait(3, 5)

            # Look for Apply button
            apply_selectors = [
                'button:has-text("Apply now"), button:has-text("Apply")',
                '[data-testid="apply-button"]',
                'a:has-text("Apply now")'
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
                self.db.add_log("WARNING", "Apply button not found", "indeed")
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
                submit_button = page.locator('button:has-text("Submit"), button:has-text("Continue")').first
                if submit_button.count() > 0 and submit_button.is_visible():
                    submit_button.click()
                    random_wait(3, 5)
                    return True

                # Check if application successful
                if page.locator('text="Application submitted"').count() > 0:
                    return True

            except Exception as e:
                self.db.add_log("WARNING", f"Application form error: {str(e)}", "indeed")

            return False

        except Exception as e:
            self.db.add_log("ERROR", f"Application error: {str(e)}", "indeed")
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
                    self.db.add_log("ERROR", "Login failed, aborting", "indeed")
                    return

                # Search jobs
                jobs = self.search_jobs(self.page, max_jobs)

                # Process each job
                applied_count = 0
                for job in jobs:
                    if self.db.job_exists(job["url"]):
                        self.db.add_log("INFO", f"Already applied: {job['title']}", "indeed")
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
                            self.db.add_job_application(
                                platform="indeed",
                                company=job.get("company", "Unknown"),
                                job_title=job["title"],
                                job_url=job["url"],
                                resume_used=config.RESUME_PATHS.get("default", ""),
                                relevance_score=final_score,
                                job_description=job.get("description", ""),
                                notes=f"LLM: {evaluation.get('reasoning', '')}; Rules: {reason}"
                            )
                            applied_count += 1
                            self.db.add_log("SUCCESS", f"Applied to: {job['title']}", "indeed")
                        else:
                            self.db.add_log("WARNING", f"Failed to apply: {job['title']}", "indeed")
                    else:
                        self.db.add_log("INFO", f"Skipped (low relevance): {job['title']}", "indeed")

                    random_wait(3, 6)

                self.db.add_log("INFO", f"Indeed automation complete. Applied to {applied_count} jobs", "indeed")

        except Exception as e:
            self.db.add_log("ERROR", f"Indeed automation error: {str(e)}", "indeed")
        finally:
            if self.browser:
                self.browser.close()

