"""
Pydantic models for API request/response validation.
These are the API contracts — they don't replace your existing business logic.
"""

from pydantic import BaseModel, Field
from typing import Optional, Generic, TypeVar, List
from datetime import datetime
from typing import Literal

T = TypeVar("T")

# ── Request Models ──────────────────────────────────

class LeadCreate(BaseModel):
    """POST /lead request body"""
    company_name: str = Field(..., min_length=1, examples=["Stripe"])
    # Permissive regex: just ensures there's at least one dot in the middle, and no spaces.
    domain: Optional[str] = Field(
        None, 
        pattern=r"^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        examples=["stripe.com", "api.stripe.com"]
    )
    contact_person: Optional[str] = Field(None, examples=["Patrick Collison"])


class GenerateEmailRequest(BaseModel):
    """Optional settings-aware payload for POST /generate-email/{lead_id}."""
    lead_id: Optional[str] = Field(None, examples=["123"])
    tone: Literal["concise", "professional", "casual"] = "professional"
    cta_strength: Literal["soft", "moderate", "strong"] = "moderate"
    max_length: Literal["short", "medium", "long"] = "medium"


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
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class IndustryCount(BaseModel):
    name: str
    value: int

class DateCount(BaseModel):
    date: str
    count: int

class StatsOut(BaseModel):
    """GET /stats response"""
    total: int
    enriched: int
    pending: int
    failed: int
    with_emails: int
    industry_distribution: List[IndustryCount] = []
    leads_over_time: List[DateCount] = []


class APIResponse(BaseModel, Generic[T]):
    """Standard generic wrapper for all API responses"""
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[str] = None
