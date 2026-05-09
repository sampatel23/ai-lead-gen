"""
FastAPI dependency injection.

Creates singleton instances of your EXISTING service classes (from src/)
and provides them to route handlers via Depends().

This is the bridge between FastAPI and your current business logic —
no code duplication, just wiring.
"""

from functools import lru_cache

from src.database import Database
from src.enrichment import LeadEnrichment
from src.email_generator import EmailGenerator


@lru_cache()
def get_db() -> Database:
    """Singleton Database instance — reused across all requests."""
    return Database()


@lru_cache()
def get_enrichment() -> LeadEnrichment:
    """Singleton LeadEnrichment instance."""
    return LeadEnrichment()


@lru_cache()
def get_email_generator() -> EmailGenerator:
    """Singleton EmailGenerator instance."""
    return EmailGenerator()
