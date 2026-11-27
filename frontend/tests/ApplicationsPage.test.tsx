import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 4, offerId: 1, title: "Offre en cours", companyShortName: "Orbis",
    academicYear: "2026-2027", period: "P2", appliedAt: "2026-10-04 10:30:00",
    message: "Bonjour", status: "IN_PROGRESS",
  },
  {
    id: 3, offerId: 2, title: "Offre retenue", companyShortName: "Datavia",
    academicYear: "2026-2027", period: "P1", appliedAt: "2026-10-03 10:30:00",
    message: null, status: "SELECTED",
  },
  {
    id: 2, offerId: 3, title: "Offre non retenue", companyShortName: "Lumen",
    academicYear: "2025-2026", period: "OTHER", appliedAt: "2026-10-02 10:30:00",
    message: null, status: "REJECTED",
  },
  {
    id: 1, offerId: 4, title: "Offre retirée", companyShortName: "Orbis",
    academicYear: "2025-2026", period: "P1", appliedAt: "2026-10-01 10:30:00",
    message: null, status: "WITHDRAWN",
  },
];

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ApplicationsPage", () => {
  it("affiche les détails et les quatre statuts français dans l'ordre reçu", async () => {
    vi.stubEnv("TZ", "Europe/Brussels");
    const fetchMock = stubFetch({ "/api/applications": () => Response.json(applications) });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(5);
    expect(within(rows[1]!).getByText("En cours")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Offre en cours")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Orbis")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("2026-2027")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("P2")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("04/10/2026 12:30")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Bonjour")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Retenue")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("—")).toBeInTheDocument();
    expect(within(rows[3]!).getByText("Non retenue")).toBeInTheDocument();
    expect(within(rows[3]!).getByText("Autre")).toBeInTheDocument();
    expect(within(rows[4]!).getByText("Retirée")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/applications", expect.objectContaining({
      headers: { Authorization: "jeton" },
    }));
  });

  it("affiche un état vide", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByText("Aucune candidature à afficher.")).toBeInTheDocument();
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();
    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
  });

  it("affiche les erreurs du serveur et les réponses invalides", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 500 }) });
    const { unmount } = render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("statut 500");
    unmount();
    stubFetch({ "/api/applications": () => Response.json([{ ...applications[0], status: "UNKNOWN" }]) });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Réponse inattendue de l'API");
  });

  it("signale une date invalide dans la réponse API", async () => {
    stubFetch({ "/api/applications": () => Response.json([{ ...applications[0], appliedAt: "2026-02-30 10:00:00" }]) });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Réponse inattendue de l'API");
  });

  it("propose le retrait uniquement pour une candidature en cours et actualise son statut", async () => {
    const fetchMock = stubFetch({
      "/api/applications/4/withdraw": () => Response.json({
        id: 4, offerId: 1, message: "Bonjour", status: "WITHDRAWN", appliedAt: "2026-10-04 10:30:00",
      }),
      "/api/applications": () => Response.json(applications),
    });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    const rows = await screen.findAllByRole("row");
    const button = within(rows[1]!).getByRole("button", { name: "Retirer la candidature à Offre en cours" });
    for (const row of rows.slice(2)) expect(within(row).queryByRole("button")).not.toBeInTheDocument();

    fireEvent.click(button);
    await waitFor(() => expect(within(rows[1]!).getByText("Retirée")).toBeInTheDocument());
    expect(within(rows[1]!).queryByRole("button")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/applications/4/withdraw", {
      method: "PATCH", headers: { Authorization: "jeton" },
    });
  });

  it("désactive le bouton pendant l'envoi", async () => {
    let resolveResponse: (response: Response) => void = () => {
      throw new Error("La requête n'a pas démarré");
    };
    const pending = new Promise<Response>((resolve) => { resolveResponse = resolve; });
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) =>
      String(input).endsWith("/withdraw") ? pending : Promise.resolve(Response.json(applications)),
    ));
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    const button = await screen.findByRole("button", { name: "Retirer la candidature à Offre en cours" });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Retrait…");
    resolveResponse(Response.json({
      id: 4, offerId: 1, message: "Bonjour", status: "WITHDRAWN", appliedAt: "2026-10-04 10:30:00",
    }));
    await waitFor(() => expect(screen.queryByRole("button", { name: /Retirer la candidature/ })).not.toBeInTheDocument());
  });

  it("affiche un conflit sans masquer la liste ni modifier le statut", async () => {
    stubFetch({
      "/api/applications/4/withdraw": () => new Response(null, { status: 409 }),
      "/api/applications": () => Response.json(applications),
    });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer la candidature à Offre en cours" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Cette candidature n'est plus en cours");
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retirer la candidature à Offre en cours" })).toBeEnabled();
  });

  it("signale une session expirée pendant le retrait", async () => {
    stubFetch({
      "/api/applications/4/withdraw": () => new Response(null, { status: 401 }),
      "/api/applications": () => Response.json(applications),
    });
    const onUnauthorized = vi.fn();
    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer la candidature à Offre en cours" }));
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
  });

  it("signale une réponse de retrait qui concerne une autre candidature", async () => {
    stubFetch({
      "/api/applications/4/withdraw": () => Response.json({
        id: 1, offerId: 1, message: null, status: "WITHDRAWN", appliedAt: "2026-10-04 10:30:00",
      }),
      "/api/applications": () => Response.json(applications),
    });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer la candidature à Offre en cours" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Réponse inattendue de l'API");
    expect(screen.getByText("En cours")).toBeInTheDocument();
  });
});
