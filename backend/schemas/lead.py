"""
Pydantic models for API request/response validation.
These are the API contracts — they don't replace your existing business logic.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Request Models ──────────────────────────────────

class LeadCreate(BaseModel):
    """POST /lead request body"""
    company_name: str = Field(..., min_length=1, examples=["Stripe"])
    domain: Optional[str] = Field(None, examples=["stripe.com"])
    contact_person: Optional[str] = Field(None, examples=["Patrick Collison"])


# ── Response Models ─────────────────────────────────

class LeadOut(BaseModel):
    """Single lead in API responses"""
    id: str
    company_name: str
    domain: Optional[str] = None
    contact_person: Optional[str] = None
    status: Optional[str] = None
    enrichment_status: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    company_summary: Optional[str] = None
    outreach_angle: Optional[str] = None
    pain_points: Optional[str] = None
    email: Optional[str] = None
    generated_email: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    """GET /stats response"""
    total: int
    enriched: int
    pending: int
    with_emails: int


class APIResponse(BaseModel):
    """Standard wrapper for all API responses"""
    success: bool
    data: Optional[dict | list] = None
    message: Optional[str] = None
    error: Optional[str] = None
