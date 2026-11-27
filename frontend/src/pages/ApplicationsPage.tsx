import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import { formatSqliteUtcDateTime } from "../utils/date.ts";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdraw, withdrawingId, withdrawError } =
    useApplications(token, onUnauthorized);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (applications.length === 0) return <EmptyState message="Aucune candidature à afficher." />;
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Offre</th>
              <th scope="col">Entreprise</th>
              <th scope="col">Année</th>
              <th scope="col">Période</th>
              <th scope="col">Date</th>
              <th scope="col">Message</th>
              <th scope="col">Statut</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.title}</td>
                <td>{application.companyShortName}</td>
                <td>{application.academicYear}</td>
                <td>{PERIOD_LABELS[application.period]}</td>
                <td>{formatSqliteUtcDateTime(application.appliedAt)}</td>
                <td className="application-message">{application.message || "—"}</td>
                <td aria-live="polite">
                  <StatusBadge
                    label={APPLICATION_STATUS_LABELS[application.status]}
                    tone={APPLICATION_STATUS_TONES[application.status]}
                  />
                </td>
                <td>
                  {application.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      className="button button-primary"
                      aria-label={`Retirer la candidature à ${application.title}`}
                      disabled={withdrawingId !== null}
                      onClick={() => void withdraw(application.id)}
                    >
                      {withdrawingId === application.id ? "Retrait…" : "Retirer"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section>
      <h1>Mes candidatures</h1>
      {withdrawError && <ErrorState message={withdrawError} />}
      {renderContent()}
    </section>
  );
};

export default ApplicationsPage;
