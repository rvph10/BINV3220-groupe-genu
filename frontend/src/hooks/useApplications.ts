import { useEffect, useState } from "react";
import type { ApplicationSummary } from "../models/application.ts";
import { getApplications, withdrawApplication } from "../services/applications.service.ts";
import { ApiError, isUnauthorized } from "../utils/api.ts";

export const useApplications = (token: string, onUnauthorized: () => void) => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setApplications(data);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [token, onUnauthorized]);

  const withdraw = async (id: number) => {
    if (withdrawingId !== null) return;
    setWithdrawingId(id);
    setWithdrawError(null);
    try {
      const updated = await withdrawApplication(token, id);
      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id ? { ...application, status: updated.status } : application,
        ),
      );
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) {
        onUnauthorized();
      } else if (reason instanceof ApiError && reason.status === 409) {
        setWithdrawError("Cette candidature n'est plus en cours. Actualisez la page.");
      } else {
        setWithdrawError(reason instanceof Error ? reason.message : "Erreur inconnue");
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  return { applications, isLoading, error, withdraw, withdrawingId, withdrawError };
};
