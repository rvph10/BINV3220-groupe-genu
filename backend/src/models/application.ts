import type { PeriodCode } from "./offer.ts";

export type ApplicationStatus = "IN_PROGRESS" | "SELECTED" | "REJECTED" | "WITHDRAWN";

export interface ApplicationDbo {
  id: number;
  offer_id: number;
  student_id: number;
  message: string | null;
  status: ApplicationStatus;
  applied_at: string;
}

export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationDto {
  id: number;
  offerId: number;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationListDbo extends ApplicationDbo {
  offer_title: string;
  company_short_name: string;
  academic_year_label: string;
  period_code: PeriodCode;
}

export interface ApplicationSummary extends Application {
  offer: {
    title: string;
    companyShortName: string;
    academicYear: string;
    period: PeriodCode;
  };
}

export interface ApplicationSummaryDto {
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
