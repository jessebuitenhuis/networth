import { Button } from "@/components/ui/button";

type DialogFooterActionsProps = {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel: string;
  isSubmitDisabled?: boolean;
  onSubmit?: () => void;
  onDestructiveAction?: () => void;
  destructiveLabel?: string;
};

export function DialogFooterActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel,
  isSubmitDisabled,
  onSubmit,
  onDestructiveAction,
  destructiveLabel = "Delete",
}: DialogFooterActionsProps) {
  return (
    <div className={`flex ${onDestructiveAction ? "justify-between" : "justify-end"}`}>
      {onDestructiveAction && (
        <Button type="button" variant="destructive" onClick={onDestructiveAction}>
          {destructiveLabel}
        </Button>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        {onSubmit ? (
          <Button type="button" onClick={onSubmit} disabled={isSubmitDisabled}>
            {submitLabel}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitDisabled}>
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
