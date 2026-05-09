"""
core — shared business logic layer.

This package owns the reusable service classes that power every entry point:
  - FastAPI backend  (backend/)
  - Telegram bot     (src/telegram_bot.py)
  - Streamlit        (src/dashboard.py)

Environment variables are loaded once here, so individual
modules don't need their own load_dotenv() calls.
"""

from dotenv import load_dotenv

load_dotenv()

from core.database import Database
from core.enrichment import LeadEnrichment
from core.email_generator import EmailGenerator

__all__ = ["Database", "LeadEnrichment", "EmailGenerator"]
