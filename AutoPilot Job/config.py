"""
Configuration file for AutoPilot Job Application System
"""

# User Profile
USER_PROFILE = {
    "name": "Prabhat Kumar",
    "role": "Java Backend Developer",
    "experience_years": 3,
    "phone": "+91 9663076023",
    "email": "mailtoprabhat72@gmail.com",
    "location": "Bengaluru, India",
    "portfolio": "https://prabhat-codes.vercel.app",
    "skills": [
        "Java",
        "Spring Boot",
        "Hibernate",
        "RESTful API",
        "MySQL",
        "SQL",
        "AWS",
        "EC2",
        "S3",
        "RDS",
        "JWT",
        "Docker",
        "GitHub",
        "Postman",
        "Maven",
        "Spring Security",
        "Apache POI",
        "JIRA",
        "Agile"
    ],
    "summary": """Proactive Java Backend Developer with 3 years of experience in designing and implementing 
high-performance RESTful APIs using Spring Boot and Hibernate. Expertise in database management (MySQL, SQL), 
cloud deployment (AWS EC2, S3, RDS), and version control (GitHub). Proficient in developing robust CRUD functionality, 
implementing security (JWT), and utilizing tools like Postman and Docker.""",
    "work_experience": [
        {
            "title": "Java Software Developer",
            "company": "Netcore Cloud",
            "duration": "Jan 2023 – Present",
            "type": "Full-time (Onsite)",
            "responsibilities": [
                "Developed and maintained scalable backend services using Spring Boot",
                "Integrated AWS services (EC2, RDS, S3) for deployment and cloud storage",
                "Designed and optimized complex SQL queries and database schemas in MySQL using Hibernate",
                "Collaborated with cross-functional teams using agile methodologies"
            ],
            "projects": [
                {
                    "name": "Real Estate Listing & Blog Management System",
                    "role": "Led backend development for blog module (team of 8 engineers)",
                    "achievements": [
                        "Designed and implemented REST APIs for blog management",
                        "Built database tables and relationships for blogs, comments, and user actions",
                        "Applied Spring Security + JWT for secure API access",
                        "Implemented like/dislike functionality to boost user engagement"
                    ],
                    "technologies": ["Java", "Spring Boot", "Hibernate", "MySQL", "RESTful APIs", "Maven", "Postman"]
                }
            ]
        }
    ],
    "personal_projects": [
        {
            "name": "Cafe Management System",
            "description": "Developed backend using Spring Boot for café management system",
            "features": [
                "Secure login & authentication using Spring Security & JWT",
                "Product management with inventory tracking",
                "Role-based access control (RBAC)",
                "Bulk product upload from Excel using Apache POI"
            ],
            "technologies": ["Java", "Spring Boot", "Hibernate", "MySQL", "RESTful APIs", "Maven", "Postman"]
        }
    ],
    "education": {
        "degree": "BE in Computer Science & Engineering",
        "university": "Visvesvaraya Technological University",
        "duration": "2019 – 2023",
        "location": "Bengaluru, India",
        "cgpa": 7.2
    },
    "certifications": [
        "J.P. Morgan Software Engineering Virtual Internship (Oct '25)",
        "Datacom Software Development Virtual Internship (Oct '25)",
        "Electronic Arts Software Engineering Virtual Internship",
        "AWS Solutions Architecture Virtual Internship"
    ]
}

# Job Matching Criteria
JOB_CRITERIA = {
    "accepted_titles": [
        "Java Developer",
        "Backend Developer",
        "Spring Boot Developer",
        "Java Engineer",
        "Microservices Engineer",
        "Java Backend Developer",
        "Backend Engineer",
        "Software Developer",
        "Java Software Developer",
        "API Developer",
        "REST API Developer"
    ],
    "rejected_keywords": [".NET", "Python", "PHP", "Frontend", "React", "Angular", "Vue", "Node.js", "JavaScript"],
    "min_experience": 1,
    "max_experience": 5,
    "accepted_locations": ["Remote", "Hybrid", "Any", "Bengaluru", "Bangalore", "India"],
    "reject_senior_roles": True,
    "senior_keywords": ["Senior", "Lead", "Principal", "Architect", "Staff"],
    "preferred_keywords": ["Spring Boot", "Hibernate", "REST API", "MySQL", "AWS", "Microservices"],
    "recent_posting_days": 7  # Only consider jobs posted in last 7 days
}

# Platform Credentials (User needs to fill these)
CREDENTIALS = {
    "linkedin": {
        "email": "prabhatkumarssm72@gmail.com",  # Your LinkedIn email
        "password": "Prabhat72@",  # Your LinkedIn password
        "use_cookies": True  # Use saved session cookies
    },
    "naukri": {
        "email": "mailtoprabhat72@gmail.com",  # Your Naukri email
        "password": "Prabhat72@"  # Your Naukri password
    },
    "indeed": {
        "email": "",  # User to fill
        "password": ""  # User to fill
    },
    "wellfound": {
        "email": "",  # User to fill
        "password": ""  # User to fill
    },
    "hirist": {
        "email": "",  # User to fill
        "password": ""  # User to fill
    }
}

# Email Configuration (for sending CV and follow-ups)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",  # Change for other providers
    "smtp_port": 587,
    "sender_email": "mailtoprabhat72@gmail.com",  # Your email
    "sender_password": "azxt jzsi pxvr rxgj",  # App password (not regular password)
    "sender_name": "Prabhat Kumar",
    "enable_tls": True
}

# Follow-up Email Settings
FOLLOWUP_CONFIG = {
    "enabled": True,
    "days_after_application": 7,  # Send follow-up 7 days after application
    "max_followups": 2,  # Maximum number of follow-ups per application
    "followup_interval_days": 5  # Days between follow-ups
}

# Ollama Configuration
OLLAMA_CONFIG = {
    "base_url": "http://localhost:11434",
    "model": "mistral",  # Using mistral model (you have mistral:latest installed)
    "timeout": 120
}

# Automation Settings
AUTOMATION_CONFIG = {
    "min_wait_seconds": 2,
    "max_wait_seconds": 9,
    "headless": False,  # Set to True for background operation
    "slow_mo": 100,  # Milliseconds between actions
    "max_jobs_per_run": 20,  # Limit jobs per session
    "enable_mouse_movement": True
}

# Database Configuration
DATABASE_PATH = "job_applications.db"

# Resume Paths
RESUME_PATHS = {
    "default": "resumes/resume_default.pdf",
    "java_backend": "resumes/resume_java_backend.pdf",
    "microservices": "resumes/resume_microservices.pdf"
}

# Cover Letter Templates
COVER_LETTER_TEMPLATES = [
    "templates/cover_letter_1.txt",
    "templates/cover_letter_2.txt",
    "templates/cover_letter_3.txt"
]

