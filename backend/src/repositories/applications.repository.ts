import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationListDbo } from "../models/application.ts";
import type { OfferStatus } from "../models/offer.ts";

export const createApplicationsRepository = (db: Db) => {
  const findByStudent = db.prepare<[number], ApplicationListDbo>(`
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = ?
    ORDER BY a.applied_at DESC, a.id DESC
  `);
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
  const withdrawInProgress = db.prepare<[number, number], ApplicationDbo>(
    `UPDATE applications SET status = 'WITHDRAWN'
     WHERE id = ? AND student_id = ? AND status = 'IN_PROGRESS'
     RETURNING id, offer_id, student_id, message, status, applied_at`,
  );
  const findOwned = db.prepare<[number, number], { id: number }>(
    "SELECT id FROM applications WHERE id = ? AND student_id = ?",
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

  const withdraw = db.transaction((id: number, studentId: number) => {
    const application = withdrawInProgress.get(id, studentId);
    if (application !== undefined) return { kind: "withdrawn", application } as const;
    if (findOwned.get(id, studentId) === undefined) return { kind: "not_found" } as const;
    return { kind: "not_in_progress" } as const;
  });

  return {
    findByStudent: (studentId: number): ApplicationListDbo[] => findByStudent.all(studentId),
    create: (offerId: number, studentId: number, message: string | null) =>
      create.immediate(offerId, studentId, message),
    withdraw: (id: number, studentId: number) => withdraw.immediate(id, studentId),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
