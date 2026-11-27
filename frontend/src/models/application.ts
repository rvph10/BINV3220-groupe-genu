import type { PeriodCode } from "./offer.ts";

export const APPLICATION_STATUSES = ["IN_PROGRESS", "SELECTED", "REJECTED", "WITHDRAWN"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: number;
  offerId: number;
  message: string | null;
  status: "IN_PROGRESS";
  appliedAt: string;
}

export type WithdrawnApplication = Omit<Application, "status"> & { status: "WITHDRAWN" };

export interface ApplicationSummary {
  id: number;
  offerId: number;
  title: string;
  companyShortName: string;
  academicYear: string;
  period: PeriodCode;
  appliedAt: string;
  message: string | null;
  status: ApplicationStatus;
}
