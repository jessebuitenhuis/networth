const frequencyLabels: Record<string, string> = {
  Weekly: "week",
  "Bi-weekly": "2 weeks",
  Monthly: "month",
  Quarterly: "quarter",
  Yearly: "year",
};

export function formatFrequencyLabel(frequency: string): string {
  return frequencyLabels[frequency] ?? frequency;
}
