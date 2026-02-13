import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MultiSelectPickerItem = { id: string; label: string };

type MultiSelectPickerProps = {
  label: string;
  items: MultiSelectPickerItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClearAll?: () => void;
  renderActions?: (item: MultiSelectPickerItem) => ReactNode;
  popoverWidth?: string;
};

export function MultiSelectPicker({
  label,
  items,
  selectedIds,
  onToggle,
  onClearAll,
  renderActions,
  popoverWidth = "w-64",
}: MultiSelectPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {label} ({selectedIds.size})
        </Button>
      </PopoverTrigger>
      <PopoverContent className={popoverWidth}>
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 min-h-8"
              >
                <Checkbox
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(item.id)}
                  aria-label={item.label}
                />
                <Label htmlFor={item.id} className="cursor-pointer flex-1">
                  {item.label}
                </Label>
                {renderActions && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {renderActions(item)}
                  </div>
                )}
              </div>
            );
          })}
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2"
              onClick={onClearAll}
            >
              Deselect all
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
