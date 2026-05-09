"""
Lightweight web scraper for AI contextual enrichment.

Uses requests and BeautifulSoup to fetch and clean website text.
Strictly limits scraping to the homepage (and optionally /about) to remain fast.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import logging

# Basic logging setup for the scraper
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebsiteScraper:
    def __init__(self, timeout: int = 10, max_chars: int = 4000):
        self.timeout = timeout
        self.max_chars = max_chars
        self.session = requests.Session()
        # Use a modern, generic User-Agent to bypass basic blocks
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        })

    def _format_url(self, domain: str) -> str:
        """Ensure the domain has a valid scheme."""
        domain = domain.strip().lower()
        if not domain.startswith("http://") and not domain.startswith("https://"):
            return f"https://{domain}"
        return domain

    def _clean_html(self, html: str) -> str:
        """Parse HTML, remove noise, and return clean, deduplicated text."""
        soup = BeautifulSoup(html, "html.parser")

        # 1. Destroy noisy tags
        tags_to_remove = [
            "script", "style", "noscript", "nav", "footer", "header", 
            "aside", "svg", "iframe", "button", "form"
        ]
        for tag in soup.find_all(tags_to_remove):
            tag.decompose()

        # 2. Extract raw text
        raw_text = soup.get_text(separator="\n", strip=True)

        # 3. Deduplicate and clean lines
        seen_lines = set()
        clean_lines = []
        
        for line in raw_text.split("\n"):
            line = line.strip()
            # Skip empty lines or very short generic links/buttons (e.g., "Home", "Login")
            if len(line) < 3:
                continue
            
            # Deduplicate
            line_lower = line.lower()
            if line_lower not in seen_lines:
                seen_lines.add(line_lower)
                clean_lines.append(line)

        # 4. Join and enforce character limit
        final_text = " ".join(clean_lines)
        return final_text[:self.max_chars]

    def scrape_domain(self, domain: str) -> str | None:
        """
        Scrape the homepage of a domain. 
        If the homepage is very sparse, attempt to scrape the /about page.
        Returns cleaned text or None if failed.
        """
        if not domain:
            return None

        base_url = self._format_url(domain)
        
        text = self._fetch_and_clean(base_url)
        if text is None:
            return None

        # If homepage text is too weak (e.g. just a login portal or splash image)
        # we try fetching the about page to get actual company context.
        if len(text) < 200:
            logger.info(f"Homepage for {domain} is sparse ({len(text)} chars). Trying /about...")
            about_text = self._fetch_and_clean(f"{base_url}/about")
            if not about_text:
                about_text = self._fetch_and_clean(f"{base_url}/about-us")
            
            if about_text and len(about_text) > len(text):
                text = about_text

        return text if text else None

    def _fetch_and_clean(self, url: str) -> str | None:
        """Internal helper to fetch a single URL and clean its HTML."""
        try:
            logger.info(f"Scraping: {url}")
            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            response.raise_for_status()
            
            # Ensure we only process HTML
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type:
                logger.warning(f"Skipping {url}: Not HTML (got {content_type})")
                return None
                
            return self._clean_html(response.text)

        except requests.exceptions.RequestException as e:
            logger.warning(f"Scrape failed for {url}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error scraping {url}: {str(e)}")
            return None

# Quick test if run directly
if __name__ == "__main__":
    scraper = WebsiteScraper()
    test_domain = "stripe.com"
    print(f"Testing scraper on {test_domain}...\n")
    
    result = scraper.scrape_domain(test_domain)
    
    if result:
        print(f"SUCCESS! Extracted {len(result)} characters.\n")
        print("--- SNIPPET ---")
        print(result[:500] + "...")
        print("---------------")
    else:
        print("FAILED to scrape domain.")
