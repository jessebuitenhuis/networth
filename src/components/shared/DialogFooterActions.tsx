import { Button } from "@/components/ui/button";

type DialogFooterActionsProps = {
  onCancel: () => void;
  submitLabel: string;
  isSubmitDisabled?: boolean;
};

export function DialogFooterActions({
  onCancel,
  submitLabel,
  isSubmitDisabled,
}: DialogFooterActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitDisabled}>
        {submitLabel}
      </Button>
    </div>
  );
}
