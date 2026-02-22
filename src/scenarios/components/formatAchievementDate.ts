const MONTH_ABBREVIATIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatAchievementDate(date: string | null): string {
  if (!date) return "Not projected";
  const [year, month] = date.split("-");
  return `${MONTH_ABBREVIATIONS[parseInt(month, 10) - 1]} ${year}`;
}
