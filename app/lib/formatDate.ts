const fullFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return fullFormatter.format(date);
}

export function formatYear(dateStr: string | undefined): string {
  if (!dateStr) return "";
  return dateStr.slice(0, 4);
}
