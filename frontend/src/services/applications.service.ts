import type { Application, ApplicationSummary } from "../models/application.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isApplication, isApplicationSummaryList } from "../utils/guards.ts";

export const getApplications = async (
  token: string,
  signal?: AbortSignal,
): Promise<ApplicationSummary[]> => {
  const response = await fetch(`${API_URL}/applications`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isApplicationSummaryList, "Chargement des candidatures impossible");
};

export const apply = async (
  token: string,
  offerId: number,
  message: string,
): Promise<Application> => {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ offerId, ...(message === "" ? {} : { message }) }),
  });
  return readJson(response, isApplication, "Candidature impossible");
};
