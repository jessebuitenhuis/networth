export function applyInflation(
  amount: number,
  today: string,
  date: string,
  annualRate: number
): number {
  const todayDate = new Date(today + "T00:00:00");
  const txDate = new Date(date + "T00:00:00");
  const daysDiff =
    (txDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24);
  const yearsFraction = daysDiff / 365;
  return amount * Math.pow(1 + annualRate / 100, yearsFraction);
}
