// Exact match with backend APIResponse[T]
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

export interface Lead {
  id: string;
  company_name: string;
  domain: string | null;
  contact_person: string | null;
  status: string | null;
  enrichment_status: string | null;
  industry: string | null;
  company_size: string | null;
  company_summary: string | null;
  outreach_angle: string | null;
  pain_points: string | null;
  email: string | null;
  generated_email: string | null;
  created_at: string;
}

export interface Stats {
  total: number;
  enriched: number;
  pending: number;
  with_emails: number;
}

export interface LeadCreate {
  company_name: string;
  domain?: string;
  contact_person?: string;
}
