# How to Enter Credentials

## Location
Open the file: **`config.py`**

## Find the CREDENTIALS Section
Look for line 120 (around line 119-142)

## Enter Your Credentials

Replace the empty strings (`""`) with your actual credentials:

```python
CREDENTIALS = {
    "linkedin": {
        "email": "your-linkedin-email@example.com",  # ← Enter your LinkedIn email here
        "password": "your-linkedin-password",         # ← Enter your LinkedIn password here
        "use_cookies": True  # Keep this as True to use saved session
    },
    "naukri": {
        "email": "your-naukri-email@example.com",     # ← Enter your Naukri email here
        "password": "your-naukri-password"            # ← Enter your Naukri password here
    },
    "indeed": {
        "email": "",  # Optional - leave empty if not using
        "password": ""
    },
    "wellfound": {
        "email": "",  # Optional - leave empty if not using
        "password": ""
    },
    "hirist": {
        "email": "",  # Optional - leave empty if not using
        "password": ""
    }
}
```

## Example

```python
CREDENTIALS = {
    "linkedin": {
        "email": "prabhat.kumar@example.com",
        "password": "MySecurePassword123",
        "use_cookies": True
    },
    "naukri": {
        "email": "prabhat.kumar@example.com",
        "password": "MyNaukriPassword456"
    },
    # ... rest of the platforms
}
```

## Important Notes

1. **Keep the quotes**: Make sure your email and password are inside quotes `""`
2. **No spaces**: Don't add extra spaces around the `=` sign
3. **Save the file**: After editing, save the file (Ctrl+S or Cmd+S)
4. **Security**: Never share your `config.py` file or commit it to public repositories

## After Entering Credentials

1. Save the `config.py` file
2. Run the application: `python3 app.py`
3. The system will use these credentials to log in automatically

## Troubleshooting

- **Login fails?** Double-check your email and password are correct
- **Special characters in password?** Make sure they're inside quotes
- **Two-factor authentication?** You may need to handle 2FA manually the first time


