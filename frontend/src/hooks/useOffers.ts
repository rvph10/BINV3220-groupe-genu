import { useEffect, useState } from "react";
import type { Offer, PeriodCode } from "../models/offer.ts";
import { getOffers } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

/**
 * Offres visibles par l'utilisateur, choisies par le backend selon son profil.
 * onUnauthorized doit être stable (useCallback) pour ne pas relancer le chargement.
 */
export const useOffers = (token: string, onUnauthorized: () => void) => {
  const [period, setPeriod] = useState<PeriodCode | undefined>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const changePeriod = (nextPeriod: PeriodCode | undefined) => {
    if (nextPeriod === period) return;
    setIsLoading(true);
    setError(null);
    setPeriod(nextPeriod);
  };

  useEffect(() => {
    const controller = new AbortController();

    getOffers(token, period, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setOffers(data);
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
  }, [token, period, onUnauthorized]);

  return { offers, isLoading, error, period, changePeriod };
};
