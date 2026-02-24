import { AccountType } from "@/accounts/AccountType";

export type AccountSuggestion = {
  name: string;
  emoji: string;
  type: AccountType;
  defaultReturnRate?: number;
};

export const accountSuggestions: AccountSuggestion[] = [
  { name: "Checking", emoji: "🏦", type: AccountType.Asset },
  { name: "Savings", emoji: "💰", type: AccountType.Asset },
  { name: "401(k)", emoji: "📈", type: AccountType.Asset, defaultReturnRate: 7 },
  { name: "IRA", emoji: "🏛️", type: AccountType.Asset, defaultReturnRate: 7 },
  { name: "Brokerage", emoji: "📊", type: AccountType.Asset, defaultReturnRate: 7 },
  { name: "Home", emoji: "🏠", type: AccountType.Asset, defaultReturnRate: 3 },
  { name: "Car", emoji: "🚗", type: AccountType.Asset },
  { name: "Mortgage", emoji: "🏡", type: AccountType.Liability },
  { name: "Student Loans", emoji: "🎓", type: AccountType.Liability },
  { name: "Credit Card", emoji: "💳", type: AccountType.Liability },
  { name: "Car Loan", emoji: "🚙", type: AccountType.Liability },
];
