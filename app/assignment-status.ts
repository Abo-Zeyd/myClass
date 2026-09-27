export function getAssignmentStatus(completed: boolean, submissionDate: string) {
  if (completed) return "completed";
  if (!submissionDate) return "pending";

  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  const today = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;

  return submissionDate < today ? "overdue" : "pending";
}