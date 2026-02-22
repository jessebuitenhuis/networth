import { endOfMonth, formatDate } from "@/lib/dateUtils";

export function generateMonthlyDatePoints(
  today: string,
  endDate: string
): string[] {
  const todayDate = new Date(today + "T00:00:00");
  const dates: string[] = [today];

  for (let m = 0; m < 120; m++) {
    const eom = endOfMonth(
      new Date(todayDate.getFullYear(), todayDate.getMonth() + m, 1)
    );
    const eomStr = formatDate(eom);
    if (eomStr > endDate) break;
    if (eomStr !== dates[dates.length - 1]) {
      dates.push(eomStr);
    }
  }

  if (dates[dates.length - 1] !== endDate) {
    dates.push(endDate);
  }

  return dates;
}
