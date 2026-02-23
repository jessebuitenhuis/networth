import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { NetWorthCard } from "./NetWorthCard";

interface NetWorthCardProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export class NetWorthCardPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ netWorth, totalAssets, totalLiabilities }: NetWorthCardProps) {
    const user = userEvent.setup();
    render(
      <NetWorthCard
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
      />,
    );
    return new NetWorthCardPage(user);
  }

  get heading() {
    return screen.getByText("Net Worth");
  }

  get netWorthValue() {
    return this.heading.nextElementSibling!;
  }

  getByText(text: string) {
    return screen.getByText(text);
  }
}
