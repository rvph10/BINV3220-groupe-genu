import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const listOffersAs = (kind: UserKind, id: number) =>
  request(app).get("/offers").set("Authorization", tokenFor(kind, id));

const offerIds = (body: { id: number }[]): number[] => body.map((offer) => offer.id);

describe("GET /offers : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).get("/offers");

    expect(response.status).toBe(401);
  });

  it.each([
    ["promoteur et signataire", CONTACT.NADIA_CHERIF],
    ["signataire uniquement", CONTACT.NATHALIE_RENARD],
    ["promoteur uniquement", CONTACT.LAURA_SIMON],
  ])("refuse un contact %s (403)", async (_profile, id) => {
    const response = await listOffersAs("CONTACT", id);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /offers : visibilité selon le profil", () => {
  it("montre toutes les offres à un administrateur, de la plus récente année à la plus ancienne", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
    expect(response.body.at(-1)).toEqual({
      id: OFFER.PDF_REPORTS,
      title: "Module de rapports PDF",
      companyShortName: "Orbis",
      academicYear: "2025-2026",
      period: "P1",
      status: "ARCHIVED",
    });
  });

  it("ne montre que les offres publiées à un étudiant", async () => {
    const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(offerIds(response.body)).toEqual([
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
    ]);
    expect(response.body.every((o: { status: string }) => o.status === "PUBLISHED")).toBe(true);
  });

  it("montre à un déposant toutes ses offres, quel que soit leur statut", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.MARC_LEJEUNE);

    expect(offerIds(response.body)).toEqual([
      OFFER.E2E_TESTS,
      OFFER.BILLING_API,
      OFFER.PDF_REPORTS,
    ]);
  });

  it("ne montre pas à un déposant l'offre d'un collègue de la même entreprise", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.CLAIRE_DUMONT);

    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP]);
    expect(offerIds(response.body)).not.toContain(OFFER.CLIENT_PORTAL);
  });

  it("montre à un contact multi-entreprises ses offres dans ses deux entreprises", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.JULIEN_LAMBERT);

    expect(response.body.map((o: { companyShortName: string }) => o.companyShortName)).toEqual([
      "Lumen Digital",
      "Lumen Data",
    ]);
    expect(offerIds(response.body)).toEqual([OFFER.CLIENT_PORTAL, OFFER.DATA_QUALITY]);
  });

  it("n'expose que les champs du DTO", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(Object.keys(response.body[0]).sort()).toEqual(
      ["academicYear", "companyShortName", "id", "period", "status", "title"],
    );
  });
});

describe("GET /offers : filtre par période", () => {
  it.each([
    ["P1", [OFFER.PDF_REPORTS]],
    ["P2", [
      OFFER.CLIENT_PORTAL,
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
      OFFER.CLOUD_MIGRATION,
      OFFER.ARCHIVE_DIGITIZATION,
    ]],
    ["OTHER", [OFFER.CONSULTANT_PLANNING, OFFER.E2E_TESTS]],
  ])("retourne seulement les offres de la période %s", async (period, ids) => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ).query({ period });

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual(ids);
  });

  describe("GET /offers : recherche dans le titre", () => {
    it.each([
      ["  pOrTaIl cLiEnT  ", [OFFER.CLIENT_PORTAL]],
      ["NUMÉRISATION", [OFFER.ARCHIVE_DIGITIZATION]],
      ["numerisation", []],
      ["portail refonte", []],
      ["véhicules", []],
      ["Lumen Digital", []],
      ["%", []],
      ["aucune correspondance", []],
    ])("cherche l'expression littérale %j uniquement dans le titre", async (q, ids) => {
      const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ).query({ q });

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual(ids);
    });

    it.each(["", "   "])("une recherche vide %j conserve les offres accessibles", async (q) => {
      const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT).query({ q });

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual([
        OFFER.INTERNAL_CHATBOT,
        OFFER.DATA_QUALITY,
        OFFER.FLEET_APP,
        OFFER.BILLING_API,
      ]);
    });

    it("refuse un paramètre de recherche répété", async () => {
      const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ)
        .query("q=portail&q=client");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_QUERY");
    });

    it("combine la recherche et la période", async () => {
      const match = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ)
        .query({ q: "application", period: "P2" });
      const noMatch = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ)
        .query({ q: "application", period: "OTHER" });

      expect(match.status).toBe(200);
      expect(offerIds(match.body)).toEqual([OFFER.FLEET_APP, OFFER.CLOUD_MIGRATION]);
      expect(noMatch.status).toBe(200);
      expect(noMatch.body).toEqual([]);
    });

    it("ne révèle pas les offres non publiées à un étudiant", async () => {
      const admin = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ)
        .query({ q: "application", period: "P2" });
      const student = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT)
        .query({ q: "application", period: "P2" });

      expect(student.status).toBe(200);
      expect(offerIds(student.body)).toEqual([OFFER.FLEET_APP]);
      expect(offerIds(admin.body)).toEqual([OFFER.FLEET_APP, OFFER.CLOUD_MIGRATION]);
    });

    it("ne révèle pas les offres d'un autre déposant", async () => {
      const response = await listOffersAs("CONTACT", CONTACT.CLAIRE_DUMONT)
        .query({ q: "portail", period: "P2" });

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual([]);
    });
  });

  it("sans filtre conserve les offres de toutes les périodes", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
    expect(new Set(response.body.map((offer: { period: string }) => offer.period))).toEqual(
      new Set(["P1", "P2", "OTHER"]),
    );
  });

  it.each(["period=P3", "period=", "period=P1&period=P2"])(
    "refuse le paramètre invalide ou répété %s",
    async (query) => {
      const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ).query(query);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: {
          code: "INVALID_QUERY",
          message: "Le paramètre period doit valoir P1, P2 ou OTHER",
        },
      });
    },
  );

  it("ne montre à un étudiant que les offres publiées de la période demandée", async () => {
    const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT).query({ period: "P2" });

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
    ]);
    expect(response.body.every((offer: { status: string }) => offer.status === "PUBLISHED")).toBe(
      true,
    );
    const empty = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT).query({ period: "P1" });
    expect(empty.body).toEqual([]);
  });

  it("ne montre au déposant que ses offres de la période demandée", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.MARC_LEJEUNE).query({ period: "OTHER" });

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.E2E_TESTS]);
  });
});
