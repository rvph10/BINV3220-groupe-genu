import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import SearchField from "../components/SearchField.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import { PERIOD_CODES, type Offer } from "../models/offer.ts";
import type { User } from "../models/user.ts";
import { apply } from "../services/applications.service.ts";
import { ApiError, isUnauthorized } from "../utils/api.ts";
import { PERIOD_LABELS } from "../utils/labels.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const { offers, isLoading, error, period, changePeriod, search, changeSearch } =
    useOffers(token, onUnauthorized);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [message, setMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const chooseOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setMessage("");
    setApplicationError(null);
    setSuccess(null);
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedOffer === null || isApplying) return;
    setIsApplying(true);
    setApplicationError(null);
    try {
      await apply(token, selectedOffer.id, message);
      setSuccess(`Votre candidature à « ${selectedOffer.title} » a été envoyée.`);
      setSelectedOffer(null);
      setMessage("");
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) {
        onUnauthorized();
      } else if (reason instanceof ApiError && reason.status === 409) {
        setApplicationError("Cette offre n'est plus publiée ou vous avez déjà une candidature non retirée.");
      } else {
        setApplicationError(reason instanceof Error ? reason.message : "Erreur inconnue");
      }
    } finally {
      setIsApplying(false);
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) {
      return <EmptyState message={search.trim() ? "Aucune offre ne correspond à la recherche." : "Aucune offre à afficher."} />;
    }
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          onApply={user.kind === "STUDENT" ? chooseOffer : undefined}
          isApplying={isApplying}
        />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <SearchField label="Rechercher par titre" value={search} onChange={changeSearch} />
      <label className="search-field">
        <span>Période</span>
        <select
          value={period ?? ""}
          onChange={(event) => changePeriod(PERIOD_CODES.find((code) => code === event.target.value))}
        >
          <option value="">Toutes les périodes</option>
          {PERIOD_CODES.map((code) => (
            <option key={code} value={code}>{PERIOD_LABELS[code]}</option>
          ))}
        </select>
      </label>
      {renderContent()}
      {success && <p className="state state-success" role="status">{success}</p>}
      {selectedOffer && user.kind === "STUDENT" && (
        <form className="application-form" onSubmit={submitApplication}>
          <h2>Candidater à {selectedOffer.title}</h2>
          <label htmlFor="application-message">Message facultatif</label>
          <textarea
            id="application-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isApplying}
          />
          {applicationError && <ErrorState message={applicationError} />}
          <div className="application-actions">
            <button className="button button-primary" type="submit" disabled={isApplying}>
              {isApplying ? "Envoi…" : "Envoyer ma candidature"}
            </button>
            <button
              className="button"
              type="button"
              disabled={isApplying}
              onClick={() => setSelectedOffer(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default OffersPage;
import { useState, type FormEvent } from "react";
