import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  MultiSelectPicker,
  type MultiSelectPickerItem,
} from "./MultiSelectPicker";

const items: MultiSelectPickerItem[] = [
  { id: "1", label: "Alpha" },
  { id: "2", label: "Beta" },
  { id: "3", label: "Gamma" },
];

describe("MultiSelectPicker", () => {
  it("renders trigger with label and selected count", () => {
    const selectedIds = new Set(["1", "2"]);
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Items (2)" })
    ).toBeInTheDocument();
  });

  it("shows checkboxes for all items when opened", async () => {
    const selectedIds = new Set<string>();
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (0)" }));

    expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Beta" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Gamma" })).toBeInTheDocument();
  });

  it("reflects selectedIds in checkbox state", async () => {
    const selectedIds = new Set(["1"]);
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (1)" }));

    expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Beta" })).not.toBeChecked();
  });

  it("calls onToggle with item id when checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const selectedIds = new Set<string>();
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (0)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Beta" }));

    expect(onToggle).toHaveBeenCalledWith("2");
  });

  it("shows Deselect all when items are selected and onClearAll provided", async () => {
    const onClearAll = vi.fn();
    const selectedIds = new Set(["1"]);
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
        onClearAll={onClearAll}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (1)" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Deselect all" })
    );

    expect(onClearAll).toHaveBeenCalled();
  });

  it("hides Deselect all when no items are selected", async () => {
    const selectedIds = new Set<string>();
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (0)" }));

    expect(
      screen.queryByRole("button", { name: "Deselect all" })
    ).not.toBeInTheDocument();
  });

  it("renders action buttons via renderActions", async () => {
    const selectedIds = new Set<string>();
    const renderActions = (item: MultiSelectPickerItem) => (
      <button data-testid={`action-${item.id}`}>Edit</button>
    );

    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
        renderActions={renderActions}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (0)" }));

    expect(screen.getByTestId("action-1")).toHaveTextContent("Edit");
    expect(screen.getByTestId("action-2")).toHaveTextContent("Edit");
  });

  it("does not render action container when renderActions is undefined", async () => {
    const selectedIds = new Set<string>();
    render(
      <MultiSelectPicker
        label="Items"
        items={items}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Items (0)" }));

    expect(screen.queryByTestId(/action-/)).not.toBeInTheDocument();
  });
});
