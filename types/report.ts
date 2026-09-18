export type ReportContentType = "comment" | "review";

export type ReportReason =
  | "spam"
  | "offensive"
  | "inappropriate_photo"
  | "harassment"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface Report {
  id: string;
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
}
