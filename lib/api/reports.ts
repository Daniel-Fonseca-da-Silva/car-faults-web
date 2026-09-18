"use server";

import { ReportConflictError } from "@/lib/api/report-errors";
import { serverApiFetch } from "@/lib/api/server-client";
import type { Report, ReportContentType, ReportReason } from "@/types/report";

export interface CreateReportInput {
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  details?: string;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const response = await serverApiFetch("/v1/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new ReportConflictError();
  }

  if (!response.ok) {
    throw new Error(`Failed to submit report: ${response.status}`);
  }

  return (await response.json()) as Report;
}
