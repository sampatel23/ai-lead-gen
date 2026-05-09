import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/leads";
import type { LeadCreate } from "@/types/api";

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
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "An unexpected error occurred");
    },
  });
}

export function useEnrichLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.enrichLead(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Lead enriched successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to enrich lead");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "An unexpected error occurred");
    },
  });
}

export function useGenerateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.generateEmail(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Email generated successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to generate email");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "An unexpected error occurred");
    },
  });
}
