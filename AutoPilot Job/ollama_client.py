"""
Ollama LLM client for zero-cost local AI operations
"""

import requests
import json
import time
from typing import Dict, Optional
import config


class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or config.OLLAMA_CONFIG["base_url"]
        self.model = model or config.OLLAMA_CONFIG["model"]
        self.timeout = config.OLLAMA_CONFIG["timeout"]

    def _check_model_available(self) -> bool:
        """Check if the model is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return any(m.get("name", "").startswith(self.model) for m in models)
            return False
        except:
            return False

    def _generate(self, prompt: str, system_prompt: str = None) -> Optional[str]:
        """Generate text using Ollama"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            if system_prompt:
                payload["system"] = system_prompt

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                print(f"Ollama API error: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error calling Ollama: {e}")
            return None

    def evaluate_job_relevance(self, job_title: str, job_description: str, user_profile: Dict) -> Dict:
        """
        Evaluate job relevance and return score + reasoning
        Returns: {"score": 0-100, "reasoning": str, "should_apply": bool}
        """
        criteria = config.JOB_CRITERIA

        system_prompt = """You are a job matching assistant. Evaluate job postings based on specific criteria.
Return ONLY a JSON object with: {"score": 0-100, "reasoning": "brief explanation", "should_apply": true/false}"""

        prompt = f"""Evaluate this job posting:

Title: {job_title}
Description: {job_description[:1000]}

User Profile:
- Role: {user_profile['role']}
- Experience: {user_profile['experience_years']} years
- Skills: {', '.join(user_profile['skills'])}

Matching Criteria:
- Accepted titles: {', '.join(criteria['accepted_titles'])}
- Rejected keywords: {', '.join(criteria['rejected_keywords'])}
- Experience range: {criteria['min_experience']}-{criteria['max_experience']} years
- Reject senior roles: {criteria['reject_senior_roles']}

Return JSON only: {{"score": number, "reasoning": "text", "should_apply": boolean}}"""

        response = self._generate(prompt, system_prompt)

        if response:
            try:
                # Try to extract JSON from response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    return result
            except:
                pass

        # Fallback: simple rule-based scoring
        return self._fallback_scoring(job_title, job_description, criteria)

    def _fallback_scoring(self, job_title: str, job_description: str, criteria: Dict) -> Dict:
        """Fallback scoring if LLM fails"""
        score = 50
        should_apply = False
        reasoning = "Using fallback scoring"

        job_text = (job_title + " " + job_description).lower()

        # Check title match
        if any(title.lower() in job_title.lower() for title in criteria['accepted_titles']):
            score += 30
            should_apply = True

        # Check rejected keywords
        if any(keyword.lower() in job_text for keyword in criteria['rejected_keywords']):
            score -= 50
            should_apply = False

        # Check senior roles
        if criteria['reject_senior_roles']:
            if any(keyword.lower() in job_text for keyword in criteria['senior_keywords']):
                score -= 30
                should_apply = False

        score = max(0, min(100, score))
        return {"score": score, "reasoning": reasoning, "should_apply": should_apply}

    def tailor_resume_text(self, job_title: str, job_description: str, user_profile: Dict) -> str:
        """Generate tailored resume summary for a specific job using actual resume content"""
        system_prompt = """You are a resume tailoring assistant. Generate a brief professional summary 
(2-3 sentences) highlighting relevant experience and skills for the job based on the user's actual resume."""

        # Build comprehensive resume summary
        work_exp_text = ""
        if user_profile.get('work_experience'):
            for exp in user_profile['work_experience']:
                work_exp_text += f"\n- {exp['title']} at {exp['company']} ({exp['duration']}): "
                work_exp_text += "; ".join(exp.get('responsibilities', [])[:3])
                if exp.get('projects'):
                    for proj in exp['projects']:
                        work_exp_text += f"\n  Project: {proj['name']} - {proj.get('role', '')}"

        projects_text = ""
        if user_profile.get('personal_projects'):
            for proj in user_profile['personal_projects']:
                projects_text += f"\n- {proj['name']}: {proj.get('description', '')}"

        prompt = f"""Job Title: {job_title}
Job Description: {job_description[:800]}

User Resume:
- Name: {user_profile['name']}
- Role: {user_profile['role']}
- Experience: {user_profile['experience_years']} years
- Summary: {user_profile.get('summary', '')}
- Skills: {', '.join(user_profile['skills'])}
- Work Experience: {work_exp_text}
- Personal Projects: {projects_text}
- Education: {user_profile.get('education', {}).get('degree', '')} - {user_profile.get('education', {}).get('cgpa', '')} CGPA
- Portfolio: {user_profile['portfolio']}

Generate a 2-3 sentence professional summary tailored to this specific job. Highlight the most relevant experience, 
projects, and skills that match the job requirements. Be specific and mention actual achievements."""

        response = self._generate(prompt, system_prompt)
        
        # Fallback to default if LLM fails
        if not response or len(response) < 50:
            summary = user_profile.get('summary', '')
            skills = ', '.join(user_profile['skills'][:5])
            return f"{summary} Proficient in {skills} with {user_profile['experience_years']}+ years of hands-on experience."
        
        return response

    def generate_cover_letter(self, job_title: str, company: str, job_description: str, user_profile: Dict) -> str:
        """Generate a cover letter for the job using actual resume content"""
        system_prompt = """You are a professional cover letter writer. Write concise, professional cover letters 
based on the applicant's actual resume and experience."""

        # Build detailed experience summary
        work_exp_detail = ""
        if user_profile.get('work_experience'):
            for exp in user_profile['work_experience']:
                work_exp_detail += f"\n{exp['title']} at {exp['company']} ({exp['duration']}):\n"
                for resp in exp.get('responsibilities', []):
                    work_exp_detail += f"  • {resp}\n"
                if exp.get('projects'):
                    for proj in exp['projects']:
                        work_exp_detail += f"\n  Key Project: {proj['name']}\n"
                        work_exp_detail += f"  Role: {proj.get('role', '')}\n"
                        for ach in proj.get('achievements', []):
                            work_exp_detail += f"  • {ach}\n"

        prompt = f"""Write a professional cover letter for:

Position: {job_title}
Company: {company}
Job Description: {job_description[:1000]}

Applicant Resume:
- Name: {user_profile['name']}
- Role: {user_profile['role']}
- Experience: {user_profile['experience_years']} years
- Professional Summary: {user_profile.get('summary', '')}
- Key Skills: {', '.join(user_profile['skills'])}
- Work Experience: {work_exp_detail}
- Education: {user_profile.get('education', {}).get('degree', '')} from {user_profile.get('education', {}).get('university', '')} (CGPA: {user_profile.get('education', {}).get('cgpa', '')})
- Portfolio: {user_profile['portfolio']}
- Contact: {user_profile.get('phone', '')} | {user_profile.get('email', '')}

Write a 3-4 paragraph cover letter. Be professional, concise, and highlight specific relevant experience and 
achievements from the resume that match the job requirements. Mention actual projects and technologies used."""

        response = self._generate(prompt, system_prompt)
        return response or self._default_cover_letter(job_title, company, user_profile)

    def _default_cover_letter(self, job_title: str, company: str, user_profile: Dict) -> str:
        """Default cover letter template"""
        return f"""Dear Hiring Manager,

I am writing to express my interest in the {job_title} position at {company}. With {user_profile['experience_years']}+ years of experience as a {user_profile['role']}, I am excited about the opportunity to contribute to your team.

My expertise includes {', '.join(user_profile['skills'][:5])}, and I have a proven track record of developing scalable backend solutions. I am particularly drawn to this role because it aligns with my passion for building robust, efficient systems.

I would welcome the opportunity to discuss how my skills and experience can benefit {company}. Thank you for considering my application.

Best regards,
{user_profile['name']}"""

    def generate_recruiter_message(self, job_title: str, company: str, user_profile: Dict) -> str:
        """Generate a brief message for recruiters"""
        system_prompt = """Generate brief, professional LinkedIn messages for recruiters."""

        prompt = f"""Write a brief (2-3 sentences) professional message to a recruiter about:

Position: {job_title}
Company: {company}

Applicant: {user_profile['name']}, {user_profile['role']} with {user_profile['experience_years']} years experience.
Skills: {', '.join(user_profile['skills'][:5])}

Keep it concise and professional."""

        response = self._generate(prompt, system_prompt)
        return response or f"Hi, I'm interested in the {job_title} position at {company}. I'm a {user_profile['role']} with {user_profile['experience_years']}+ years of experience. Would love to connect!"

