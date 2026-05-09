import { apiClient } from "./client";
import type { APIResponse, Lead, Stats, LeadCreate } from "../types/api";

export const getLeads = async (): Promise<APIResponse<Lead[]>> => {
  const { data } = await apiClient.get("/leads");
  return data;
};

export const getStats = async (): Promise<APIResponse<Stats>> => {
  const { data } = await apiClient.get("/stats");
  return data;
};

export const createLead = async (payload: LeadCreate): Promise<APIResponse<Lead>> => {
  const { data } = await apiClient.post("/lead", payload);
  return data;
};

export const enrichLead = async (id: string): Promise<APIResponse<Lead>> => {
  const { data } = await apiClient.post(`/enrich/${id}`);
  return data;
};

export const generateEmail = async (id: string): Promise<APIResponse<{lead_id: string, generated_email: string}>> => {
  const { data } = await apiClient.post(`/generate-email/${id}`);
  return data;
};
