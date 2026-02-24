export type RecurringSuggestion = {
  description: string;
  emoji: string;
  isIncome: boolean;
};

export const recurringSuggestions: RecurringSuggestion[] = [
  { description: "Salary", emoji: "💵", isIncome: true },
  { description: "Freelance", emoji: "💻", isIncome: true },
  { description: "Side Hustle", emoji: "🛠️", isIncome: true },
  { description: "Rent / Mortgage", emoji: "🏠", isIncome: false },
  { description: "Groceries", emoji: "🛒", isIncome: false },
  { description: "Utilities", emoji: "💡", isIncome: false },
  { description: "Insurance", emoji: "🛡️", isIncome: false },
  { description: "Subscriptions", emoji: "📱", isIncome: false },
  { description: "Transportation", emoji: "🚌", isIncome: false },
  { description: "Dining Out", emoji: "🍽️", isIncome: false },
];
