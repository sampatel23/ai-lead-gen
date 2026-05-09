"""
AI email generation service.

Uses Groq (LLaMA) to generate personalized cold emails and pain point analysis.
All prompts and generation logic stay exactly as originally written.
"""

from groq import Groq
import os
import json
import logging

logger = logging.getLogger(__name__)


class EmailGenerator:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("❌ GROQ_API_KEY must be set in .env file")

        self.client = Groq(api_key=api_key)
        # Updated model names for Groq 0.4.1
        self.model = "llama-3.1-8b-instant"

    def analyze_company_context(self, company_name: str, website_text: str) -> dict | None:
        """
        Analyze scraped website text to extract structured company context.
        Uses Groq JSON mode for reliable extraction.
        Returns a dict or None if analysis fails.
        """
        prompt = f"""
You are a master business analyst. I am providing you with the text scraped from the website of a company named "{company_name}".

Website Text:
\"\"\"
{website_text}
\"\"\"

Analyze the text and extract the following information. You MUST return a valid JSON object matching exactly this structure:
{{
    "industry": "Specific industry (e.g., B2B SaaS, Fintech, Healthcare IT)",
    "company_summary": "A concise 1-2 sentence description of exactly what the company does and their core value proposition.",
    "pain_points": "A comma-separated list of 3 specific, realistic pain points this type of company faces.",
    "outreach_angle": "A concise 1 sentence angle for sales outreach on how our generic B2B software/service could help them."
}}

Do not include any Markdown formatting, explanations, or extra text. Output ONLY raw JSON.
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise data extraction API that outputs ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.2, # Low temperature for more deterministic/factual output
                max_tokens=300,  # Keep output concise
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            result_text = chat_completion.choices[0].message.content.strip()
            
            # Ensure it is a dictionary
            data = json.loads(result_text)
            
            # Validate required keys are present
            required_keys = {"industry", "company_summary", "pain_points", "outreach_angle"}
            if not required_keys.issubset(data.keys()):
                logger.warning(f"AI returned incomplete JSON structure for {company_name}")
                return None
                
            return data
            
        except Exception as e:
            logger.warning(f"Error during AI context analysis for {company_name}: {e}")
            return None

    def generate_cold_email(self, lead_data: dict) -> str:
        """Generate personalized cold email using AI"""

        company_name = lead_data.get('company_name', 'the company')
        industry = lead_data.get('industry', 'your industry')
        pain_points = lead_data.get('pain_points', 'common business challenges')
        contact_person = lead_data.get('contact_person', 'there')
        domain = lead_data.get('domain', '')
        
        # Extract new contextual enrichment fields if they exist
        company_summary = lead_data.get('company_summary')
        outreach_angle = lead_data.get('outreach_angle')

        # Build contextual prompt segment
        context_segment = f"- Industry: {industry}\n- Pain Points: {pain_points}\n"
        if company_summary:
            context_segment += f"- What they do: {company_summary}\n"
        if outreach_angle:
            context_segment += f"- Why we are reaching out: {outreach_angle}\n"

        prompt = f"""
You are an elite B2B sales copywriter. Write a highly realistic, punchy cold email.

Lead Information:
- Company: {company_name}
- Contact Person: {contact_person}
{context_segment}

Email Structure Rules:
1. Subject line: 1 to 4 words maximum. Casual, entirely lowercase. No punctuation.
2. Hook (Sentence 1): Start immediately with a relevant observation based on what they do.
3. Pitch (Sentence 2): Address their specific pain point and state our value proposition simply.
4. CTA (Sentence 3): A soft, low-friction question (e.g., "Open to exploring this?", "Worth a chat?", "Opposed to taking a look?").

Strict Negative Constraints (DO NOT USE THESE):
- Do NOT say "I was impressed by" or "I noticed" or "I hope this finds you well".
- Do NOT use buzzwords like "revolutionize", "streamline", "synergy", "unlock potential", "elevate".
- Do NOT use exclamation marks.
- Keep the entire email body strictly under 60 words. Short and sharp.

Format your response exactly as:
SUBJECT: [your subject line here]

BODY:
[your email body here]
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You write modern, ultra-concise B2B cold emails that sound like they were quickly typed by a human executive."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=300,
                top_p=1,
                stream=False
            )

            email = chat_completion.choices[0].message.content
            return email.strip()

        except Exception as e:
            return f"❌ Error generating email: {str(e)}\n\nPlease check your GROQ_API_KEY and internet connection."

    def generate_pain_points(self, company_name: str, industry: str = None) -> str:
        """Generate likely pain points for a company"""

        industry_context = f"in the {industry} industry" if industry else ""

        prompt = f"""
Based on the company name "{company_name}" {industry_context}, identify 3 specific business pain points or challenges they likely face.

Be realistic and specific to their industry. 

Format as a simple comma-separated list (no numbering, no extra text).

Example format: "High customer acquisition costs, Manual data entry slowing growth, Difficulty measuring ROI"

Pain points for {company_name}:
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a business analyst who understands common pain points across different industries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.6,
                max_tokens=200,
                top_p=1,
                stream=False
            )

            pain_points = chat_completion.choices[0].message.content.strip()
            # Clean up the response
            pain_points = pain_points.replace('"', '').replace('\n', ' ')
            return pain_points

        except Exception as e:
            print(f"❌ Error generating pain points: {e}")
            return "Operational inefficiencies, High costs, Scaling challenges"
