# Setup Checklist

Follow these steps to get your AutoPilot Job Application System running:

## ✅ Prerequisites

- [ ] Python 3.8+ installed
- [ ] Ollama installed and running
- [ ] Internet connection

## ✅ Installation Steps

1. [ ] Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. [ ] Install Playwright browsers:
   ```bash
   playwright install chromium
   ```

3. [ ] Install and start Ollama:
   ```bash
   # Install Ollama from https://ollama.ai
   ollama serve
   ```

4. [ ] Pull an Ollama model (in a new terminal):
   ```bash
   ollama pull llama3
   # OR
   ollama pull mistral-nemo
   # OR
   ollama pull codellama
   ```

## ✅ Configuration

5. [ ] Edit `config.py` and add your credentials:
   - LinkedIn email and password
   - Naukri email and password
   - Indeed email and password (optional)

6. [ ] Add your resume PDF to `resumes/` folder:
   - `resumes/resume_default.pdf` (required)

7. [ ] (Optional) Update user profile in `config.py` if different from default

## ✅ Testing

8. [ ] Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

9. [ ] Test the system:
   ```bash
   python app.py
   ```
   Then open: http://localhost:5000

## ✅ First Run

10. [ ] Open the dashboard in your browser
11. [ ] Click "START AUTO APPLY"
12. [ ] Monitor the logs and job applications

## Troubleshooting

- **Ollama not connecting**: Make sure `ollama serve` is running
- **Login fails**: Check credentials in `config.py`
- **No jobs found**: Check internet connection and search filters
- **Playwright errors**: Run `playwright install chromium --force`

## Next Steps

- Review applications in the dashboard
- Update job statuses as you receive responses
- Customize job matching criteria in `config.py`
- Add more resume versions for different job types

---

**Ready to start? Run `python app.py` or use `start.sh` (Linux/Mac) / `start.bat` (Windows)**

