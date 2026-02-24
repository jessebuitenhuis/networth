import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useSetupRedirect(hasAccounts: boolean): boolean {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasAccounts || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    fetch("/api/settings/setup-completed")
      .then((res) => res.json())
      .then(({ completed }) => {
        setIsChecked(true);
        setIsCompleted(completed);
        if (!completed) {
          router.replace("/setup");
        }
      });
  }, [hasAccounts, router]);

  if (hasAccounts) return true;
  return isChecked && isCompleted;
}
