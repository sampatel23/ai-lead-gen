"""
Lead API routes.

All 6 endpoints delegate to the existing service classes from src/.
No business logic lives here — just HTTP ↔ service translation.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from core.database import Database
from core.enrichment import LeadEnrichment
from core.email_generator import EmailGenerator

from backend.dependencies import get_db, get_enrichment, get_email_generator
from backend.schemas.lead import LeadCreate, LeadOut, StatsOut, APIResponse
from backend.logger import logger

router = APIRouter(tags=["Leads"])


# ── POST /lead ──────────────────────────────────────

@router.post("/lead", response_model=APIResponse[LeadOut], status_code=201)
def create_lead(
    payload: LeadCreate,
    db: Database = Depends(get_db),
):
    """Add a new lead."""
    logger.info(f"Creating lead: {payload.company_name}")
    
    result = db.add_lead(
        company_name=payload.company_name,
        domain=payload.domain,
        contact_person=payload.contact_person,
    )

    if not result["success"]:
        logger.warning(f"Failed to create lead {payload.company_name}: {result['error']}")
        raise HTTPException(status_code=400, detail=result["error"])

    logger.info(f"Lead created successfully: {result['data']['id']}")
    return APIResponse(
        success=True,
        data=result["data"],
        message=f"Lead '{payload.company_name}' created",
    )


# ── GET /leads ──────────────────────────────────────

@router.get("/leads", response_model=APIResponse[List[LeadOut]])
def list_leads(db: Database = Depends(get_db)):
    """Get all leads, most recent first."""
    leads = db.get_all_leads()
    return APIResponse(success=True, data=leads)


# ── GET /lead/{lead_id} ────────────────────────────

@router.get("/lead/{lead_id}", response_model=APIResponse[LeadOut])
def get_lead(lead_id: str, db: Database = Depends(get_db)):
    """Get a single lead by ID."""
    lead = db.get_lead_by_id(lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return APIResponse(success=True, data=lead)


# ── POST /enrich/{lead_id} ─────────────────────────

@router.post("/enrich/{lead_id}", response_model=APIResponse[LeadOut])
def enrich_lead(
    lead_id: str,
    db: Database = Depends(get_db),
    enrichment: LeadEnrichment = Depends(get_enrichment),
):
    """Enrich a lead with AI-generated industry, size, pain points, and email."""
    logger.info(f"Enrichment requested for lead: {lead_id}")
    lead = db.get_lead_by_id(lead_id)

    if not lead:
        logger.warning(f"Enrichment failed: Lead {lead_id} not found")
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.get("enrichment_status") == "completed":
        logger.info(f"Lead {lead_id} already enriched")
        return APIResponse(
            success=True,
            data=lead,
            message="Lead is already enriched",
        )

    # Uses your existing LeadEnrichment.enrich_lead() — no new logic
    enriched = enrichment.enrich_lead(lead)
    db.update_lead(lead_id, enriched)
    
    logger.info(f"Enrichment complete for lead: {lead_id}")

    return APIResponse(
        success=True,
        data=enriched,
        message=f"Lead '{lead['company_name']}' enriched successfully",
    )


# ── POST /generate-email/{lead_id} ─────────────────

@router.post("/generate-email/{lead_id}", response_model=APIResponse[dict])
def generate_email(
    lead_id: str,
    db: Database = Depends(get_db),
    email_gen: EmailGenerator = Depends(get_email_generator),
):
    """Generate a personalized cold email for an enriched lead."""
    logger.info(f"Email generation requested for lead: {lead_id}")
    lead = db.get_lead_by_id(lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.get("enrichment_status") != "completed":
        logger.warning(f"Email gen failed: Lead {lead_id} not enriched")
        raise HTTPException(
            status_code=400,
            detail="Lead must be enriched before generating email. "
                   f"POST /enrich/{lead_id} first.",
        )

    # Uses your existing EmailGenerator.generate_cold_email() — no new logic
    email = email_gen.generate_cold_email(lead)
    db.update_lead(lead_id, {"generated_email": email})
    
    logger.info(f"Email successfully generated for lead: {lead_id}")

    return APIResponse(
        success=True,
        data={"lead_id": lead_id, "generated_email": email},
        message="Email generated successfully",
    )


# ── DELETE /lead/{lead_id} ─────────────────────────
@router.delete("/lead/{lead_id}", response_model=APIResponse[dict])
def delete_lead(lead_id: str, db: Database = Depends(get_db)):
    """Delete a lead."""
    logger.info(f"Deleting lead: {lead_id}")
    result = db.delete_lead(lead_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return APIResponse(success=True, message="Lead deleted successfully")


# ── GET /stats ──────────────────────────────────────

@router.get("/stats", response_model=APIResponse[StatsOut])
def get_stats(db: Database = Depends(get_db)):
    """Get dashboard statistics."""
    stats = db.get_stats()
    return APIResponse(success=True, data=stats)
