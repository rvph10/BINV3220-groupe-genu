export interface ApplicationDbo {
  id: number;
  offer_id: number;
  student_id: number;
  message: string | null;
  status: "IN_PROGRESS";
  applied_at: string;
}

export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  message: string | null;
  status: "IN_PROGRESS";
  appliedAt: string;
}
