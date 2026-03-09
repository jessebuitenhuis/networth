"use client";

import type React from "react";

import { cn } from "@/lib/utils";

export type DraggableTreeRowProps = {
  id: string;
  dropTargetId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string) => void;
  onDragLeave: () => void;
  onDrop: (targetId: string) => void;
  onDragEnd: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  "data-testid"?: string;
};

export function DraggableTreeRow({
  id,
  dropTargetId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  className,
  style,
  children,
  "data-testid": testId,
}: DraggableTreeRowProps) {
  function handleDragStart(e: React.DragEvent) {
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    onDragStart(id);
  }

  function handleDragOver(e: React.DragEvent) {
    onDragOver(e, id);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onDrop(id);
  }

  const isDragOver = dropTargetId === id;

  return (
    <div
      data-testid={testId}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      style={style}
      className={cn(className, isDragOver && "bg-accent")}
    >
      {children}
    </div>
  );
}
