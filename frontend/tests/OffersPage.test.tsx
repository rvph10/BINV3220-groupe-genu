import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("transmet chaque période puis rétablit toutes les périodes", async () => {
    const p1 = { ...offers[0], id: 8, title: "Offre P1", period: "P1" };
    const allOffers = [p1, ...offers];
    const fetchMock = stubFetch({
      "/api/offers?period=P1": () => Response.json([p1]),
      "/api/offers?period=P2": () => Response.json([offers[0]]),
      "/api/offers?period=OTHER": () => Response.json([offers[1]]),
      "/api/offers": () => Response.json(allOffers),
    });

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: "Période" });

    expect(await screen.findByText("3 offres")).toBeInTheDocument();
    expect(select).toHaveValue("");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/offers", expect.anything());

    for (const [period, title] of [
      ["P1", "Offre P1"],
      ["P2", "Refonte du portail client"],
      ["OTHER", "Tableau de bord de qualité des données"],
    ] as const) {
      fireEvent.change(select, { target: { value: period } });
      await waitFor(() =>
        expect(fetchMock).toHaveBeenLastCalledWith(`/api/offers?period=${period}`, expect.anything()),
      );
      expect(await screen.findByText(title)).toBeInTheDocument();
      expect(screen.getByText("1 offre")).toBeInTheDocument();
    }

    fireEvent.change(select, { target: { value: "" } });
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/offers", expect.anything()));
    expect(await screen.findByText("3 offres")).toBeInTheDocument();
  });

  it("affiche une erreur 400 du serveur et permet de changer de période", async () => {
    const fetchMock = stubFetch({
      "/api/offers?period=P1": () => new Response(null, { status: 400 }),
      "/api/offers": () => Response.json(offers),
    });
    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("2 offres");

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "P1" },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("statut 400");

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "" },
    });
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/offers", expect.anything()));
    expect(await screen.findByText("2 offres")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("affiche les offres publiées renvoyées pour un étudiant et une période", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    const fetchMock = stubFetch({
      "/api/offers?period=P2": () => Response.json([published]),
      "/api/offers": () => Response.json([published]),
    });
    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Publiée");

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "P2" },
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/offers?period=P2", expect.anything()),
    );
    expect(await screen.findByText("Publiée")).toBeInTheDocument();
    expect(screen.queryByText("Soumise")).not.toBeInTheDocument();
  });

  it("permet à un étudiant de candidater avec un message", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([published]),
      "/api/applications": () => Response.json({
        id: 7, offerId: published.id, message: "Bonjour",
        status: "IN_PROGRESS", appliedAt: "2026-10-04 14:50:00",
      }, { status: 201 }),
    });
    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: `Candidater à ${published.title}` }));
    fireEvent.change(screen.getByLabelText("Message facultatif"), { target: { value: "Bonjour" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Votre candidature");
    expect(fetchMock).toHaveBeenCalledWith("/api/applications", {
      method: "POST",
      headers: { Authorization: "jeton", "Content-Type": "application/json" },
      body: JSON.stringify({ offerId: published.id, message: "Bonjour" }),
    });
    expect(screen.queryByLabelText("Message facultatif")).not.toBeInTheDocument();
  });

  it("permet de candidater sans message et affiche un conflit", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([published]),
      "/api/applications": () => new Response(null, { status: 409 }),
    });
    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: `Candidater à ${published.title}` }));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("candidature non retirée");
    expect(fetchMock).toHaveBeenCalledWith("/api/applications", expect.objectContaining({
      body: JSON.stringify({ offerId: published.id }),
    }));
    expect(screen.getByLabelText("Message facultatif")).toBeInTheDocument();
  });

  it("ne propose pas de candidature aux autres profils ni sur une offre non publiée", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    stubFetch({ "/api/offers": () => Response.json([published, offers[1]]) });
    const { unmount } = render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("2 offres");
    expect(screen.queryByRole("button", { name: /Candidater/ })).not.toBeInTheDocument();
    unmount();

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByRole("button", { name: `Candidater à ${published.title}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Candidater à Tableau de bord de qualité des données" })).not.toBeInTheDocument();
  });

  it("signale une session expirée pendant la candidature", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    stubFetch({
      "/api/offers": () => Response.json([published]),
      "/api/applications": () => new Response(null, { status: 401 }),
    });
    const onUnauthorized = vi.fn();
    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={onUnauthorized} />);

    fireEvent.click(await screen.findByRole("button", { name: `Candidater à ${published.title}` }));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
  });

  it("affiche une erreur serveur sans fermer le formulaire", async () => {
    const published = { ...offers[0], status: "PUBLISHED" };
    stubFetch({
      "/api/offers": () => Response.json([published]),
      "/api/applications": () => new Response(null, { status: 500 }),
    });
    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: `Candidater à ${published.title}` }));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma candidature" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("statut 500");
    expect(screen.getByLabelText("Message facultatif")).toBeInTheDocument();
  });
});
