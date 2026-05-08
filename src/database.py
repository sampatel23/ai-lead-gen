from supabase import create_client, Client
from dotenv import load_dotenv
import os
from typing import Optional, List, Dict
from datetime import datetime

load_dotenv()

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
    
    def get_stats(self) -> Dict:
        """Get database statistics"""
        try:
            all_leads = self.get_all_leads()
            
            total = len(all_leads)
            enriched = len([l for l in all_leads if l.get('enrichment_status') == 'completed'])
            pending = total - enriched
            with_emails = len([l for l in all_leads if l.get('generated_email')])
            
            return {
                "total": total,
                "enriched": enriched,
                "pending": pending,
                "with_emails": with_emails
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {"total": 0, "enriched": 0, "pending": 0, "with_emails": 0}

# Test the connection
if __name__ == "__main__":
    try:
        db = Database()
        print("✅ Database connected successfully!")
        
        # Test adding a lead
        result = db.add_lead("Test Company", "testcompany.com", "John Doe")
        if result['success']:
            print(f"✅ Test lead added: {result['data']['company_name']}")
            
            # Get all leads
            leads = db.get_all_leads()
            print(f"✅ Total leads in database: {len(leads)}")
        else:
            print(f"❌ Error adding lead: {result['error']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        