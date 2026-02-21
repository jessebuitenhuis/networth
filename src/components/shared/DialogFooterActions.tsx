import { Button } from "@/components/ui/button";

type DialogFooterActionsProps = {
  onCancel: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
};

export function DialogFooterActions({
  onCancel,
  submitLabel,
  submitDisabled,
}: DialogFooterActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </div>
  );
}
