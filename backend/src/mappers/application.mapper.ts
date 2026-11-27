import type {
  Application, ApplicationDbo, ApplicationDto, ApplicationListDbo, ApplicationSummary, ApplicationSummaryDto,
} from "../models/application.ts";

export const toApplication = (dbo: ApplicationDbo): Application => ({
  id: dbo.id,
  offerId: dbo.offer_id,
  studentId: dbo.student_id,
  message: dbo.message,
  status: dbo.status,
  appliedAt: dbo.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => ({
  id: application.id,
  offerId: application.offerId,
  message: application.message,
  status: application.status,
  appliedAt: application.appliedAt,
});

export const toApplicationSummary = (dbo: ApplicationListDbo): ApplicationSummary => ({
  ...toApplication(dbo),
  offer: {
    title: dbo.offer_title,
    companyShortName: dbo.company_short_name,
    academicYear: dbo.academic_year_label,
    period: dbo.period_code,
  },
});

export const toApplicationSummaryDto = (application: ApplicationSummary): ApplicationSummaryDto => ({
  id: application.id,
  offerId: application.offerId,
  title: application.offer.title,
  companyShortName: application.offer.companyShortName,
  academicYear: application.offer.academicYear,
  period: application.offer.period,
  appliedAt: application.appliedAt,
  message: application.message,
  status: application.status,
});
