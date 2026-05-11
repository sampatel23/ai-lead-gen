"""
Lead enrichment service.

Enriches raw leads with industry classification, company size estimation,
AI-generated pain points, and email guessing. All logic stays exactly
as originally written.
"""

from core.email_generator import EmailGenerator
from core.scraper import WebsiteScraper
import requests
from typing import Dict
import re
import os
from logger import logger


class LeadEnrichment:
    def __init__(self):
        self.email_gen = EmailGenerator()
        self.scraper = WebsiteScraper()

    def enrich_lead(self, lead_data: Dict) -> Dict:
        """Enrich lead with contextual AI data, or fallback to heuristics"""

        enriched = lead_data.copy()
        company_name = lead_data.get('company_name', '')
        domain = lead_data.get('domain', '')
        contact_person = lead_data.get('contact_person', '')

        logger.info(f"Enriching: {company_name}")

        ai_context = None

        # 1. PRIMARY PATH: Contextual AI Web Scraping
        if domain:
            logger.info(f"  Scraping {domain}...")
            website_text = self.scraper.scrape_domain(domain)

            if website_text:
                logger.info("  Scrape successful. Analyzing context...")
                ai_context = self.email_gen.analyze_company_context(company_name, website_text)

        if ai_context:
            logger.info("  Contextual analysis successful")
            enriched['industry'] = ai_context.get('industry', 'Professional Services')
            enriched['company_summary'] = ai_context.get('company_summary', '')
            enriched['pain_points'] = ai_context.get('pain_points', '')
            enriched['outreach_angle'] = ai_context.get('outreach_angle', '')
        else:
            # 2. FALLBACK PATH: Heuristics
            if domain:
                logger.warning("  Scraping or AI analysis failed. Falling back to heuristics...")
            else:
                logger.info("  No domain provided. Using heuristic enrichment...")

            enriched['industry'] = self._guess_industry(company_name, domain)
            logger.info(f"  Guessed Industry: {enriched['industry']}")

            logger.info(f"  Generating generic pain points...")
            enriched['pain_points'] = self.email_gen.generate_pain_points(
                company_name,
                enriched['industry']
            )
            logger.info(f"  Generic pain points generated")

            # These fields won't exist in fallback mode
            enriched['company_summary'] = None
            enriched['outreach_angle'] = None

        # 3. COMMON: Estimate company size
        enriched['company_size'] = self._estimate_size(company_name)
        logger.info(f"  Company size: {enriched['company_size']}")

        # 4. COMMON: Try to find email pattern (with Hunter.io stub)
        if domain:
            enriched['email'] = self._guess_email(contact_person, domain)
            logger.info(f"  Email: {enriched['email']}")

        enriched['enrichment_status'] = 'completed'
        logger.info(f"Enrichment complete for {company_name}\n")

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
        if len(company_name) > 12:
            return "201-500 employees"
        return "51-200 employees"

    def _guess_email(self, contact_person: str, domain: str) -> str:
        """Find email using Hunter.io (if configured) or fallback to generic heuristic"""
        if not contact_person or not domain:
            return f"contact@{domain}" if domain else "N/A"

        hunter_key = os.getenv("HUNTER_API_KEY")

        if hunter_key:
            # Hunter.io stub logic
            try:
                # Real implementation would call:
                # https://api.hunter.io/v2/domain-search?domain={domain}&api_key={hunter_key}
                # For now, we simulate success for demo purposes, 
                # but if the real API failed, it would catch and fallback below.
                pass
            except Exception as e:
                logger.warning(f"  ⚠️ Hunter.io API failed: {e}. Falling back to guessing...")

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
