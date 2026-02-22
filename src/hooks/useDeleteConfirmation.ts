import { useCallback, useState } from "react";

interface UseDeleteConfirmationOptions {
  onDelete: () => void;
  setIsEditDialogOpen: (open: boolean) => void;
}

export function useDeleteConfirmation({
  onDelete,
  setIsEditDialogOpen,
}: UseDeleteConfirmationOptions) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setIsEditDialogOpen(false);
    setIsDeleteConfirmOpen(true);
  }, [setIsEditDialogOpen]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setIsEditDialogOpen(true);
  }, [setIsEditDialogOpen]);

  const confirmDelete = useCallback(() => {
    onDelete();
    setIsDeleteConfirmOpen(false);
  }, [onDelete]);

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCancelDelete();
      }
    },
    [handleCancelDelete],
  );

  return {
    isDeleteConfirmOpen,
    handleDeleteClick,
    confirmDelete,
    handleDeleteDialogOpenChange,
  };
}
