"""
Centralized configuration.
Loads from the same .env file the rest of the project already uses.
"""

from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    """Simple settings container — no extra dependencies needed."""

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # FastAPI settings
    APP_TITLE: str = "AI Lead Generation API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"


settings = Settings()
