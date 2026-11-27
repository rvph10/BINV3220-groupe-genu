import { Router } from "express";
import { toApplicationDto, toApplicationSummaryDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { isStudent } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

interface ApplicationBody {
  offerId: number;
  message?: string;
}

const isApplicationBody = (value: unknown): value is ApplicationBody => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return (
    Object.keys(body).every((key) => key === "offerId" || key === "message") &&
    typeof body.offerId === "number" &&
    Number.isSafeInteger(body.offerId) &&
    body.offerId > 0 &&
    (body.message === undefined || typeof body.message === "string")
  );
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.get("/", authorize(isStudent), (req, res) => {
    res.json(service.list(getCurrentUser(req)).map(toApplicationSummaryDto));
  });

  router.post("/", authorize(isStudent), (req, res) => {
    const body: unknown = req.body;
    if (!isApplicationBody(body)) {
      throw new HttpError(400, "INVALID_BODY", "Indiquez un offerId entier positif et un message facultatif");
    }
    res.status(201).json(toApplicationDto(
      service.apply(getCurrentUser(req), body.offerId, body.message ?? null),
    ));
  });

  router.patch("/:id/withdraw", authorize(isStudent), (req, res) => {
    const rawId = req.params.id;
    const id = Number(rawId);
    if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
      throw new HttpError(400, "INVALID_PARAMETER", "L'identifiant doit être un entier positif");
    }
    res.json(toApplicationDto(service.withdraw(getCurrentUser(req), id)));
  });

  return router;
};
