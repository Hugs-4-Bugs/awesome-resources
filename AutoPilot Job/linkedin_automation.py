# """
# LinkedIn job application automation using Playwright
# """

# from playwright.sync_api import sync_playwright, Page, Browser
# import time
# import random
# from typing import List, Dict, Optional
# import config
# from database import JobDatabase
# from ollama_client import OllamaClient
# from job_matcher import JobMatcher
# from utils import (
#     random_wait, safe_click, safe_fill, wait_for_selector,
#     extract_text_safe, random_mouse_movement, scroll_randomly
# )


# class LinkedInAutomation:
#     def __init__(self, db: JobDatabase, ollama: OllamaClient):
#         self.db = db
#         self.ollama = ollama
#         self.job_matcher = JobMatcher()
#         self.browser: Optional[Browser] = None
#         self.page: Optional[Page] = None
#         self.credentials = config.CREDENTIALS["linkedin"]

#     def login(self, page: Page) -> bool:
#         """Login to LinkedIn"""
#         try:
#             self.db.add_log("INFO", "Starting LinkedIn login", "linkedin")

#             # Go to login page directly to avoid redirects
#             page.goto("https://www.linkedin.com/login", wait_until="domcontentloaded")
#             random_wait(2, 4)

#             # Check if we were redirected to feed (already logged in)
#             if "feed" in page.url or "mynetwork" in page.url:
#                 self.db.add_log("INFO", "Already logged in to LinkedIn", "linkedin")
#                 return True

#             # If still on login page, proceed
#             email_filled = False
#             email_selectors = ['#username', 'input[name="session_key"]', 'input[type="text"][autocomplete="username"]']
#             for selector in email_selectors:
#                 try:
#                     if wait_for_selector(page, selector, timeout=3000):
#                         element = page.locator(selector).first
#                         element.click()
#                         random_wait(0.5, 1)
#                         element.fill("")
#                         element.type(self.credentials["email"], delay=50)
#                         email_filled = True
#                         break
#                 except:
#                     continue
            
#             if not email_filled:
#                 self.db.add_log("ERROR", "Failed to fill email", "linkedin")
#                 return False

#             random_wait(1, 2)

#             password_filled = False
#             password_selectors = ['#password', 'input[name="session_password"]', 'input[type="password"]']
#             for selector in password_selectors:
#                 try:
#                     if wait_for_selector(page, selector, timeout=3000):
#                         element = page.locator(selector).first
#                         element.click()
#                         random_wait(0.5, 1)
#                         element.fill("")
#                         element.type(self.credentials["password"], delay=50)
#                         password_filled = True
#                         break
#                 except:
#                     continue
            
#             if not password_filled:
#                 self.db.add_log("ERROR", "Failed to fill password", "linkedin")
#                 return False

#             random_wait(1, 2)

#             # Click sign in
#             if not safe_click(page, 'button[type="submit"]'):
#                 self.db.add_log("ERROR", "Failed to click sign in", "linkedin")
#                 return False

#             random_wait(5, 8)

#             # Check for 2FA
#             if "challenge" in page.url or "checkpoint" in page.url:
#                 self.db.add_log("WARNING", "2FA/Verification required. Please complete manually.", "linkedin")
#                 random_wait(30, 60)

#             # Verification of login success
#             try:
#                 # Wait for feed or nav element
#                 page.wait_for_selector('nav, [data-test-id="nav"], .global-nav__me', timeout=10000)
#                 self.db.add_log("INFO", "Login successful", "linkedin")
#                 return True
#             except:
#                 if "feed" in page.url:
#                     return True
#                 self.db.add_log("ERROR", f"Login verification failed. URL: {page.url}", "linkedin")
#                 return False

#         except Exception as e:
#             self.db.add_log("ERROR", f"Login error: {str(e)}", "linkedin")
#             return False

#     def search_jobs(self, page: Page, max_jobs: int = 20) -> List[Dict]:
#         """Search for latest jobs"""
#         try:
#             self.db.add_log("INFO", "Starting job search", "linkedin")

#             search_query = config.USER_PROFILE.get("role", "Java Backend Developer")
#             encoded_query = search_query.replace(" ", "%20")
            
#             # Construct simplified search URL
#             # sort=DD (Date Descending / Most Recent)
#             search_url = f"https://www.linkedin.com/jobs/search/?keywords={encoded_query}&f_AL=true&sortBy=DD"
            
#             self.db.add_log("INFO", f"Navigating to search URL: {search_url}", "linkedin")
            
#             # 1. Force Navigation
#             try:
#                 page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
#                 random_wait(4, 6)
#             except Exception as e:
#                 self.db.add_log("WARNING", f"Navigation error (retrying): {str(e)}", "linkedin")
#                 page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
#                 random_wait(4, 6)

#             # 2. Verify we are NOT on feed
#             if "feed" in page.url:
#                 self.db.add_log("WARNING", "Stuck on feed, forcing search via input box", "linkedin")
#                 # Fallback: Click jobs icon and search manually
#                 try:
#                     # Click Jobs nav icon
#                     page.locator('.global-nav__nav-item--jobs, a[href*="/jobs/"]').first.click()
#                     random_wait(3, 5)
#                     # Type in search box
#                     search_box = page.locator('input[aria-label*="Search jobs"]').first
#                     if search_box.is_visible():
#                         search_box.click()
#                         search_box.fill(search_query)
#                         page.keyboard.press("Enter")
#                         random_wait(5, 8)
#                 except Exception as ex:
#                     self.db.add_log("ERROR", f"Manual search fallback failed: {str(ex)}", "linkedin")

#             # 3. Handle Login Redirect
#             if "login" in page.url or "auth" in page.url:
#                  self.db.add_log("WARNING", "Session expired, re-logging in", "linkedin")
#                  if self.login(page):
#                      page.goto(search_url, wait_until="domcontentloaded")
#                      random_wait(4, 6)

#             # 4. Extract Jobs
#             jobs = []
#             # Wait for results to appear
#             try:
#                 page.wait_for_selector('.jobs-search-results-list, .jobs-search__results-list, ul.jobs-search__results-list', timeout=10000)
#             except:
#                 self.db.add_log("WARNING", "Job list selector timeout - page might be empty or different layout", "linkedin")

#             # Scroll to load
#             for _ in range(5):
#                 scroll_randomly(page)
#                 random_wait(1, 2)
            
#             # Selectors
#             card_selector = '.jobs-search-results__list-item, [data-occludable-job-id], li.jobs-search-results__list-item'
#             job_cards = page.locator(card_selector)
            
#             count = job_cards.count()
#             self.db.add_log("INFO", f"Found {count} potential job cards", "linkedin")
            
#             if count == 0:
#                  self.db.add_log("WARNING", "No job cards found. Check selectors or page load.", "linkedin")
#                  # Debug snapshot or logic here
#                  return []

#             for i in range(min(count, max_jobs)):
#                 try:
#                     card = job_cards.nth(i)
#                     card.scroll_into_view_if_needed()
                    
#                     # Click logic
#                     try:
#                          # Try clicking the interactive part of the card
#                          card.click()
#                     except:
#                          # Fallback for some layouts
#                          card.locator('a.job-card-list__title').first.click()
                    
#                     random_wait(2, 4)

#                     # Extract loop...
#                     # (Simplified for brevity, ensuring existing logic is preserved)
#                     details_pane = page.locator('.jobs-search__job-details--container, .jobs-details__main-content').first
#                     if details_pane.count() == 0: details_pane = page # Fallback

#                     job_title = extract_text_safe(details_pane, '.jobs-details-top-card__job-title, h2', "")
#                     if not job_title: job_title = extract_text_safe(card, 'strong, .artdeco-entity-lockup__title', "") # Fallback

#                     company = extract_text_safe(details_pane, '.jobs-details-top-card__company-name, .job-details-jobs-unified-top-card__company-name', "")
                    
#                     job_url = page.url
#                     # Try to get clean URL
#                     try:
#                          link = card.locator('a.job-card-list__title').first
#                          if link.count() > 0:
#                              href = link.get_attribute('href')
#                              if href: job_url = f"https://www.linkedin.com{href.split('?')[0]}"
#                     except: pass
                    
#                     job_description = extract_text_safe(details_pane, '.jobs-description-content__text, #job-details', "")
                    
#                     if job_title:
#                          jobs.append({
#                             "title": job_title,
#                             "company": company,
#                             "url": job_url,
#                             "description": job_description,
#                             "hr_email": None # Skipped for speed
#                         })

#                 except Exception as e:
#                     self.db.add_log("WARNING", f"Error extracting job {i}: {str(e)}", "linkedin")
#                     continue

#             return jobs


#         except Exception as e:
#             self.db.add_log("ERROR", f"Job search error: {str(e)}", "linkedin")
#             return []

#     def apply_to_job(self, page: Page, job: Dict) -> bool:
#         """Apply to a job using Easy Apply"""
#         try:
#             self.db.add_log("INFO", f"Applying to: {job['title']}", "linkedin")

#             # Navigate to job if not already there (though we should be there from search)
#             if job["url"] not in page.url:
#                 page.goto(job["url"])
#                 random_wait(3, 5)

#             # Check if Easy Apply button exists
#             easy_apply_selectors = [
#                 'button.jobs-apply-button:has-text("Easy Apply")',
#                 'button[aria-label*="Easy Apply"]',
#                 '.jobs-apply-button--top-card button'
#             ]

#             easy_apply_button = None
#             for selector in easy_apply_selectors:
#                 try:
#                     button = page.locator(selector).first
#                     if button.count() > 0 and button.is_visible():
#                         easy_apply_button = button
#                         break
#                 except:
#                     continue

#             if not easy_apply_button:
#                 self.db.add_log("WARNING", "Easy Apply not available", "linkedin")
#                 return False

#             # Click Easy Apply
#             easy_apply_button.click()
#             random_wait(2, 4)

#             # Application Form Loop
#             # We will try to click "Next" or "Review" until we see "Submit"
#             max_steps = 10
#             steps_taken = 0
            
#             while steps_taken < max_steps:
#                 steps_taken += 1
#                 random_wait(1, 2)
                
#                 # Check for "Submit" button first
#                 submit_button = page.locator('button:has-text("Submit application"), button[aria-label*="Submit application"]').first
#                 if submit_button.count() > 0 and submit_button.is_visible():
#                     self.db.add_log("INFO", "Clicking Submit Application", "linkedin")
#                     submit_button.click()
#                     random_wait(3, 5)
                    
#                     # Verify submission
#                     if page.locator('text="Your application has been submitted"').count() > 0 or \
#                        page.locator('[data-test-modal-close-btn]').count() > 0:
                        
#                         # Close the success modal
#                         try:
#                             # Usually an 'x' or 'Done' button
#                             page.locator('button:has-text("Done")').click()
#                         except:
#                             page.keyboard.press("Escape")
                            
#                         return True
#                     return True

#                 # Check for "Next" or "Review" button
#                 next_button = page.locator('button:has-text("Next"), button:has-text("Review")').first
#                 if next_button.count() > 0 and next_button.is_visible():
#                     # Handle any form fields on this step before clicking Next
#                     self._handle_form_fields(page, job)
                    
#                     button_text = next_button.inner_text()
#                     self.db.add_log("INFO", f"Clicking {button_text}", "linkedin")
#                     next_button.click()
#                     random_wait(1, 2)
                    
#                     # Check for errors after clicking
#                     if page.locator('.artdeco-inline-feedback__message').count() > 0:
#                         self.db.add_log("WARNING", "Form validation failed, cannot proceed", "linkedin")
#                         # Try to close/discard
#                         self._discard_application(page)
#                         return False
                    
#                     continue
                
#                 # If neither Next nor Submit, maybe we are done?
#                 if page.locator('text="Your application has been submitted"').count() > 0:
#                      return True
                     
#                 # If we are stuck, break
#                 break

#             # If we get here, application failed or got stuck
#             self.db.add_log("WARNING", "Application flow stuck or timed out", "linkedin")
#             self._discard_application(page)
#             return False

#         except Exception as e:
#             self.db.add_log("ERROR", f"Application error: {str(e)}", "linkedin")
#             self._discard_application(page)
#             return False

#     def _handle_form_fields(self, page: Page, job: Dict):
#         """Handle common form fields"""
#         try:
#             # 1. Phone Number
#             phone_selectors = ['input[id*="phoneNumber"]', 'input[name*="phone"]']
#             for selector in phone_selectors:
#                 if page.locator(selector).count() > 0:
#                     val = page.locator(selector).input_value()
#                     if not val:
#                          # Use config phone or default
#                         phone = config.USER_PROFILE.get("phone", "+1234567890")
#                         safe_fill(page, selector, phone)

#             # 2. Radio Buttons (Yes/No questions)
#             # This is heuristic: prefer "Yes" for "authorized", "experience", etc.
#             # But "No" for "sponsorship" maybe?
#             # For now, simplistic approach: Select first radio if none selected
#             radios = page.locator('fieldset')
#             count = radios.count()
#             for i in range(count):
#                 fieldset = radios.nth(i)
#                 # Check if checked
#                 if fieldset.locator('input[type="radio"]:checked').count() == 0:
#                     # Look for "Yes" or first option
#                     yes_opt = fieldset.locator('label:has-text("Yes")').first
#                     if yes_opt.count() > 0:
#                         yes_opt.click()
#                     else:
#                         fieldset.locator('label').first.click()
                        
#             # 3. Text Inputs / Textareas (Custom questions)
#             text_areas = page.locator('input[type="text"]:not([readonly]), textarea')
#             count = text_areas.count()
#             for i in range(count):
#                 el = text_areas.nth(i)
#                 if not el.is_visible(): continue
                
#                 val = el.input_value()
#                 if not val:
#                     # Use Ollama to generate answer based on label/question
#                     # Find label
#                     label = "Question"
#                     try:
#                         id_attr = el.get_attribute("id")
#                         if id_attr:
#                             label_el = page.locator(f'label[for="{id_attr}"]').first
#                             if label_el.count() > 0:
#                                 label = label_el.inner_text()
#                     except:
#                         pass
                    
#                     if "numeric" in label.lower() or "years" in label.lower():
#                         safe_fill(page, el, str(config.USER_PROFILE.get("experience_years", 3)))
#                     else:
#                          # Very basic fill for now to avoid blocking
#                          safe_fill(page, el, "3") # Heuristic for numeric inputs
                         
#             # 4. Resume
#             # Already handled by LinkedIn usually, but check
#             resume_input = page.locator('input[type="file"]')
#             if resume_input.count() > 0:
#                 try:
#                     resume_path = config.RESUME_PATHS.get("default", "resumes/resume_default.pdf")
#                     resume_input.set_input_files(resume_path)
#                 except:
#                     pass

#         except Exception as e:
#             pass
            
#     def _discard_application(self, page: Page):
#         """Discard application to clean up state"""
#         try:
#             # Click X or Dismiss
#             close_btn = page.locator('button[aria-label="Dismiss"]').first
#             if close_btn.count() > 0:
#                 close_btn.click()
#                 random_wait(1, 2)
#                 # Confirm discard
#                 discard_btn = page.locator('button:has-text("Discard")').first
#                 if discard_btn.count() > 0:
#                     discard_btn.click()
#         except:
#             pass

#     def run(self, max_jobs: int = 20):
#         """Main automation flow"""
#         playwright = None
#         context = None
#         try:
#             with sync_playwright() as p:
#                 playwright = p
#                 self.browser = p.chromium.launch(
#                     headless=config.AUTOMATION_CONFIG["headless"],
#                     slow_mo=config.AUTOMATION_CONFIG["slow_mo"]
#                 )
#                 context = self.browser.new_context(
#                     viewport={"width": 1920, "height": 1080},
#                     user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#                 )
#                 self.page = context.new_page()

#                 # Login
#                 if not self.login(self.page):
#                     self.db.add_log("ERROR", "Login failed, aborting", "linkedin")
#                     return

#                 # Search jobs
#                 jobs = self.search_jobs(self.page, max_jobs)

#                 # Process each job
#                 applied_count = 0
#                 for job in jobs:
#                     # Check if already applied
#                     if self.db.job_exists(job["url"]):
#                         self.db.add_log("INFO", f"Already applied: {job['title']}", "linkedin")
#                         continue

#                     # Evaluate job with LLM
#                     evaluation = self.ollama.evaluate_job_relevance(
#                         job["title"], job.get("description", ""), config.USER_PROFILE
#                     )

#                     # Also use rule-based matching
#                     should_apply, score, reason = self.job_matcher.match_job(
#                         job["title"], job.get("description", "")
#                     )

#                     # Combine LLM and rule-based decision
#                     # If LLM says yes OR rule says yes (lenient mode)
#                     final_decision = should_apply or evaluation.get("should_apply", False)
#                     final_score = (score + evaluation.get("score", 0)) / 2

#                     if final_decision and final_score >= 40: # Lowered threshold slightly
#                         # Apply to job
#                         if self.apply_to_job(self.page, job):
#                             job_id = self.db.add_job_application(
#                                 platform="linkedin",
#                                 company=job.get("company", "Unknown"),
#                                 job_title=job["title"],
#                                 job_url=job["url"],
#                                 resume_used=config.RESUME_PATHS.get("default", ""),
#                                 relevance_score=final_score,
#                                 job_description=job.get("description", ""),
#                                 notes=f"LLM: {evaluation.get('reasoning', '')}; Rules: {reason}",
#                                 hr_email=job.get("hr_email")
#                             )
                            
#                             # Send CV via email if HR email is available
#                             if job.get("hr_email") and config.EMAIL_CONFIG.get("sender_password"):
#                                 try:
#                                     from email_module import EmailManager
#                                     email_mgr = EmailManager(self.db)
#                                     if email_mgr.send_cv_to_hr(
#                                         job["hr_email"],
#                                         job.get("company", "Unknown"),
#                                         job["title"],
#                                         job.get("description", "")
#                                     ):
#                                         self.db.mark_cv_sent(job_id)
#                                         self.db.add_log("SUCCESS", f"CV sent via email to {job['hr_email']}", "linkedin")
#                                 except Exception as e:
#                                     self.db.add_log("WARNING", f"Failed to send CV email: {str(e)}", "linkedin")
#                             applied_count += 1
#                             self.db.add_log("SUCCESS", f"Applied to: {job['title']}", "linkedin")
#                         else:
#                             self.db.add_log("WARNING", f"Failed to apply: {job['title']}", "linkedin")
#                     else:
#                         self.db.add_log("INFO", f"Skipped (low relevance): {job['title']} - Score: {final_score}", "linkedin")

#                     random_wait(3, 6)

#                 self.db.add_log("INFO", f"LinkedIn automation complete. Applied to {applied_count} jobs", "linkedin")

#         except Exception as e:
#             self.db.add_log("ERROR", f"LinkedIn automation error: {str(e)}", "linkedin")
#             import traceback
#             self.db.add_log("ERROR", f"Traceback: {traceback.format_exc()}", "linkedin")
#         finally:
#             try:
#                 if context:
#                     context.close()
#                 if self.browser:
#                     self.browser.close()
#             except:
#                 pass



# linkedin_automation.py

from playwright.sync_api import sync_playwright, Page, Browser
import time
import random
import traceback
from typing import List, Dict, Optional
import os
import config # Requires config.py
from database import JobDatabase # Requires database.py
from ollama_client import OllamaClient # Requires ollama_client.py
from job_matcher import JobMatcher # Requires job_matcher.py
from utils import (
    random_wait, safe_click, safe_fill, wait_for_selector,
    extract_text_safe, random_mouse_movement, scroll_randomly
)

class LinkedInAutomation:
    def __init__(self, db: JobDatabase, ollama: OllamaClient):
        self.db = db
        self.ollama = ollama
        self.job_matcher = JobMatcher()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.credentials = config.CREDENTIALS["linkedin"]
        self.user_profile = config.USER_PROFILE
        # candidate storage state path (set at runtime)
        self._storage_state_candidate = None

    def _log(self, level: str, message: str):
        """Helper: log to DB and also print to stdout for immediate feedback."""
        try:
            print(f"[linkedin][{level}] {message}")
        except:
            pass
        try:
            self.db.add_log(level, message, "linkedin")
        except:
            pass

    def login(self, page: Page) -> bool:
        """Login to LinkedIn (with enhanced verification)"""
        try:
            self.db.add_log("INFO", "Starting LinkedIn login", "linkedin")
            page.goto("https://www.linkedin.com/login", wait_until="domcontentloaded")
            random_wait(2, 4)

            # Check if already logged in by looking for a post-login element
            if wait_for_selector(page, 'img[alt*="profile picture"], .global-nav__me', timeout=5000):
                self.db.add_log("INFO", "Already logged in or login redirect detected", "linkedin")
                return True
            
            # --- Fill Login Form ---
            if not safe_fill(page, '#username', self.credentials["email"]):
                 self.db.add_log("ERROR", "Failed to fill email", "linkedin")
                 return False
                 
            random_wait(1, 2)
            
            if not safe_fill(page, '#password', self.credentials["password"]):
                 self.db.add_log("ERROR", "Failed to fill password", "linkedin")
                 return False
            
            random_wait(1, 2)
            # Click sign in
            if not safe_click(page, 'button[type="submit"]'):
                self.db.add_log("ERROR", "Failed to click sign in", "linkedin")
                return False
            
            random_wait(5, 8)
            
            # --- Verification of login success ---
            if "challenge" in page.url or "checkpoint" in page.url:
                self.db.add_log("WARNING", "2FA/Verification required. Please complete manually.", "linkedin")
                wait_for_selector(page, 'img[alt*="profile picture"], .global-nav__me', timeout=60000) # Wait 60s
            
            if wait_for_selector(page, 'img[alt*="profile picture"], .global-nav__me', timeout=15000):
                self._log("INFO", "Login successful (verified profile element)")
                return True
            
            self._log("ERROR", f"Login verification failed. Final URL: {page.url}")
            return False
            
        except Exception as e:
            self.db.add_log("ERROR", f"Login error: {str(e)}", "linkedin")
            return False

    def search_jobs(self, page: Page, max_jobs: int) -> List[Dict]:
        """Search for jobs using manual navigation and filtering for robustness"""
        try:
            self.db.add_log("INFO", "Starting robust job search", "linkedin")
            search_query = self.user_profile.get("role", "Software Developer")
            search_location = self.user_profile.get("location", "Worldwide")
            
            # 1. Force Navigation to Jobs Home
            page.goto("https://www.linkedin.com/jobs/", wait_until="domcontentloaded", timeout=60000)
            random_wait(4, 6)
            
            # 2. Type in Role Search Box
            self._log("INFO", f"Searching for Role: {search_query}")
            # Use a wider set of selectors and pick the first visible one
            role_box_selectors = [
                'input[aria-label*="Search jobs"]',
                'input[aria-label*="Search by title"]',
                'input[placeholder*="Search jobs"]',
                'input[id*="text-input-title"]',
            ]

            role_filled = False
            for sel in role_box_selectors:
                try:
                    if safe_fill(page, sel, search_query):
                        role_filled = True
                        break
                except:
                    continue

            if not role_filled:
                self.db.add_log("WARNING", "Failed to fill role search box with known selectors.", "linkedin")

            # 3. Type in Location Search Box
            self._log("INFO", f"Searching for Location: {search_location}")
            location_box_selectors = [
                'input[aria-label*="Search by location"]',
                'input[placeholder*="Search location"]',
                'input[id*="text-input-location"]'
            ]

            location_filled = False
            for sel in location_box_selectors:
                try:
                    if safe_fill(page, sel, search_location):
                        location_filled = True
                        # Press Enter in the location input to trigger search
                        page.locator(sel).first.press("Enter")
                        break
                except:
                    continue

            if not location_filled:
                # Fallback: press Enter to submit search
                page.keyboard.press("Enter")
                 
            random_wait(6, 10) # Wait for initial search results
            
            # 4. If we were redirected to the feed (home) instead of jobs, navigate via Jobs nav
            if '/feed' in page.url or '/mynetwork' in page.url or page.url.strip().endswith('/'):
                try:
                    self._log("INFO", "Detected feed/home URL after navigation — forcing Jobs nav click")
                    # Try several nav selectors
                    if safe_click(page, 'a[data-control-name="jobs_nav"]') or safe_click(page, 'a[href*="/jobs/"]'):
                        random_wait(3, 5)
                except:
                    pass

            # 5. Apply Easy Apply Filter (CRUCIAL)
            # Find the 'Easy Apply' filter button
            easy_apply_filter_selector = 'button[aria-label*="Easy Apply filter"], button:has-text("Easy Apply")'
            if safe_click(page, easy_apply_filter_selector):
                self._log("INFO", "Applied Easy Apply filter (f_AL=true)")
                random_wait(4, 6)
            else:
                self._log("WARNING", "Easy Apply filter button not found. May include external jobs.")

            # 5. Apply 'Most Recent' Sort Filter (Optional but good)
            sort_by_dropdown = page.locator('button[aria-label*="Sort by"]').first
            if sort_by_dropdown.count() > 0:
                sort_by_dropdown.click()
                random_wait(1, 2)
                if safe_click(page, 'span:has-text("Most recent")'):
                    self.db.add_log("INFO", "Applied 'Most recent' sort filter.", "linkedin")
                    random_wait(4, 6)

            # 6. Extract Jobs
            jobs = []
            card_selector = '.jobs-search-results__list-item, [data-occludable-job-id], li.jobs-search-results__list-item'
            
            # Scroll to load more jobs
            for _ in range(3): 
                scroll_randomly(page)
                random_wait(2, 3)
                
            job_cards = page.locator(card_selector)
            count = job_cards.count()
            self._log("INFO", f"Found {count} potential job cards after filtering")
            
            if count == 0:
                # Save a debug snapshot to help tune selectors
                try:
                    debug_dir = os.path.join(os.getcwd(), 'debug')
                    os.makedirs(debug_dir, exist_ok=True)
                    dump_path = os.path.join(debug_dir, f'linkedin_jobs_page_{int(time.time())}.html')
                    with open(dump_path, 'w', encoding='utf-8') as f:
                        f.write(page.content())
                    self._log("WARNING", f"No job cards found. Saved page snapshot to {dump_path}")
                except Exception as e:
                    self._log("WARNING", f"No job cards found and failed to save snapshot: {str(e)}")

            for i in range(min(count, max_jobs)):
                try:
                    card = job_cards.nth(i)
                    card.scroll_into_view_if_needed()
                    
                    # Click to load details pane
                    card.click(delay=random.uniform(100, 300))
                    random_wait(2, 4)
                    
                    details_pane = page.locator('.jobs-search__job-details--container, .jobs-details__main-content').first
                    if details_pane.count() == 0: continue
                    
                    job_title = extract_text_safe(details_pane, '.jobs-details-top-card__job-title, h2', "")
                    company = extract_text_safe(details_pane, '.jobs-details-top-card__company-name, .job-details-jobs-unified-top-card__company-name', "")
                    job_description = extract_text_safe(details_pane, '.jobs-description-content__text, #job-details', "")
                    
                    # Extract clean URL (The URL of the details pane)
                    job_url = page.url
                    if "job-details" in job_url:
                        job_url = job_url.split('/?')[0] # Clean up parameters

                    if job_title:
                         jobs.append({
                            "title": job_title,
                            "company": company,
                            "url": job_url,
                            "description": job_description,
                            "hr_email": None
                        })
                except Exception as e:
                    self.db.add_log("WARNING", f"Error extracting job {i}: {str(e)}", "linkedin")
                    continue
            return jobs
        except Exception as e:
            self.db.add_log("ERROR", f"Job search error: {str(e)}", "linkedin")
            return []
            
    def _handle_form_fields(self, page: Page, job: Dict):
        """Handle common form fields - Improved heuristic logic"""
        try:
            # 1. Phone Number
            phone_selectors = ['input[id*="phoneNumber"]', 'input[name*="phone"]']
            for selector in phone_selectors:
                if page.locator(selector).count() > 0:
                    val = page.locator(selector).input_value()
                    if not val: safe_fill(page, selector, self.user_profile["phone"])
            
            # 2. Resume Upload (If necessary, but LinkedIn usually pre-fills)
            resume_input = page.locator('input[type="file"]').first
            if resume_input.count() > 0 and resume_input.is_visible():
                try:
                    resume_path = config.RESUME_PATHS.get("default", "resumes/my_resume.pdf")
                    resume_input.set_input_files(resume_path)
                    self.db.add_log("INFO", "Filled resume input.", "linkedin")
                except:
                    self.db.add_log("WARNING", "Failed to set resume file.", "linkedin")
            
            # 3. Radio Buttons / Checkboxes / Text Inputs
            all_inputs = page.locator('input, textarea, select, fieldset')
            for i in range(all_inputs.count()):
                el = all_inputs.nth(i)
                if not el.is_visible(): continue
                
                # Try to get surrounding label/text for context
                context = ""
                try:
                    context = el.evaluate("e => e.closest('fieldset, div, form').innerText")
                except:
                    pass
                
                context_lower = context.lower()
                
                if el.get_attribute('type') in ('radio', 'checkbox') or el.tag_name() == 'fieldset':
                    if el.locator('input[type="radio"]:checked, input[type="checkbox"]:checked').count() == 0:
                        
                        # Heuristic: Prefer "Yes", "3+", or first option
                        if "sponsorship" in context_lower: # Prefer "No" for sponsorship
                            safe_click(el.locator('label:has-text("No")').first)
                        elif "authorize" in context_lower or "eligible" in context_lower: # Prefer "Yes"
                            safe_click(el.locator('label:has-text("Yes")').first)
                        elif "years" in context_lower or "experience" in context_lower:
                            # Try to select the option that matches profile experience
                            target = str(self.user_profile.get("experience_years", 3))
                            safe_click(el.locator(f'label:has-text("{target}+")').first)
                        else:
                            # Default: Click the first available option
                            safe_click(el.locator('label').first)
                            
                elif el.get_attribute('type') in ('text', 'number') or el.tag_name() == 'textarea':
                    if not el.input_value():
                        if "salary" in context_lower or "compensation" in context_lower:
                            safe_fill(el, "0") # Avoid entering real salary
                        elif "years" in context_lower or "months" in context_lower:
                            safe_fill(el, str(self.user_profile.get("experience_years", 3)))
                        elif "github" in context_lower or "portfolio" in context_lower:
                             safe_fill(el, "See Resume/LinkedIn Profile")
                        elif "why hire" in context_lower:
                            # LLM call here is ideal, but for now:
                             safe_fill(el, "Highly motivated and experienced developer ready to contribute immediately.")

        except Exception as e:
            self.db.add_log("WARNING", f"Form field handler error: {str(e)}", "linkedin")

    def _discard_application(self, page: Page):
        """Discard application to clean up state"""
        try:
            # Click X (Dismiss) button
            close_btn = page.locator('button[aria-label="Dismiss"], button[data-test-modal-close-btn]').first
            if close_btn.count() > 0:
                close_btn.click()
                random_wait(1, 2)
                # Confirm discard (e.g., 'Discard' button in the popup)
                discard_btn = page.locator('button:has-text("Discard")').first
                if discard_btn.count() > 0:
                    discard_btn.click()
                random_wait(1, 2)
        except:
            pass
            
    def apply_to_job(self, page: Page, job: Dict) -> bool:
        """Apply to a job using Easy Apply"""
        # ... (Your existing apply_to_job logic is good, just ensure it uses the new _handle_form_fields)
        try:
            self.db.add_log("INFO", f"Applying to: {job['title']}", "linkedin")
            # Ensure we are on the correct job page
            if job["url"] not in page.url:
                page.goto(job["url"])
                random_wait(3, 5)

            # Click Easy Apply
            if not safe_click(page, 'button:has-text("Easy Apply"), button[aria-label*="Easy Apply"]', timeout=5000):
                self.db.add_log("WARNING", "Easy Apply not available or button not found.", "linkedin")
                return False

            random_wait(2, 4)
            steps_taken = 0
            max_steps = 10
            
            while steps_taken < max_steps:
                steps_taken += 1
                random_wait(1, 2)
                
                # 1. Handle fields before proceeding
                self._handle_form_fields(page, job)
                
                # 2. Check for Submit
                submit_button = page.locator('button:has-text("Submit application"), button[aria-label*="Submit application"]').first
                if submit_button.count() > 0 and submit_button.is_visible() and not submit_button.is_disabled():
                    self.db.add_log("INFO", "Clicking Submit Application", "linkedin")
                    submit_button.click()
                    random_wait(3, 5)
                    # Check for success message or modal closure
                    if page.locator('text="Your application has been submitted"').count() > 0 or \
                       wait_for_selector(page, '[data-test-modal-close-btn]', 5000):
                        self.db.add_log("SUCCESS", "Application submitted successfully.", "linkedin")
                        self._discard_application(page) # Use discard to close success modal
                        return True
                    return True

                # 3. Check for Next or Review
                next_button = page.locator('button:has-text("Next"), button:has-text("Review")').first
                if next_button.count() > 0 and next_button.is_visible() and not next_button.is_disabled():
                    button_text = next_button.inner_text()
                    self.db.add_log("INFO", f"Clicking {button_text}", "linkedin")
                    next_button.click()
                    random_wait(3, 4)
                    
                    # Check for errors after clicking Next
                    if page.locator('.artdeco-inline-feedback__message, .artdeco-inline-feedback--error').count() > 0:
                        self.db.add_log("WARNING", "Form validation failed after clicking Next.", "linkedin")
                        self._discard_application(page)
                        return False
                    continue
                
                # If neither Next nor Submit, break loop
                break
                
            self.db.add_log("WARNING", "Application flow stuck or timed out.", "linkedin")
            self._discard_application(page)
            return False

        except Exception as e:
            self.db.add_log("ERROR", f"Application error: {str(e)}", "linkedin")
            self._discard_application(page)
            return False


    def run(self, max_jobs: int = None):
        """Main automation flow (with anti-detection arguments). Use safe config accessors and optional cookie storage."""
        try:
            with sync_playwright() as p:
                # compute runtime settings from config with defaults
                headless = config.AUTOMATION_CONFIG.get("headless", False)
                slow_mo = config.AUTOMATION_CONFIG.get("slow_mo", 0)
                max_jobs_cfg = config.AUTOMATION_CONFIG.get("max_jobs_per_run", 20)
                threshold = config.AUTOMATION_CONFIG.get("score_threshold", 50)

                if max_jobs is None:
                    max_jobs = max_jobs_cfg

                self.browser = p.chromium.launch(
                    headless=headless,
                    slow_mo=slow_mo,
                    # Add anti-detection arguments
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-blink-features=AutomationControlled'
                    ]
                )

                # Optionally load storage state (cookies) if present and enabled
                storage_state_path = None
                try:
                    if config.CREDENTIALS.get("linkedin", {}).get("use_cookies"):
                        candidate = os.path.join(os.getcwd(), 'cookies', 'linkedin_storage.json')
                        if os.path.exists(candidate):
                            storage_state_path = candidate
                            self.db.add_log("INFO", f"Loading LinkedIn storage_state from {candidate}", "linkedin")
                except Exception:
                    pass

                if storage_state_path:
                    context = self.browser.new_context(
                        storage_state=storage_state_path,
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
                        viewport={"width": 1920, "height": 1080},
                    )
                else:
                    context = self.browser.new_context(
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
                        viewport={"width": 1920, "height": 1080},
                    )

                self.page = context.new_page()
                # Run script to modify navigator properties to hide automation
                try:
                    self.page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
                except:
                    pass

                if not self.login(self.page):
                    self.db.add_log("ERROR", "Login failed, aborting", "linkedin")
                    return

                # If cookies saving is enabled and we didn't load a storage state, save current state
                try:
                    if config.CREDENTIALS.get("linkedin", {}).get("use_cookies"):
                        # candidate was computed earlier when checking for existing file
                        if not storage_state_path:
                            candidate = os.path.join(os.getcwd(), 'cookies', 'linkedin_storage.json')
                            os.makedirs(os.path.dirname(candidate), exist_ok=True)
                            context.storage_state(path=candidate)
                            self._log("INFO", f"Saved LinkedIn storage_state to {candidate}")
                except Exception as e:
                    self._log("WARNING", f"Failed to save storage_state: {str(e)}")

                jobs = self.search_jobs(self.page, max_jobs)
                applied_count = 0

                for job in jobs:
                    if self.db.job_exists(job["url"]):
                        self.db.add_log("INFO", f"Already applied: {job['title']}", "linkedin")
                        continue
                    
                    # Evaluate job with LLM and rules
                    evaluation = self.ollama.evaluate_job_relevance(job["title"], job.get("description", ""), self.user_profile)
                    should_apply_rule, score_rule, reason_rule = self.job_matcher.match_job(job["title"], job.get("description", ""))

                    final_score = int((evaluation.get("score", 0) + score_rule) / 2)
                    
                    if final_score >= threshold:
                        if self.apply_to_job(self.page, job):
                            applied_count += 1
                            self.db.add_job_application(
                                platform="linkedin",
                                company=job.get("company", "Unknown"),
                                job_title=job["title"],
                                job_url=job["url"],
                                relevance_score=final_score,
                                notes=f"LLM: {evaluation.get('reasoning', '')}; Rules: {reason_rule}"
                            )
                            self.db.add_log("SUCCESS", f"Applied to: {job['title']} (Score: {final_score})", "linkedin")
                        else:
                            self.db.add_log("WARNING", f"Failed to apply: {job['title']}", "linkedin")
                    else:
                        self.db.add_log("INFO", f"Skipped (low relevance): {job['title']} - Score: {final_score}", "linkedin")
                        
                    random_wait(5, 10) # Longer break between applications
                    
                self.db.add_log("INFO", f"LinkedIn automation complete. Applied to {applied_count} jobs", "linkedin")
        except Exception as e:
            self.db.add_log("ERROR", f"LinkedIn automation error: {str(e)}", "linkedin")
            self.db.add_log("ERROR", f"Traceback: {traceback.format_exc()}", "linkedin")
        finally:
            try:
                if self.browser:
                    self.browser.close()
            except:
                pass

if __name__ == "__main__":
    # Initialize dependencies
    job_db = JobDatabase()
    ollama_client = OllamaClient(config.OLLAMA_CONFIG)
    
    # Run the automation
    automation = LinkedInAutomation(job_db, ollama_client)
    automation.run()