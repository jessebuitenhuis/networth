export type DragHandlers = {
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, targetId: string) => void;
  onDragLeave: () => void;
  onDrop: (targetId: string) => void;
};
