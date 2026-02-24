export type DisplayTransaction = {
  id: string;
  accountId: string;
  description: string;
  accountName: string;
  date: string;
  amount: number;
  isProjected: boolean;
  isRecurring: boolean;
  scenarioName?: string;
  categoryId?: string;
  categoryName?: string;
  editAction: React.ReactNode;
};
