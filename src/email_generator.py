from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

class EmailGenerator:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            raise ValueError("❌ GROQ_API_KEY must be set in .env file")
        
        self.client = Groq(api_key=api_key)
        # Updated model names for Groq 0.4.1
        self.model = "llama-3.1-8b-instant"
    
    def generate_cold_email(self, lead_data: dict) -> str:
        """Generate personalized cold email using AI"""
        
        company_name = lead_data.get('company_name', 'the company')
        industry = lead_data.get('industry', 'your industry')
        pain_points = lead_data.get('pain_points', 'common business challenges')
        contact_person = lead_data.get('contact_person', 'there')
        domain = lead_data.get('domain', '')
        
        prompt = f"""
You are a B2B sales expert. Write a personalized cold email for lead generation.

Lead Information:
- Company: {company_name}
- Domain: {domain}
- Industry: {industry}
- Contact Person: {contact_person}
- Pain Points: {pain_points}

Requirements:
1. Write a catchy subject line
2. Reference their industry/company specifically
3. Address one specific pain point
4. Propose clear value proposition
5. Include soft call-to-action (book a call/demo)
6. Professional but conversational tone
7. Keep email body under 150 words
8. Sound human, not robotic

Format your response exactly as:
SUBJECT: [your subject line here]

BODY:
[your email body here]

Do not add any extra commentary. Write the email now:
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert B2B sales copywriter who writes cold emails that get 30%+ response rates. Your emails are personalized, concise, and valuable."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=600,
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

# Test the email generator
if __name__ == "__main__":
    try:
        generator = EmailGenerator()
        print("✅ Email generator initialized\n")
        
        # Test data
        test_lead = {
            "company_name": "Acme Corp",
            "domain": "acmecorp.com",
            "industry": "SaaS",
            "contact_person": "Sarah Johnson",
            "pain_points": "High customer churn, Low email open rates, Manual lead qualification"
        }
        
        print("🤖 Generating pain points...\n")
        pain_points = generator.generate_pain_points("Stripe", "Fintech")
        print(f"💡 Generated pain points:\n{pain_points}\n")
        print("="*60 + "\n")
        
        print("📧 Generating personalized email...\n")
        email = generator.generate_cold_email(test_lead)
        print(email)
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")