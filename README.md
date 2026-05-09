# LeadGen.ai

A modern, AI-powered CRM and lead enrichment platform. 
Turn simple company names into rich, actionable leads with automated enrichment and cold email generation.

![Dashboard Preview](./dashboard-preview.png) *(Placeholder)*

## Features

- **Automated Lead Enrichment:** Provide just a company name and domain, and let AI fetch industry, company size, a detailed summary, pain points, and personalized outreach angles.
- **AI Cold Email Generation:** Instantly generate personalized, high-converting cold emails tailored to the specific pain points and industry of each lead.
- **Modern SaaS Dashboard:** A sleek, responsive dashboard built with React, Vite, and shadcn/ui. Includes real-time analytics, filtering, and a powerful table view.
- **Optimistic UI & Caching:** Lightning-fast interactions with optimistic updates and client-side caching powered by TanStack React Query.
- **Scalable Backend:** Robust REST API built with FastAPI and Python, utilizing Supabase for secure, scalable data storage.

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + shadcn/ui + Lucide Icons
- **State Management:** TanStack React Query
- **Routing:** React Router DOM
- **Charts:** Recharts
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI (Python 3)
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** Google Gemini API (via LangChain/core logic)
- **Data Fetching:** Web scraping & automated search integrations

## Project Structure

```text
├── backend/                # FastAPI application
│   ├── main.py             # App entrypoint
│   ├── routes/             # API endpoints
│   ├── schemas/            # Pydantic validation models
│   └── dependencies.py     # DI setup
├── core/                   # Shared business logic & services
│   ├── database.py         # Supabase client
│   ├── enrichment.py       # AI enrichment logic
│   └── email_generator.py  # AI email generation logic
└── frontend/               # React application
    ├── src/
    │   ├── api/            # Axios client & endpoints
    │   ├── components/     # Reusable UI & Layout
    │   ├── hooks/          # React Query hooks
    │   ├── pages/          # Dashboard, Leads, Analytics
    │   └── types/          # TypeScript definitions
    └── package.json        # Frontend dependencies
```

## Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Account
- Google Gemini API Key (or supported AI provider)

### Backend Setup

1. **Navigate to project root:**
   ```bash
   cd ai-lead-gen
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the server:**
   ```bash
   uvicorn backend.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard analytics and KPI metrics |
| GET | `/api/leads` | Retrieve all leads |
| POST | `/api/lead` | Create a new lead |
| GET | `/api/lead/{id}` | Get a specific lead by ID |
| POST | `/api/enrich/{id}` | Run AI enrichment on a lead |
| POST | `/api/generate-email/{id}`| Generate a personalized cold email |
| DELETE | `/api/lead/{id}` | Delete a lead |

## Future Improvements
- [ ] User authentication and multi-tenant workspaces.
- [ ] Integration with email providers (Gmail, Outlook) for direct sending.
- [ ] Bulk upload via CSV for lead generation at scale.
- [ ] Advanced web scraping settings for custom enrichment data.

---
*Built for production-readiness with modern web standards.*
