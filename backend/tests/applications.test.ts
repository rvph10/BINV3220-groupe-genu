import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { Db } from "../src/db/database.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let db: Db;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const apply = (studentId: number = STUDENT.LUCAS_DUPONT) =>
  request(app).post("/applications").set("Authorization", tokenFor("STUDENT", studentId));

const list = (studentId: number) =>
  request(app).get("/applications").set("Authorization", tokenFor("STUDENT", studentId));

describe("GET /applications", () => {
  it("ne retourne que les candidatures de chaque étudiant, avec les détails de l'offre", async () => {
    const lucas = await list(STUDENT.LUCAS_DUPONT);
    const ines = await list(STUDENT.INES_HADDAD);

    expect(lucas.status).toBe(200);
    expect(lucas.body).toEqual([{
      id: 1,
      offerId: OFFER.FLEET_APP,
      title: "Application React de gestion de flotte",
      companyShortName: "Lumen Digital",
      academicYear: "2026-2027",
      period: "P2",
      appliedAt: "2026-10-02 18:10:00",
      message: "Le développement React m'intéresse particulièrement.",
      status: "IN_PROGRESS",
    }]);
    expect(ines.status).toBe(200);
    expect(ines.body.map((application: { id: number }) => application.id)).toEqual([2, 5]);
    expect(ines.body.map((application: { status: string }) => application.status))
      .toEqual(["IN_PROGRESS", "WITHDRAWN"]);
  });

  it("retourne les quatre statuts et les offres non publiées, triés par date puis identifiant décroissants", async () => {
    const insert = db.prepare(
      `INSERT INTO applications (student_id, offer_id, status, message, applied_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    insert.run(STUDENT.DMYTRO_KOVALENKO, OFFER.FLEET_APP, "IN_PROGRESS", "Message", "2026-10-01 10:00:00");
    insert.run(STUDENT.DMYTRO_KOVALENKO, OFFER.CLOUD_MIGRATION, "SELECTED", null, "2026-10-03 10:00:00");
    insert.run(STUDENT.DMYTRO_KOVALENKO, OFFER.PDF_REPORTS, "REJECTED", null, "2026-10-02 10:00:00");
    insert.run(STUDENT.DMYTRO_KOVALENKO, OFFER.BILLING_API, "WITHDRAWN", null, "2026-10-03 10:00:00");
    const response = await list(STUDENT.DMYTRO_KOVALENKO);

    expect(response.status).toBe(200);
    expect(response.body.map((application: { status: string }) => application.status))
      .toEqual(["WITHDRAWN", "SELECTED", "REJECTED", "IN_PROGRESS"]);
    expect(response.body[2]).toMatchObject({
      offerId: OFFER.PDF_REPORTS, academicYear: "2025-2026", period: "P1",
    });
  });

  it("retourne une liste vide pour un étudiant sans candidature", async () => {
    const response = await list(STUDENT.LOUIS_CLAES);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("refuse les requêtes sans session et les profils non étudiants", async () => {
    expect((await request(app).get("/applications")).status).toBe(401);
    for (const [kind, id] of [
      ["ADMIN", ADMINISTRATOR.ANNE_LECLERCQ],
      ["CONTACT", CONTACT.CLAIRE_DUMONT],
      ["CONTACT", CONTACT.NADIA_CHERIF],
    ] as const) {
      const response = await request(app).get("/applications")
        .set("Authorization", tokenFor(kind, id));
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
  });
});

describe("POST /applications", () => {
  it("crée une candidature avec un message et l'identité de la session", async () => {
    const response = await apply().send({ offerId: OFFER.DATA_QUALITY, message: "Bonjour" });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      offerId: OFFER.DATA_QUALITY,
      studentId: STUDENT.LUCAS_DUPONT,
      message: "Bonjour",
      status: "IN_PROGRESS",
      appliedAt: expect.any(String),
    });
    expect(db.prepare("SELECT student_id, message, status FROM applications WHERE id = ?").get(response.body.id))
      .toEqual({ student_id: STUDENT.LUCAS_DUPONT, message: "Bonjour", status: "IN_PROGRESS" });
  });

  it("accepte l'absence de message", async () => {
    const response = await apply().send({ offerId: OFFER.DATA_QUALITY });
    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse les requêtes sans session et les profils non étudiants", async () => {
    expect((await request(app).post("/applications").send({ offerId: OFFER.DATA_QUALITY })).status).toBe(401);
    for (const [kind, id] of [
      ["ADMIN", ADMINISTRATOR.ANNE_LECLERCQ],
      ["CONTACT", CONTACT.CLAIRE_DUMONT],
    ] as const) {
      const response = await request(app).post("/applications")
        .set("Authorization", tokenFor(kind, id)).send({ offerId: OFFER.DATA_QUALITY });
      expect(response.status).toBe(403);
    }
  });

  it.each([
    {},
    { offerId: 0 },
    { offerId: -1 },
    { offerId: 1.5 },
    { offerId: "5" },
    { offerId: OFFER.DATA_QUALITY, message: null },
    { offerId: OFFER.DATA_QUALITY, message: 42 },
    { offerId: OFFER.DATA_QUALITY, studentId: STUDENT.INES_HADDAD },
    [],
  ])("refuse un corps invalide ou une identité forgée : %j", async (body) => {
    const response = await apply().send(body);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it("refuse une offre inexistante", async () => {
    const response = await apply().send({ offerId: 99999 });
    expect(response.status).toBe(404);
  });

  it.each([
    OFFER.CLIENT_PORTAL, OFFER.E2E_TESTS, OFFER.CLOUD_MIGRATION, OFFER.PDF_REPORTS,
  ])("refuse l'offre non publiée %i", async (offerId) => {
    const response = await apply().send({ offerId });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
  });

  it.each(["IN_PROGRESS", "SELECTED", "REJECTED"] as const)(
    "refuse une nouvelle candidature si une candidature %s existe",
    async (status) => {
      db.prepare("UPDATE applications SET status = ? WHERE student_id = ? AND offer_id = ?")
        .run(status, STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP);
      const response = await apply().send({ offerId: OFFER.FLEET_APP });
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("APPLICATION_EXISTS");
    },
  );

  it("autorise une nouvelle candidature après plusieurs retraits et conserve l'historique", async () => {
    db.prepare("INSERT INTO applications (offer_id, student_id, status) VALUES (?, ?, 'WITHDRAWN')")
      .run(OFFER.BILLING_API, STUDENT.INES_HADDAD);
    const response = await apply(STUDENT.INES_HADDAD).send({ offerId: OFFER.BILLING_API });
    expect(response.status).toBe(201);
    expect(db.prepare("SELECT status FROM applications WHERE student_id = ? AND offer_id = ? ORDER BY id")
      .all(STUDENT.INES_HADDAD, OFFER.BILLING_API)).toEqual([
      { status: "WITHDRAWN" }, { status: "WITHDRAWN" }, { status: "IN_PROGRESS" },
    ]);
  });

  it("refuse même si un retrait figure parmi les candidatures précédentes", async () => {
    db.prepare("INSERT INTO applications (offer_id, student_id, status) VALUES (?, ?, 'REJECTED')")
      .run(OFFER.BILLING_API, STUDENT.INES_HADDAD);
    const response = await apply(STUDENT.INES_HADDAD).send({ offerId: OFFER.BILLING_API });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("n'accepte qu'une candidature lors de deux requêtes simultanées", async () => {
    const responses = await Promise.all([
      apply().send({ offerId: OFFER.DATA_QUALITY }),
      apply().send({ offerId: OFFER.DATA_QUALITY }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(db.prepare("SELECT count(*) AS count FROM applications WHERE student_id = ? AND offer_id = ?")
      .get(STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY)).toEqual({ count: 1 });
  });
});

describe("unicité des candidatures non retirées", () => {
  it.each(["IN_PROGRESS", "SELECTED", "REJECTED"] as const)(
    "refuse directement une seconde candidature non retirée après %s",
    (status) => {
      db.prepare("UPDATE applications SET status = ? WHERE student_id = ? AND offer_id = ?")
        .run(status, STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP);
      expect(() => db.prepare("INSERT INTO applications (offer_id, student_id) VALUES (?, ?)")
        .run(OFFER.FLEET_APP, STUDENT.LUCAS_DUPONT)).toThrow(/UNIQUE/);
      expect(() => db.prepare("INSERT INTO applications (offer_id, student_id, status) VALUES (?, ?, 'WITHDRAWN')")
        .run(OFFER.FLEET_APP, STUDENT.LUCAS_DUPONT)).not.toThrow();
    },
  );

  it("empêche de réactiver une candidature retirée si une autre n'est pas retirée", () => {
    db.prepare("INSERT INTO applications (offer_id, student_id, status) VALUES (?, ?, 'WITHDRAWN')")
      .run(OFFER.FLEET_APP, STUDENT.LUCAS_DUPONT);
    expect(() => db.prepare(
      "UPDATE applications SET status = 'SELECTED' WHERE offer_id = ? AND student_id = ? AND status = 'WITHDRAWN'",
    ).run(OFFER.FLEET_APP, STUDENT.LUCAS_DUPONT)).toThrow(/UNIQUE/);
  });
});
