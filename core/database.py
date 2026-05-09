"""
Supabase database service.

Provides CRUD operations for the leads table.
All business logic stays exactly as originally written.
"""

from supabase import create_client, Client
import os
from typing import Optional, List, Dict


class Database:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_KEY")

        if not url or not key:
            raise ValueError("❌ SUPABASE_URL and SUPABASE_KEY must be set in .env file")

        self.supabase: Client = create_client(url, key)

    def add_lead(self, company_name: str, domain: str = None,
                 contact_person: str = None) -> Dict:
        """Add a new lead to database"""
        try:
            data = {
                "company_name": company_name,
                "domain": domain,
                "contact_person": contact_person,
                "status": "new",
                "enrichment_status": "pending"
            }

            response = self.supabase.table("leads").insert(data).execute()

            # Updated for Supabase 2.15.3 - response structure changed
            if hasattr(response, 'data') and response.data:
                return {"success": True, "data": response.data[0]}
            else:
                return {"success": False, "error": "No data returned"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_all_leads(self) -> List[Dict]:
        """Get all leads"""
        try:
            response = self.supabase.table("leads")\
                .select("*")\
                .order("created_at", desc=True)\
                .execute()

            return response.data if response.data else []

        except Exception as e:
            print(f"❌ Error fetching leads: {e}")
            return []

    def get_lead_by_id(self, lead_id: str) -> Optional[Dict]:
        """Get single lead by ID"""
        try:
            response = self.supabase.table("leads")\
                .select("*")\
                .eq("id", lead_id)\
                .execute()

            return response.data[0] if response.data else None

        except Exception as e:
            print(f"❌ Error fetching lead: {e}")
            return None

    def update_lead(self, lead_id: str, updates: Dict) -> Dict:
        """Update lead information"""
        try:
            response = self.supabase.table("leads")\
                .update(updates)\
                .eq("id", lead_id)\
                .execute()

            if hasattr(response, 'data') and response.data:
                return {"success": True, "data": response.data[0]}
            else:
                return {"success": False, "error": "Update failed"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_pending_enrichment_leads(self) -> List[Dict]:
        """Get leads that need enrichment"""
        try:
            response = self.supabase.table("leads")\
                .select("*")\
                .eq("enrichment_status", "pending")\
                .execute()

            return response.data if response.data else []

        except Exception as e:
            print(f"❌ Error fetching pending leads: {e}")
            return []

    def delete_lead(self, lead_id: str) -> Dict:
        """Delete lead from database"""
        try:
            response = self.supabase.table("leads")\
                .delete()\
                .eq("id", lead_id)\
                .execute()

            return {"success": True, "message": "Lead deleted successfully"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_stats(self) -> Dict:
        """Get database statistics"""
        try:
            all_leads = self.get_all_leads()

            total = len(all_leads)
            enriched = len([l for l in all_leads if l.get('enrichment_status') in ('completed', 'enriched')])
            failed = len([l for l in all_leads if l.get('enrichment_status') == 'failed'])
            pending = total - enriched - failed
            with_emails = len([l for l in all_leads if l.get('generated_email')])

            # Industry distribution
            industry_counts = {}
            for l in all_leads:
                ind = l.get('industry')
                if ind:
                    industry_counts[ind] = industry_counts.get(ind, 0) + 1
            
            industry_distribution = [{"name": k, "value": v} for k, v in industry_counts.items()]

            # Leads over time
            from collections import defaultdict
            date_counts = defaultdict(int)
            for l in all_leads:
                created_at = l.get('created_at')
                if created_at:
                    # Parse date part assuming format 'YYYY-MM-DDTHH:MM:SS...'
                    date_str = created_at.split('T')[0]
                    date_counts[date_str] += 1
            
            # Sort by date
            leads_over_time = [{"date": k, "count": v} for k, v in sorted(date_counts.items())]

            return {
                "total": total,
                "enriched": enriched,
                "pending": max(0, pending), # ensure it doesn't go below 0 due to edge cases
                "failed": failed,
                "with_emails": with_emails,
                "industry_distribution": industry_distribution,
                "leads_over_time": leads_over_time
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {"total": 0, "enriched": 0, "pending": 0, "failed": 0, "with_emails": 0, "industry_distribution": [], "leads_over_time": []}
