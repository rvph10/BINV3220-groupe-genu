export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  message: string | null;
  status: "IN_PROGRESS";
  appliedAt: string;
}
