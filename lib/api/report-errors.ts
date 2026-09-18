export class ReportConflictError extends Error {
  constructor() {
    super("Content already reported");
    this.name = "ReportConflictError";
  }
}
