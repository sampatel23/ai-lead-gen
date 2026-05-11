# LeadGen.ai

AI-powered lead enrichment and cold outreach platform for generating personalized outbound campaigns from raw company data.

## Project Overview

LeadGen.ai is a full-stack product that combines AI generation, web scraping, and pipeline analytics into a single workflow.

Users can create leads, enrich records with company context, generate personalized cold emails, and monitor funnel health through a SaaS-style dashboard. The platform also exposes configurable AI behavior and tone controls so teams can tune output quality and writing style without changing application code.

## Screenshots

![Dashboard](./screenshots/dashboard.png)
![Leads](./screenshots/leads.png)
![Analytics](./screenshots/analytics.png)
![Settings](./screenshots/settings.png)

## Live Demo

- Frontend: https://your-frontend-url.vercel.app
- Backend Swagger Docs: https://your-backend-url.onrender.com/docs

## Core Features

- AI lead enrichment pipeline using Groq generation + scraping signals
- AI cold email generation tailored to lead profile and context
- Analytics dashboard for pipeline visibility and KPI tracking
- Email tone customization through runtime settings
- Configurable AI provider behavior via backend settings endpoints
- Optimistic UI updates for faster lead and settings interactions
- React Query caching for low-latency data fetching and mutation flows
- Supabase integration for persistent lead, analytics, and settings data
- Telegram bot support for external lead workflow automation
- Scraping pipeline powered by BeautifulSoup for website/context extraction

## Tech Stack

### Frontend

- React + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack React Query
- Recharts

### Backend

- FastAPI (Python)
- Supabase (PostgreSQL)
- Groq API
- BeautifulSoup (scraping/enrichment)

### Deployment

- Render (backend API)
- Vercel (frontend)
- Supabase (managed database)
- Groq API (LLM inference)

## System Architecture Flow

```text
User Input
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Groq AI + Scraping
  ↓
Supabase Database
```

## Project Structure

```text
ai-lead-gen/
├── backend/
│   ├── core/
│   ├── routes/
│   ├── schemas/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   └── runtime.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   └── package.json
│
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` by default.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Environment Variables

Create environment files before running the app.

### Backend (`backend/.env`)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Returns all leads for the dashboard list view. |
| POST | `/api/lead` | Creates a new lead record. |
| POST | `/api/enrich/{id}` | Runs enrichment for a specific lead using scraping + AI. |
| POST | `/api/generate-email/{id}` | Generates a personalized cold email for a lead. |
| GET | `/api/stats` | Returns aggregate metrics for dashboard analytics. |

## Deployment

- Backend is deployed on Render as a FastAPI service.
- Frontend is deployed on Vercel as a Vite static application.
- Supabase provides managed PostgreSQL and persistence.
- Groq API powers LLM generation for enrichment and email output.

## Future Improvements

- OAuth-based authentication and team workspaces
- CRM integrations (HubSpot, Salesforce, Pipedrive)
- Bulk CSV lead ingestion and batch enrichment
- AI follow-up sequence generation
- Lead scoring and prioritization models
- Outbound email tracking (opens, clicks, replies)

## Final Note

LeadGen.ai is designed as a production-oriented engineering project that demonstrates end-to-end product delivery: data ingestion, AI enrichment, outbound generation, analytics, and deployable full-stack infrastructure.
