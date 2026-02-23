import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTreeDrag } from "./useTreeDrag";

type Item = { id: string; parentCategoryId?: string };

const parent: Item = { id: "1" };
const child: Item = { id: "2", parentCategoryId: "1" };
const grandchild: Item = { id: "3", parentCategoryId: "2" };
const sibling: Item = { id: "4" };

function setup(items: Item[] = [parent, child, grandchild, sibling]) {
  const onReparent = vi.fn();
  const result = renderHook(() => useTreeDrag(items, onReparent));
  return { ...result, onReparent };
}

function makeDragEvent(overrides: Partial<React.DragEvent> = {}) {
  return {
    preventDefault: vi.fn(),
    dataTransfer: { dropEffect: "" },
    ...overrides,
  } as unknown as React.DragEvent;
}

describe("useTreeDrag", () => {
  it("starts with null state", () => {
    const { result } = setup();
    expect(result.current.draggedId).toBeNull();
    expect(result.current.dropTargetId).toBeNull();
  });

  it("sets draggedId on dragStart", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("1"));
    expect(result.current.draggedId).toBe("1");
  });

  it("resets state on dragEnd", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("1"));
    act(() => result.current.onDragEnd());
    expect(result.current.draggedId).toBeNull();
    expect(result.current.dropTargetId).toBeNull();
  });

  it("sets dropTargetId on valid dragOver", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("4"));
    const e = makeDragEvent();
    act(() => result.current.onDragOver(e, "1"));
    expect(result.current.dropTargetId).toBe("1");
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("does not set dropTargetId when dragging onto self", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("1"));
    const e = makeDragEvent();
    act(() => result.current.onDragOver(e, "1"));
    expect(result.current.dropTargetId).toBeNull();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("does not set dropTargetId when dragging onto descendant", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("1"));
    const e = makeDragEvent();
    act(() => result.current.onDragOver(e, "3"));
    expect(result.current.dropTargetId).toBeNull();
  });

  it("clears dropTargetId on dragLeave", () => {
    const { result } = setup();
    act(() => result.current.onDragStart("4"));
    const e = makeDragEvent();
    act(() => result.current.onDragOver(e, "1"));
    act(() => result.current.onDragLeave());
    expect(result.current.dropTargetId).toBeNull();
  });

  it("calls onReparent on valid drop", () => {
    const { result, onReparent } = setup();
    act(() => result.current.onDragStart("4"));
    act(() => result.current.onDrop("1"));
    expect(onReparent).toHaveBeenCalledWith(sibling, "1");
    expect(result.current.draggedId).toBeNull();
    expect(result.current.dropTargetId).toBeNull();
  });

  it("does not call onReparent when dropping onto descendant", () => {
    const { result, onReparent } = setup();
    act(() => result.current.onDragStart("1"));
    act(() => result.current.onDrop("3"));
    expect(onReparent).not.toHaveBeenCalled();
  });

  it("does not call onReparent when nothing is dragged", () => {
    const { result, onReparent } = setup();
    act(() => result.current.onDrop("1"));
    expect(onReparent).not.toHaveBeenCalled();
  });
});
