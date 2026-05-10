import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/leads";
import type {
  Lead,
  LeadCreate,
  GenerateEmailSettingsPayload,
} from "@/types/api";

type LocalAppSettings = {
  maxEmailLength?: string;
  defaultTone?: string;
  ctaStrength?: string;
};

type ApiErrorLike = {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
};

function getErrorDetail(error: unknown): string | undefined {
  const apiError = error as ApiErrorLike | undefined;
  const detail = apiError?.response?.data?.detail;
  return typeof detail === "string" ? detail : undefined;
}

function normalizeTone(value: string | undefined): GenerateEmailSettingsPayload["tone"] {
  if (value === "concise" || value === "professional" || value === "casual") {
    return value;
  }
  if (value === "friendly") {
    return "casual";
  }
  if (value === "direct") {
    return "concise";
  }
  return "professional";
}

function normalizeLength(value: string | undefined): GenerateEmailSettingsPayload["max_length"] {
  if (value === "short" || value === "medium" || value === "long") {
    return value;
  }
  if (value === "detailed") {
    return "long";
  }
  return "medium";
}

function normalizeCtaStrength(
  value: string | undefined
): GenerateEmailSettingsPayload["cta_strength"] {
  if (value === "soft" || value === "moderate" || value === "strong") {
    return value;
  }
  return "moderate";
}

function getGenerateEmailPayload(leadId: string): GenerateEmailSettingsPayload {
  try {
    const raw = localStorage.getItem("appSettings");
    const parsed = raw ? (JSON.parse(raw) as LocalAppSettings) : {};

    return {
      lead_id: leadId,
      tone: normalizeTone(parsed.defaultTone),
      cta_strength: normalizeCtaStrength(parsed.ctaStrength),
      max_length: normalizeLength(parsed.maxEmailLength),
    };
  } catch {
    return {
      lead_id: leadId,
      tone: "professional",
      cta_strength: "moderate",
      max_length: "medium",
    };
  }
}

export const LEADS_QUERY_KEY = ["leads"] as const;
export const STATS_QUERY_KEY = ["stats"] as const;

export function useLeads() {
  return useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.getLeads();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch leads");
      }
      return response.data || [];
    },
    staleTime: 30_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.getStats();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch stats");
      }
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.getLead(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch lead");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeadCreate) => api.createLead(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Lead created successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to create lead");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error) || "An unexpected error occurred");
    },
  });
}

export function useEnrichLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.enrichLead(id),
    onSuccess: async (response, leadId) => {
      if (response.success) {
        toast.success(response.message || "Lead enriched successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        try {
          const raw = localStorage.getItem("appSettings");
          const parsed = raw ? (JSON.parse(raw) as { autoGenerateEmails?: boolean }) : null;
          if (parsed?.autoGenerateEmails) {
            await api.generateEmail(leadId, getGenerateEmailPayload(leadId));
            queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
            toast.success("Email generated successfully");
          }
        } catch (e) {
          const detail = getErrorDetail(e);
          if (typeof detail === "string") {
            toast.error(detail);
          } else {
            toast.error("Auto email generation failed. You can generate manually.");
          }
        }
      } else {
        toast.error(response.error || "Failed to enrich lead");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error) || "Enrichment failed. Please try again.");
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    // Optimistic delete: remove from cache immediately
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousLeads = queryClient.getQueryData<Lead[]>(LEADS_QUERY_KEY);

      queryClient.setQueryData<Lead[]>(LEADS_QUERY_KEY, (old) =>
        old ? old.filter((lead) => lead.id !== id) : []
      );

      return { previousLeads };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Lead deleted");
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to delete lead");
      }
    },
    onError: (error: unknown, _id, context) => {
      // Rollback on failure
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(getErrorDetail(error) || "Failed to delete lead. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useGenerateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.generateEmail(id, getGenerateEmailPayload(id)),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Email generated successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to generate email");
      }
    },
    onError: (error: unknown) => {
      const detail = getErrorDetail(error);
      // Surface helpful API errors (e.g. "must be enriched first")
      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Email generation failed. Please try again.");
      }
    },
  });
}
