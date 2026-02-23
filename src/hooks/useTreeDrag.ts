import { useCallback, useState } from "react";

import { getDescendantIds } from "@/lib/getDescendantIds";

import type { DragHandlers } from "./DragHandlers.type";
import type { TreeDragState } from "./TreeDragState.type";
import type { TreeItem } from "./TreeItem.type";

export function useTreeDrag<T extends TreeItem>(
  items: T[],
  onReparent: (item: T, newParentId: string) => void,
): TreeDragState & DragHandlers {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const isValidDropTarget = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) return false;
      const descendants = getDescendantIds(draggedId, items);
      return !descendants.has(targetId);
    },
    [draggedId, items],
  );

  const onDragStart = useCallback((id: string) => setDraggedId(id), []);

  const onDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent, targetId: string) => {
      if (isValidDropTarget(targetId)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropTargetId(targetId);
      }
    },
    [isValidDropTarget],
  );

  const onDragLeave = useCallback(() => setDropTargetId(null), []);

  const onDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || !isValidDropTarget(targetId)) return;
      const dragged = items.find((item) => item.id === draggedId);
      if (dragged) onReparent(dragged, targetId);
      setDraggedId(null);
      setDropTargetId(null);
    },
    [draggedId, isValidDropTarget, items, onReparent],
  );

  return {
    draggedId,
    dropTargetId,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
