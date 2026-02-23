import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type MultiSelectPickerItem } from "./MultiSelectPicker";
import { MultiSelectPickerPage } from "./MultiSelectPicker.page";

const items: MultiSelectPickerItem[] = [
  { id: "1", label: "Alpha" },
  { id: "2", label: "Beta" },
  { id: "3", label: "Gamma" },
];

describe("MultiSelectPicker", () => {
  it("renders trigger with label and selected count", () => {
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set(["1", "2"]),
      onToggle: vi.fn(),
    });

    expect(page.trigger("Items", 2)).toBeInTheDocument();
  });

  it("shows checkboxes for all items when opened", async () => {
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    await page.open("Items", 0);

    expect(page.checkbox("Alpha")).toBeInTheDocument();
    expect(page.checkbox("Beta")).toBeInTheDocument();
    expect(page.checkbox("Gamma")).toBeInTheDocument();
  });

  it("reflects selectedIds in checkbox state", async () => {
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set(["1"]),
      onToggle: vi.fn(),
    });

    await page.open("Items", 1);

    expect(page.checkbox("Alpha")).toBeChecked();
    expect(page.checkbox("Beta")).not.toBeChecked();
  });

  it("calls onToggle with item id when checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set<string>(),
      onToggle,
    });

    await page.open("Items", 0);
    await page.toggleItem("Beta");

    expect(onToggle).toHaveBeenCalledWith("2");
  });

  it("shows Deselect all when items are selected and onClearAll provided", async () => {
    const onClearAll = vi.fn();
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set(["1"]),
      onToggle: vi.fn(),
      onClearAll,
    });

    await page.open("Items", 1);
    await page.clickDeselectAll();

    expect(onClearAll).toHaveBeenCalled();
  });

  it("hides Deselect all when no items are selected", async () => {
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
      onClearAll: vi.fn(),
    });

    await page.open("Items", 0);

    expect(page.queryDeselectAllButton()).not.toBeInTheDocument();
  });

  it("renders action buttons via renderActions", async () => {
    const renderActions = (item: MultiSelectPickerItem) => (
      <button data-testid={`action-${item.id}`}>Edit</button>
    );

    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
      renderActions,
    });

    await page.open("Items", 0);

    expect(page.getByTestId("action-1")).toHaveTextContent("Edit");
    expect(page.getByTestId("action-2")).toHaveTextContent("Edit");
  });

  it("does not render action container when renderActions is undefined", async () => {
    const page = MultiSelectPickerPage.render({
      label: "Items",
      items,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    await page.open("Items", 0);

    expect(screen.queryByTestId(/action-/)).not.toBeInTheDocument();
  });
});
