import type { Application, ApplicationSummary, WithdrawnApplication } from "../models/application.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isApplication, isApplicationSummaryList, isWithdrawnApplication } from "../utils/guards.ts";

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

export const withdrawApplication = async (
  token: string,
  id: number,
): Promise<WithdrawnApplication> => {
  const response = await fetch(`${API_URL}/applications/${id}/withdraw`, {
    method: "PATCH",
    headers: { Authorization: token },
  });
  const application = await readJson(response, isWithdrawnApplication, "Retrait impossible");
  if (application.id !== id) throw new Error("Réponse inattendue de l'API");
  return application;
};
