from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)

from dotenv import load_dotenv
import os

from src.database import Database
from src.enrichment import LeadEnrichment
from src.email_generator import EmailGenerator

load_dotenv()


class LeadGenBot:
    def __init__(self):
        self.db = Database()
        self.enrichment = LeadEnrichment()
        self.email_gen = EmailGenerator()

        self.token = os.getenv("TELEGRAM_BOT_TOKEN")

        if not self.token:
            raise ValueError(
                "❌ TELEGRAM_BOT_TOKEN must be set in .env file"
            )

    async def start_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Handle /start command"""

        welcome_message = """
🚀 *AI Lead Generation Bot*

Welcome! I help you manage and enrich your sales leads with AI.

📋 *Commands:*

/add - Add a new lead
Example:
`/add Stripe, stripe.com, Patrick Collison`

/leads - View all your leads

/enrich <lead_id> - Enrich a specific lead
Example:
`/enrich abc123`

/email <lead_id> - Generate personalized cold email
Example:
`/email abc123`

/stats - View statistics

/help - Show help menu

━━━━━━━━━━━━━━━

💡 *Quick Start*

1. Add a lead
2. View all leads
3. Enrich lead with AI
4. Generate personalized email

Let's get started 🎯
        """

        await update.message.reply_text(
            welcome_message,
            parse_mode="Markdown"
        )

    async def help_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Handle /help command"""

        await self.start_command(update, context)

    async def add_lead_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Handle /add command"""

        try:
            text = update.message.text.replace(
                "/add",
                "",
                1
            ).strip()

            if not text:
                await update.message.reply_text(
                    "❌ *Usage:*\n"
                    "`/add Company, domain.com, Contact Person`",
                    parse_mode="Markdown"
                )
                return

            parts = [p.strip() for p in text.split(",")]

            company_name = parts[0] if len(parts) > 0 else None
            domain = parts[1] if len(parts) > 1 else None
            contact_person = parts[2] if len(parts) > 2 else None

            if not company_name:
                await update.message.reply_text(
                    "❌ Company name is required!"
                )
                return

            result = self.db.add_lead(
                company_name,
                domain,
                contact_person
            )

            if result["success"]:
                lead_id = result["data"]["id"]
                short_id = lead_id[:8]

                response = f"""
✅ *Lead Added Successfully*

🏢 *Company:* {company_name}
🌐 *Domain:* {domain or 'N/A'}
👤 *Contact:* {contact_person or 'N/A'}
🆔 *Lead ID:* `{short_id}`

━━━━━━━━━━━━━━━

📌 *Next Steps*

Enrich lead:
`/enrich {short_id}`

View all leads:
`/leads`
                """

                await update.message.reply_text(
                    response,
                    parse_mode="Markdown"
                )

            else:
                await update.message.reply_text(
                    f"❌ Error: {result['error']}"
                )

        except Exception as e:
            await update.message.reply_text(
                f"❌ Error: {str(e)}"
            )

    async def leads_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Show all leads"""

        try:
            leads = self.db.get_all_leads()

            if not leads:
                await update.message.reply_text(
                    "📭 *No leads found*\n\n"
                    "Add your first lead:\n"
                    "`/add Company, domain.com, Contact`",
                    parse_mode="Markdown"
                )
                return

            message = "📊 *Your Leads*\n\n"

            for i, lead in enumerate(leads[:15], 1):

                short_id = lead["id"][:8]

                status_emoji = (
                    "✅"
                    if lead.get("enrichment_status") == "completed"
                    else "⏳"
                )

                message += (
                    f"{i}. {status_emoji} "
                    f"*{lead['company_name']}*\n"
                )

                message += (
                    f"🆔 `{short_id}`\n"
                )

                if lead.get("industry"):
                    message += (
                        f"🏭 {lead['industry']}\n"
                    )

                message += "\n"

            if len(leads) > 15:
                message += (
                    f"_...and {len(leads) - 15} more leads_\n\n"
                )

            message += (
                "💡 Use `/enrich <id>` "
                "to enrich a lead"
            )

            await update.message.reply_text(
                message,
                parse_mode="Markdown"
            )

        except Exception as e:
            await update.message.reply_text(
                f"❌ Error: {str(e)}"
            )

    async def enrich_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Enrich a lead"""

        try:
            parts = update.message.text.split()

            if len(parts) < 2:
                await update.message.reply_text(
                    "❌ *Usage:*\n"
                    "`/enrich <lead_id>`",
                    parse_mode="Markdown"
                )
                return

            partial_id = parts[1].strip()

            all_leads = self.db.get_all_leads()

            lead = None

            for item in all_leads:
                if item["id"].startswith(partial_id):
                    lead = item
                    break

            if not lead:
                await update.message.reply_text(
                    "❌ Lead not found!"
                )
                return

            if lead.get("enrichment_status") == "completed":
                await update.message.reply_text(
                    f"ℹ️ *{lead['company_name']}* "
                    f"is already enriched.\n\n"
                    f"Generate email:\n"
                    f"`/email {partial_id}`",
                    parse_mode="Markdown"
                )
                return

            await update.message.reply_text(
                f"🔍 Enriching "
                f"*{lead['company_name']}*...\n\n"
                f"Please wait ⏳",
                parse_mode="Markdown"
            )

            enriched = self.enrichment.enrich_lead(lead)

            self.db.update_lead(
                lead["id"],
                enriched
            )

            message = f"""
✅ *Lead Enriched Successfully*

🏢 *Company:* {enriched['company_name']}
🏭 *Industry:* {enriched['industry']}
👥 *Company Size:* {enriched['company_size']}
📧 *Email:* {enriched.get('email', 'N/A')}

━━━━━━━━━━━━━━━

💼 *Pain Points*

{enriched.get('pain_points', 'N/A')}

━━━━━━━━━━━━━━━

✉️ Generate cold email:
`/email {partial_id}`
            """

            await update.message.reply_text(
                message,
                parse_mode="Markdown"
            )

        except Exception as e:
            await update.message.reply_text(
                f"❌ Error: {str(e)}"
            )

    async def email_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Generate AI cold email"""

        try:
            parts = update.message.text.split()

            if len(parts) < 2:
                await update.message.reply_text(
                    "❌ *Usage:*\n"
                    "`/email <lead_id>`",
                    parse_mode="Markdown"
                )
                return

            partial_id = parts[1].strip()

            all_leads = self.db.get_all_leads()

            lead = None

            for item in all_leads:
                if item["id"].startswith(partial_id):
                    lead = item
                    break

            if not lead:
                await update.message.reply_text(
                    "❌ Lead not found!"
                )
                return

            if lead.get("enrichment_status") != "completed":
                await update.message.reply_text(
                    f"⚠️ *{lead['company_name']}* "
                    f"needs enrichment first.\n\n"
                    f"`/enrich {partial_id}`",
                    parse_mode="Markdown"
                )
                return

            await update.message.reply_text(
                f"✍️ Generating email for "
                f"*{lead['company_name']}*...\n\n"
                f"Please wait ⏳",
                parse_mode="Markdown"
            )

            email = self.email_gen.generate_cold_email(lead)

            self.db.update_lead(
                lead["id"],
                {"generated_email": email}
            )

            await update.message.reply_text(
                f"📧 *Generated Email*\n\n{email}",
                parse_mode="Markdown"
            )

        except Exception as e:
            await update.message.reply_text(
                f"❌ Error: {str(e)}"
            )

    async def stats_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Show statistics"""

        try:
            stats = self.db.get_stats()

            message = f"""
📊 *Statistics*

📈 Total Leads: {stats['total']}
✅ Enriched: {stats['enriched']}
⏳ Pending: {stats['pending']}
✉️ Emails Generated: {stats['with_emails']}
            """

            await update.message.reply_text(
                message,
                parse_mode="Markdown"
            )

        except Exception as e:
            await update.message.reply_text(
                f"❌ Error: {str(e)}"
            )

    async def unknown_command(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE
    ):
        """Handle unknown commands"""

        await update.message.reply_text(
            "❌ Unknown command.\n"
            "Use /help to view commands."
        )

    def run(self):
        """Start bot"""

        print("🤖 Starting Telegram Bot...")
        print("✅ Bot is running")

        app = (
            Application.builder()
            .token(self.token)
            .build()
        )

        app.add_handler(
            CommandHandler("start", self.start_command)
        )

        app.add_handler(
            CommandHandler("help", self.help_command)
        )

        app.add_handler(
            CommandHandler("add", self.add_lead_command)
        )

        app.add_handler(
            CommandHandler("leads", self.leads_command)
        )

        app.add_handler(
            CommandHandler("enrich", self.enrich_command)
        )

        app.add_handler(
            CommandHandler("email", self.email_command)
        )

        app.add_handler(
            CommandHandler("stats", self.stats_command)
        )

        app.add_handler(
            MessageHandler(
                filters.COMMAND,
                self.unknown_command
            )
        )

        print("📲 Open Telegram and send /start")
        print("Press Ctrl+C to stop\n")

        app.run_polling(
            allowed_updates=Update.ALL_TYPES
        )


if __name__ == "__main__":
    try:
        bot = LeadGenBot()
        bot.run()

    except KeyboardInterrupt:
        print("\n👋 Bot stopped")

    except Exception as e:
        print(f"❌ Error: {e}")