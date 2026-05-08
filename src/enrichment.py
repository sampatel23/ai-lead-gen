from src.email_generator import EmailGenerator
import requests
from typing import Dict
import re

class LeadEnrichment:
    def __init__(self):
        self.email_gen = EmailGenerator()
    
    def enrich_lead(self, lead_data: Dict) -> Dict:
        """Enrich lead with additional data"""
        
        enriched = lead_data.copy()
        company_name = lead_data.get('company_name', '')
        domain = lead_data.get('domain', '')
        
        print(f"🔍 Enriching: {company_name}")
        
        # 1. Guess industry from company name/domain
        enriched['industry'] = self._guess_industry(company_name, domain)
        print(f"  ✓ Industry: {enriched['industry']}")
        
        # 2. Estimate company size
        enriched['company_size'] = self._estimate_size(company_name)
        print(f"  ✓ Company size: {enriched['company_size']}")
        
        # 3. Generate pain points using AI
        print(f"  ⏳ Generating pain points...")
        enriched['pain_points'] = self.email_gen.generate_pain_points(
            company_name, 
            enriched['industry']
        )
        print(f"  ✓ Pain points generated")
        
        # 4. Try to find email pattern (if domain exists)
        if domain:
            enriched['email'] = self._guess_email(
                lead_data.get('contact_person', ''), 
                domain
            )
            print(f"  ✓ Email: {enriched['email']}")
        
        enriched['enrichment_status'] = 'completed'
        print(f"✅ Enrichment complete for {company_name}\n")
        
        return enriched
    
    def _guess_industry(self, company_name: str, domain: str) -> str:
        """Simple industry classification based on keywords"""
        name_lower = f"{company_name or ''} {domain or ''}".lower()
        
        # Industry keyword mapping
        keywords = {
            'Technology': ['tech', 'software', 'saas', 'app', 'digital', 'cloud', 'ai', 'data', 'cyber', 'dev', 'api'],
            'Finance': ['bank', 'finance', 'fintech', 'payment', 'invest', 'capital', 'trading', 'crypto', 'stripe'],
            'Healthcare': ['health', 'medical', 'pharma', 'clinic', 'hospital', 'care', 'bio', 'med'],
            'E-commerce': ['shop', 'store', 'retail', 'ecommerce', 'marketplace', 'cart', 'buy'],
            'Education': ['edu', 'learn', 'academy', 'school', 'university', 'course', 'training', 'teach'],
            'Marketing': ['marketing', 'advertis', 'media', 'seo', 'brand', 'agency'],
            'Consulting': ['consulting', 'advisory', 'services', 'solutions', 'strategy'],
            'Manufacturing': ['manufactur', 'factory', 'industrial', 'production'],
            'Real Estate': ['real estate', 'property', 'housing', 'realty'],
            'Entertainment': ['entertainment', 'game', 'gaming', 'media', 'music', 'video']
        }
        
        for industry, words in keywords.items():
            if any(word in name_lower for word in words):
                return industry
        
        return "Professional Services"
    
    def _estimate_size(self, company_name: str) -> str:
        """Estimate company size based on heuristics"""
        # In production, use Clearbit/Apollo API
        # For demo, intelligent guessing
        
        name_lower = company_name.lower()
        
        # Large company indicators
        large_indicators = ['corp', 'corporation', 'inc', 'international', 'global', 'group', 'holdings']
        if any(word in name_lower for word in large_indicators):
            return "500+ employees"
        
        # Startup indicators
        startup_indicators = ['labs', 'studio', 'ventures', 'io', 'ai']
        if any(word in name_lower for word in startup_indicators):
            return "1-50 employees"
        
        # Default to mid-size
        # sizes = ["51-200 employees", "201-500 employees"]
        # import random
        # return random.choice(sizes)
        if len(company_name) > 12:
            return "201-500 employees"
        return "51-200 employees"
    
    def _guess_email(self, contact_person: str, domain: str) -> str:
        """Generate likely email format"""
        if not contact_person or not domain:
            return f"contact@{domain}" if domain else "N/A"
        
        # Clean the name
        contact_person = contact_person.strip()
        
        # Remove common titles
        titles = ['mr.', 'mrs.', 'ms.', 'dr.', 'prof.']
        contact_lower = contact_person.lower()
        for title in titles:
            contact_lower = contact_lower.replace(title, '').strip()
        
        # Split name
        parts = contact_lower.split()
        
        if len(parts) >= 2:
            first = parts[0]
            last = parts[-1]
            # Most common format: firstname.lastname@domain
            return f"{first}.{last}@{domain}"
        elif len(parts) == 1:
            return f"{parts[0]}@{domain}"
        
        return f"contact@{domain}"
    
    def validate_email(self, email: str) -> bool:
        """Simple email validation"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

# Test enrichment
if __name__ == "__main__":
    try:
        enrichment = LeadEnrichment()
        print("✅ Enrichment service initialized\n")
        
        test_leads = [
            {
                "company_name": "Stripe",
                "domain": "stripe.com",
                "contact_person": "Patrick Collison"
            },
            {
                "company_name": "Acme Healthcare",
                "domain": "acmehealth.com",
                "contact_person": "Dr. Sarah Johnson"
            }
        ]
        
        for test_lead in test_leads:
            print(f"{'='*60}")
            enriched = enrichment.enrich_lead(test_lead)
            
            print("\n📊 ENRICHED DATA:")
            for key, value in enriched.items():
                if key not in ['enrichment_status']:
                    print(f"  {key}: {value}")
            print(f"{'='*60}\n")
            
    except Exception as e:
        print(f"❌ Error: {e}")