"""
Utility functions for human-like behavior and common operations
"""

import random
import time
from playwright.sync_api import Page
from typing import Optional, Tuple
import config


def random_wait(min_seconds: float = None, max_seconds: float = None):
    """Random wait between actions"""
    min_sec = min_seconds or config.AUTOMATION_CONFIG["min_wait_seconds"]
    max_sec = max_seconds or config.AUTOMATION_CONFIG["max_wait_seconds"]
    wait_time = random.uniform(min_sec, max_sec)
    time.sleep(wait_time)


def human_like_typing(page: Page, selector: str, text: str, delay_range: Tuple[float, float] = (0.05, 0.2)):
    """Type text with human-like delays"""
    element = page.locator(selector)
    element.click()
    random_wait(0.5, 1.0)

    for char in text:
        element.type(char, delay=random.uniform(*delay_range))
        if random.random() < 0.1:  # 10% chance of pause
            time.sleep(random.uniform(0.2, 0.5))


def random_mouse_movement(page: Page):
    """Perform random mouse movement"""
    if not config.AUTOMATION_CONFIG["enable_mouse_movement"]:
        return

    try:
        viewport = page.viewport_size
        if viewport:
            x = random.randint(0, viewport["width"])
            y = random.randint(0, viewport["height"])
            page.mouse.move(x, y)
            time.sleep(random.uniform(0.1, 0.3))
    except:
        pass


def scroll_randomly(page: Page):
    """Random scroll to simulate human behavior"""
    try:
        scroll_amount = random.randint(100, 500)
        direction = random.choice([-1, 1])
        page.mouse.wheel(0, scroll_amount * direction)
        random_wait(0.5, 1.5)
    except:
        pass


def safe_click(page: Page, selector: str, timeout: int = 5000) -> bool:
    """Safely click an element with error handling"""
    try:
        element = page.locator(selector)
        element.wait_for(state="visible", timeout=timeout)
        random_mouse_movement(page)
        element.click()
        random_wait(1, 2)
        return True
    except Exception as e:
        print(f"Failed to click {selector}: {e}")
        return False


def safe_fill(page: Page, selector: str, text: str, timeout: int = 5000) -> bool:
    """Safely fill an input field"""
    try:
        element = page.locator(selector).first
        element.wait_for(state="visible", timeout=timeout)
        element.click()
        random_wait(0.3, 0.7)
        element.fill("")  # Clear first
        random_wait(0.2, 0.4)
        # Type character by character for better reliability
        for char in text:
            element.type(char, delay=random.uniform(50, 150))
            if random.random() < 0.1:  # 10% chance of pause
                time.sleep(random.uniform(0.1, 0.3))
        return True
    except Exception as e:
        print(f"Failed to fill {selector}: {e}")
        return False


def wait_for_selector(page: Page, selector: str, timeout: int = 10000) -> bool:
    """Wait for selector to appear"""
    try:
        page.wait_for_selector(selector, timeout=timeout)
        return True
    except:
        return False


def extract_text_safe(page: Page, selector: str, default: str = "") -> str:
    """Safely extract text from element"""
    try:
        element = page.locator(selector)
        if element.count() > 0:
            return element.first.inner_text()
        return default
    except:
        return default


def get_random_resume_path() -> str:
    """Get a random resume path"""
    import os
    resume_paths = config.RESUME_PATHS
    available = [path for path in resume_paths.values() if os.path.exists(path)]
    if available:
        return random.choice(available)
    return resume_paths["default"]


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    import re
    # Remove invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename


def format_date(date_str: str) -> str:
    """Format date string for display"""
    try:
        from datetime import datetime
        dt = datetime.fromisoformat(date_str)
        return dt.strftime("%Y-%m-%d %H:%M")
    except:
        return date_str

