// Exact match with backend APIResponse[T]
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

export type LeadEnrichmentStatus =
  | "pending"
  | "processing"
  | "enriched"
  | "completed"
  | "failed"
  | "email_generated"
  | null;

export interface Lead {
  id: string;
  company_name: string;
  domain: string | null;
  contact_person: string | null;
  status: string | null;
  enrichment_status: LeadEnrichmentStatus;
  industry: string | null;
  company_size: string | null;
  company_summary: string | null;
  outreach_angle: string | null;
  pain_points: string | null;
  email: string | null;
  generated_email: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface IndustryCount {
  name: string;
  value: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface Stats {
  total: number;
  enriched: number;
  pending: number;
  failed: number;
  with_emails: number;
  industry_distribution: IndustryCount[];
  leads_over_time: DateCount[];
}

export interface LeadCreate {
  company_name: string;
  domain?: string;
  contact_person?: string;
}

export interface GenerateEmailSettingsPayload {
  lead_id: string;
  tone: "concise" | "professional" | "casual";
  cta_strength: "soft" | "moderate" | "strong";
  max_length: "short" | "medium" | "long";
}
