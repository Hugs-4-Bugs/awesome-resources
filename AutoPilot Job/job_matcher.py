"""
Job matching logic based on user criteria
"""

import re
from typing import Dict, Tuple
import config


class JobMatcher:
    def __init__(self):
        self.criteria = config.JOB_CRITERIA
        self.user_profile = config.USER_PROFILE

    def match_job(self, job_title: str, job_description: str, experience_required: str = None, location: str = None) -> Tuple[bool, float, str]:
        """
        Match job against criteria
        Returns: (should_apply, score, reason)
        """
        score = 0
        reasons = []

        job_text = (job_title + " " + job_description).lower()

        # Check title match
        title_match = False
        for accepted_title in self.criteria["accepted_titles"]:
            if accepted_title.lower() in job_title.lower():
                score += 40
                title_match = True
                reasons.append(f"Title matches: {accepted_title}")
                break

        if not title_match:
            reasons.append("Title doesn't match accepted titles")
            return False, 0, "Title mismatch"

        # Check rejected keywords
        for keyword in self.criteria["rejected_keywords"]:
            if keyword.lower() in job_text:
                reasons.append(f"Contains rejected keyword: {keyword}")
                return False, 0, f"Rejected keyword: {keyword}"

        # Check senior roles
        if self.criteria["reject_senior_roles"]:
            for senior_keyword in self.criteria["senior_keywords"]:
                if senior_keyword.lower() in job_text:
                    reasons.append(f"Senior role detected: {senior_keyword}")
                    return False, 0, f"Senior role: {senior_keyword}"

        # Check experience requirements
        if experience_required:
            exp_match = self._check_experience(experience_required)
            if exp_match:
                score += 30
                reasons.append(f"Experience requirement matches: {experience_required}")
            else:
                reasons.append(f"Experience requirement mismatch: {experience_required}")
                # Don't reject, just lower score

        # Check location
        if location:
            location_lower = location.lower()
            if any(acc_loc.lower() in location_lower for acc_loc in self.criteria["accepted_locations"]):
                score += 20
                reasons.append(f"Location acceptable: {location}")
            elif "remote" in location_lower or "hybrid" in location_lower:
                score += 20
                reasons.append(f"Location acceptable: {location}")

        # Check skills match
        skills_found = 0
        for skill in self.user_profile["skills"]:
            if skill.lower() in job_text:
                skills_found += 1

        if skills_found > 0:
            score += min(30, skills_found * 5)
            reasons.append(f"Matched {skills_found} skills")

        score = min(100, score)
        should_apply = score >= 50

        reason_text = "; ".join(reasons) if reasons else "No specific reason"
        return should_apply, score, reason_text

    def _check_experience(self, experience_text: str) -> bool:
        """Check if experience requirement matches criteria"""
        if not experience_text:
            return True

        # Extract numbers from experience text
        numbers = re.findall(r'\d+', experience_text)
        if not numbers:
            return True

        try:
            # Get first number (usually min years)
            min_years = int(numbers[0])
            if len(numbers) > 1:
                max_years = int(numbers[1])
            else:
                max_years = min_years + 2

            # Check if overlaps with acceptable range
            criteria_min = self.criteria["min_experience"]
            criteria_max = self.criteria["max_experience"]

            return not (max_years < criteria_min or min_years > criteria_max)
        except:
            return True

    def extract_job_details(self, job_text: str) -> Dict:
        """Extract job details from text"""
        details = {
            "experience_required": None,
            "location": None,
            "employment_type": None
        }

        # Try to extract experience
        exp_patterns = [
            r'(\d+)[-\+]?\s*years?\s*(?:of\s*)?experience',
            r'experience[:\s]+(\d+)[-\+]?\s*years?',
            r'(\d+)[-\+]?\s*years?\s*exp'
        ]
        for pattern in exp_patterns:
            match = re.search(pattern, job_text, re.IGNORECASE)
            if match:
                details["experience_required"] = match.group(1) + " years"
                break

        # Try to extract location
        location_keywords = ["remote", "hybrid", "onsite", "on-site", "work from home"]
        for keyword in location_keywords:
            if keyword.lower() in job_text.lower():
                details["location"] = keyword.title()
                break

        return details

