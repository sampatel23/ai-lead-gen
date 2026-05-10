import unittest

from core.email_generator import EmailGenerator


class EmailGeneratorPromptTests(unittest.TestCase):
    def setUp(self) -> None:
        self.generator = EmailGenerator.__new__(EmailGenerator)

    def test_build_email_prompts_includes_settings_and_context(self) -> None:
        lead_data = {
            "company_name": "Vercel",
            "contact_person": "Guillermo Rauch",
            "industry": "Developer tools",
            "pain_points": "deployment complexity, observability gaps",
            "company_summary": "Vercel ships frontend infrastructure for modern teams.",
            "outreach_angle": "Help teams ship and scale faster.",
        }

        system_prompt, user_prompt, max_words = self.generator.build_email_prompts(
            lead_data,
            tone="concise",
            cta_strength="soft",
            max_length="long",
        )

        self.assertEqual(max_words, 200)
        self.assertIn("Tone: concise.", system_prompt)
        self.assertIn("CTA strength: soft.", system_prompt)
        self.assertIn("Max length: long.", system_prompt)
        self.assertIn("Vercel", user_prompt)
        self.assertIn("Guillermo Rauch", user_prompt)
        self.assertIn("- What they do: Vercel ships frontend infrastructure for modern teams.", user_prompt)
        self.assertIn("- Why we are reaching out: Help teams ship and scale faster.", user_prompt)
        self.assertIn("Keep the entire email body under 200 words.", user_prompt)
        self.assertIn("prefer a 40-60 word body", user_prompt)

    def test_build_email_prompts_normalizes_invalid_values(self) -> None:
        lead_data = {"company_name": "Acme", "contact_person": None}

        system_prompt, user_prompt, max_words = self.generator.build_email_prompts(
            lead_data,
            tone="unexpected",
            cta_strength="unexpected",
            max_length="unexpected",
        )

        self.assertEqual(max_words, 120)
        self.assertIn("Tone: professional.", system_prompt)
        self.assertIn("CTA strength: moderate.", system_prompt)
        self.assertIn("Max length: medium.", system_prompt)
        self.assertIn("Keep the entire email body under 120 words.", user_prompt)


if __name__ == "__main__":
    unittest.main()