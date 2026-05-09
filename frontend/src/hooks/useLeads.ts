import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/leads";
import type { Lead, LeadCreate } from "@/types/api";

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
      toast.error(error.response?.data?.detail || "Enrichment failed. Please try again.");
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
    onError: (error: any, _id, context) => {
      // Rollback on failure
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(error.response?.data?.detail || "Failed to delete lead. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useGenerateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.generateEmail(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Email generated successfully");
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      } else {
        toast.error(response.error || "Failed to generate email");
      }
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      // Surface helpful API errors (e.g. "must be enriched first")
      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Email generation failed. Please try again.");
      }
    },
  });
}
