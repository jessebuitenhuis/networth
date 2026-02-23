export type DisplayTransaction = {
  id: string;
  description: string;
  accountName: string;
  accountId?: string;
  date: string;
  amount: number;
  isProjected: boolean;
  isRecurring: boolean;
  scenarioName?: string;
  categoryName?: string;
  categoryId?: string;
  editAction: React.ReactNode;
};
