import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
import pandas as pd
from src.database import Database
from src.enrichment import LeadEnrichment
from src.email_generator import EmailGenerator
import time

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="AI Lead Gen Dashboard",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------------------------------------------
# CUSTOM CSS
# ---------------------------------------------------

st.markdown("""
<style>
.main-header {
    font-size: 3rem;
    font-weight: bold;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.metric-card {
    background-color: #f0f2f6;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------
# INIT SERVICES
# ---------------------------------------------------

@st.cache_resource
def init_services():
    return Database(), LeadEnrichment(), EmailGenerator()


try:
    db, enrichment, email_gen = init_services()

except Exception as e:
    st.error(f"❌ Error initializing services: {e}")
    st.stop()

# ---------------------------------------------------
# HEADER
# ---------------------------------------------------

st.markdown(
    '<h1 class="main-header">🚀 AI Lead Generation Dashboard</h1>',
    unsafe_allow_html=True
)

st.markdown("---")

# ---------------------------------------------------
# SIDEBAR
# ---------------------------------------------------

with st.sidebar:

    st.header("➕ Add New Lead")

    with st.form("add_lead_form", clear_on_submit=True):

        company = st.text_input(
            "Company Name*",
            placeholder="e.g., Stripe"
        )

        domain = st.text_input(
            "Domain",
            placeholder="e.g., stripe.com"
        )

        contact = st.text_input(
            "Contact Person",
            placeholder="e.g., Patrick Collison"
        )

        auto_enrich = st.checkbox(
            "Auto enrich after adding",
            value=False
        )

        submitted = st.form_submit_button(
            "Add Lead",
            type="primary",
            use_container_width=True
        )

        if submitted:

            if not company:
                st.warning("⚠️ Company name is required")
            else:

                with st.spinner("Adding lead..."):

                    result = db.add_lead(
                        company,
                        domain,
                        contact
                    )

                    if result["success"]:

                        lead_data = result["data"]

                        if auto_enrich:
                            try:
                                enriched = enrichment.enrich_lead(lead_data)
                                db.update_lead(
                                    lead_data["id"],
                                    enriched
                                )

                            except Exception as enrich_error:
                                st.warning(
                                    f"Lead added but enrichment failed: {enrich_error}"
                                )

                        st.success(f"✅ {company} added successfully!")
                        time.sleep(1)
                        st.rerun()

                    else:
                        st.error(f"❌ {result['error']}")

    st.markdown("---")

    stats = db.get_stats()

    st.metric("Total Leads", stats["total"])
    st.metric("Enriched", stats["enriched"])
    st.metric("Emails Generated", stats["with_emails"])

# ---------------------------------------------------
# TABS
# ---------------------------------------------------

tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Overview",
    "📋 All Leads",
    "✉️ Email Generator",
    "⚙️ Bulk Actions"
])

# ===================================================
# TAB 1 — OVERVIEW
# ===================================================

with tab1:

    st.subheader("📈 Dashboard Overview")

    enrichment_rate = (
        (stats["enriched"] / stats["total"]) * 100
        if stats["total"] > 0
        else 0
    )

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            label="Total Leads",
            value=stats["total"]
        )

    with col2:
        st.metric(
            label="Enriched",
            value=stats["enriched"],
            delta=f"{enrichment_rate:.1f}%"
        )

    with col3:
        st.metric(
            label="Pending",
            value=stats["pending"]
        )

    with col4:
        st.metric(
            label="Emails Generated",
            value=stats["with_emails"]
        )

    st.markdown("---")

    st.subheader("🕒 Recent Leads")

    leads = db.get_all_leads()

    if leads:

        recent_leads = leads[:10]

        for lead in recent_leads:

            status = lead.get("enrichment_status") or "pending"

            with st.expander(
                f"🏢 {lead['company_name']} - {status}"
            ):

                col1, col2 = st.columns(2)

                with col1:
                    st.write(
                        f"**Domain:** {lead.get('domain') or 'N/A'}"
                    )

                    st.write(
                        f"**Contact:** {lead.get('contact_person') or 'N/A'}"
                    )

                    st.write(
                        f"**Industry:** {lead.get('industry') or 'N/A'}"
                    )

                with col2:
                    st.write(
                        f"**Size:** {lead.get('company_size') or 'N/A'}"
                    )

                    st.write(
                        f"**Status:** {status}"
                    )

                    st.write(
                        f"**ID:** `{lead['id'][:8]}...`"
                    )

                if lead.get("pain_points"):
                    st.info(
                        f"💼 {lead['pain_points']}"
                    )

    else:
        st.info(
            "📭 No leads yet. Add your first lead from the sidebar."
        )

# ===================================================
# TAB 2 — ALL LEADS
# ===================================================

with tab2:

    st.subheader("📋 All Leads")

    leads = db.get_all_leads()

    if leads:

        df_data = []

        for lead in leads:

            df_data.append({
                "Company": lead["company_name"],
                "Domain": lead.get("domain") or "N/A",
                "Contact": lead.get("contact_person") or "N/A",
                "Industry": lead.get("industry") or "N/A",
                "Size": lead.get("company_size") or "N/A",
                "Status": lead.get("enrichment_status") or "pending",
                "ID": lead["id"][:8] + "..."
            })

        df = pd.DataFrame(df_data)

        st.dataframe(
            df,
            use_container_width=True,
            hide_index=True
        )

        csv = df.to_csv(index=False)

        st.download_button(
            label="📥 Download CSV",
            data=csv,
            file_name="leads.csv",
            mime="text/csv"
        )

    else:
        st.info("📭 No leads found")

# ===================================================
# TAB 3 — EMAIL GENERATOR
# ===================================================

with tab3:

    st.subheader("✉️ Generate Personalized Email")

    leads = db.get_all_leads()

    if leads:

        enriched_leads = [
            l for l in leads
            if l.get("enrichment_status") == "completed"
        ]

        if enriched_leads:

            lead_options = {
                f"{l['company_name']} ({l['id'][:8]}...)": l["id"]
                for l in enriched_leads
            }

            selected = st.selectbox(
                "Select an enriched lead:",
                options=list(lead_options.keys())
            )

            if selected:

                lead_id = lead_options[selected]

                lead = db.get_lead_by_id(lead_id)

                st.markdown("### 📊 Lead Information")

                col1, col2, col3 = st.columns(3)

                with col1:
                    st.write(f"**Company:** {lead['company_name']}")
                    st.write(f"**Domain:** {lead.get('domain') or 'N/A'}")

                with col2:
                    st.write(f"**Industry:** {lead.get('industry') or 'N/A'}")
                    st.write(f"**Size:** {lead.get('company_size') or 'N/A'}")

                with col3:
                    st.write(f"**Contact:** {lead.get('contact_person') or 'N/A'}")
                    st.write(f"**Email:** {lead.get('email') or 'N/A'}")

                if lead.get("pain_points"):
                    st.info(f"💼 {lead['pain_points']}")

                st.markdown("---")

                if st.button(
                    "✍️ Generate Personalized Email",
                    type="primary",
                    use_container_width=True
                ):

                    with st.spinner(
                        "🤖 AI is generating email..."
                    ):

                        try:

                            email = email_gen.generate_cold_email(lead)

                            db.update_lead(
                                lead_id,
                                {"generated_email": email}
                            )

                            st.success(
                                "✅ Email generated successfully!"
                            )

                            st.text_area(
                                "Generated Email",
                                value=email,
                                height=400
                            )

                        except Exception as e:
                            st.error(f"❌ Error: {e}")

                elif lead.get("generated_email"):

                    st.info(
                        "ℹ️ Previously generated email"
                    )

                    st.text_area(
                        "Generated Email",
                        value=lead["generated_email"],
                        height=400
                    )

        else:
            st.warning(
                "⚠️ No enriched leads found."
            )

    else:
        st.info(
            "📭 No leads available."
        )

# ===================================================
# TAB 4 — BULK ACTIONS
# ===================================================

with tab4:

    st.subheader("⚡ Bulk Operations")

    pending_leads = db.get_pending_enrichment_leads()

    col1, col2 = st.columns(2)

    with col1:
        st.metric(
            "Pending Enrichment",
            len(pending_leads)
        )

    with col2:
        st.metric(
            "Already Enriched",
            stats["enriched"]
        )

    st.markdown("---")

    if pending_leads:

        st.write(
            f"**{len(pending_leads)} leads** waiting for enrichment:"
        )

        for lead in pending_leads[:5]:
            st.write(f"• {lead['company_name']}")

        if len(pending_leads) > 5:
            st.write(
                f"• ...and {len(pending_leads) - 5} more"
            )

        st.markdown("")

        if st.button(
            "🚀 Enrich All Pending Leads",
            type="primary",
            use_container_width=True
        ):

            progress_bar = st.progress(0)

            status_text = st.empty()

            for i, lead in enumerate(pending_leads):

                status_text.text(
                    f"Enriching {i+1}/{len(pending_leads)}: "
                    f"{lead['company_name']}"
                )

                try:

                    enriched = enrichment.enrich_lead(lead)

                    db.update_lead(
                        lead["id"],
                        enriched
                    )

                    progress_bar.progress(
                        (i + 1) / len(pending_leads)
                    )

                    time.sleep(1)

                except Exception as e:
                    st.error(
                        f"Error enriching "
                        f"{lead['company_name']}: {e}"
                    )

            status_text.text(
                "✅ All leads enriched!"
            )

            st.success(
                f"Successfully enriched "
                f"{len(pending_leads)} leads!"
            )

            time.sleep(2)

            st.rerun()

    else:
        st.success(
            "✅ All leads are already enriched!"
        )

        st.balloons()

# ---------------------------------------------------
# FOOTER
# ---------------------------------------------------

st.markdown("---")

st.caption(
    "🚀 Built with Streamlit, Groq AI, and Supabase"
)