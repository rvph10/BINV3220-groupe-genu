import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";
import type { OfferStatus } from "../models/offer.ts";

export const createApplicationsRepository = (db: Db) => {
  const findOffer = db.prepare<[number], { status: OfferStatus }>(
    "SELECT status FROM offers WHERE id = ?",
  );
  const findExisting = db.prepare<[number, number], { id: number }>(
    "SELECT id FROM applications WHERE student_id = ? AND offer_id = ? AND status <> 'WITHDRAWN'",
  );
  const insert = db.prepare<[number, number, string | null], ApplicationDbo>(
    `INSERT INTO applications (offer_id, student_id, message)
     VALUES (?, ?, ?)
     RETURNING id, offer_id, student_id, message, status, applied_at`,
  );

  const create = db.transaction((offerId: number, studentId: number, message: string | null) => {
    const offer = findOffer.get(offerId);
    if (offer === undefined) return { kind: "not_found" } as const;
    if (offer.status !== "PUBLISHED") return { kind: "not_published" } as const;
    if (findExisting.get(studentId, offerId) !== undefined) return { kind: "duplicate" } as const;
    const application = insert.get(offerId, studentId, message);
    if (application === undefined) throw new Error("La candidature n'a pas été enregistrée");
    return { kind: "created", application } as const;
  });

  return {
    create: (offerId: number, studentId: number, message: string | null) =>
      create.immediate(offerId, studentId, message),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
