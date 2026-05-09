"""
HTTP client for the FastAPI backend.

Used by the Telegram bot to communicate with the API
instead of accessing Database/LeadEnrichment/EmailGenerator directly.

This enforces the architecture: Bot → API → Services → Supabase/Groq
"""

import requests
from typing import Optional, Dict, List

# Generous timeout — enrichment and email generation call Groq AI
DEFAULT_TIMEOUT = 60


class LeadAPIClient:
    """Lightweight wrapper around the Lead Generation API."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def _request(self, method: str, path: str, **kwargs) -> Dict:
        """Make an HTTP request and return a normalized response dict.

        Always returns {"success": bool, ...} so callers don't need
        to handle HTTP specifics.
        """
        url = f"{self.base_url}{path}"
        try:
            resp = self.session.request(
                method, url, timeout=DEFAULT_TIMEOUT, **kwargs
            )
            data = resp.json()

            if resp.status_code >= 400:
                detail = data.get("detail", "Unknown error")
                return {"success": False, "error": detail}

            return data

        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "error": "Cannot connect to API server. Is it running?"
            }
        except requests.exceptions.Timeout:
            return {"success": False, "error": "API request timed out"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ── Lead CRUD ───────────────────────────────────

    def create_lead(
        self,
        company_name: str,
        domain: str = None,
        contact_person: str = None,
    ) -> Dict:
        """POST /api/lead"""
        payload = {"company_name": company_name}
        if domain:
            payload["domain"] = domain
        if contact_person:
            payload["contact_person"] = contact_person
        return self._request("POST", "/api/lead", json=payload)

    def get_all_leads(self) -> List[Dict]:
        """GET /api/leads — returns the lead list directly."""
        result = self._request("GET", "/api/leads")
        return result.get("data", []) if result.get("success") else []

    def get_lead(self, lead_id: str) -> Optional[Dict]:
        """GET /api/lead/{id}"""
        result = self._request("GET", f"/api/lead/{lead_id}")
        return result.get("data") if result.get("success") else None

    def find_lead_by_partial_id(self, partial_id: str) -> Optional[Dict]:
        """Find a lead by partial ID prefix.

        Mirrors the existing bot behavior: fetch all leads, match by prefix.
        """
        leads = self.get_all_leads()
        for lead in leads:
            if lead["id"].startswith(partial_id):
                return lead
        return None

    # ── AI operations ───────────────────────────────

    def enrich_lead(self, lead_id: str) -> Dict:
        """POST /api/enrich/{id}"""
        return self._request("POST", f"/api/enrich/{lead_id}")

    def generate_email(self, lead_id: str) -> Dict:
        """POST /api/generate-email/{id}"""
        return self._request("POST", f"/api/generate-email/{lead_id}")

    # ── Stats ───────────────────────────────────────

    def get_stats(self) -> Dict:
        """GET /api/stats — returns the stats dict directly."""
        result = self._request("GET", "/api/stats")
        if result.get("success"):
            return result.get("data", {})
        return {"total": 0, "enriched": 0, "pending": 0, "with_emails": 0}
