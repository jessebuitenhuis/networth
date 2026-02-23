"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { NetWorthChart } from "./NetWorthChart";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
};

export class NetWorthChartPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(options: RenderOptions = {}) {
    const { accounts = [], transactions = [] } = options;
    const user = userEvent.setup();
    mockApiResponses({ accounts, transactions });
    render(
      <AccountProvider>
        <TransactionProvider>
          <NetWorthChart />
        </TransactionProvider>
      </AccountProvider>
    );
    return new NetWorthChartPage(user);
  }

  // --- Element getters ---

  get chartContainer() {
    return screen.getByTestId("net-worth-chart");
  }

  get startInput() {
    return screen.getByLabelText("Start");
  }

  get endInput() {
    return screen.getByLabelText("End");
  }

  periodButton(name: string) {
    return screen.getByRole("button", { name });
  }

  accountButton(name: string) {
    return screen.getByRole("button", { name });
  }

  findAccountButton(name: string) {
    return screen.findByRole("button", { name });
  }

  // --- Query methods (nullable) ---

  queryStartInput() {
    return screen.queryByLabelText("Start");
  }

  queryEndInput() {
    return screen.queryByLabelText("End");
  }

  isPeriodPressed(name: string) {
    return this.periodButton(name).getAttribute("aria-pressed") === "true";
  }

  // --- Actions ---

  async selectPeriod(name: string) {
    await this._user.click(this.periodButton(name));
    return this;
  }

  async toggleAccount(name: string) {
    await this._user.click(this.accountButton(name));
    return this;
  }
}
