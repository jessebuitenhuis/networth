export type DisplayTransaction = {
  id: string;
  description: string;
  accountName: string;
  date: string;
  amount: number;
  isProjected: boolean;
  isRecurring: boolean;
  scenarioName?: string;
  editAction: React.ReactNode;
};
