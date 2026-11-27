import { toApplication, toApplicationSummary } from "../mappers/application.mapper.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  list: (user: User) => {
    if (!isStudent(user)) throw new HttpError(403, "FORBIDDEN", "Réservé aux étudiants");
    return repository.findByStudent(user.id).map(toApplicationSummary);
  },
  apply: (user: User, offerId: number, message: string | null) => {
    if (!isStudent(user)) throw new HttpError(403, "FORBIDDEN", "Réservé aux étudiants");
    const result = repository.create(offerId, user.id, message);
    switch (result.kind) {
      case "not_found":
        throw new HttpError(404, "NOT_FOUND", "Offre introuvable");
      case "not_published":
        throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
      case "duplicate":
        throw new HttpError(409, "APPLICATION_EXISTS", "Une candidature non retirée existe déjà");
      case "created":
        return toApplication(result.application);
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
