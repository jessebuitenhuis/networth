import { cn } from "@/lib/utils";

import { setupSteps } from "../setupSteps";

type StepProgressBarProps = {
  currentIndex: number;
};

function StepConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      className={cn("h-0.5 w-8", isCompleted ? "bg-primary" : "bg-muted")}
    />
  );
}

function StepIndicator({
  number,
  isActive,
  isCompleted,
}: {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
        isActive && "bg-primary text-primary-foreground",
        isCompleted && "bg-primary/20 text-primary",
        !isActive && !isCompleted && "bg-muted text-muted-foreground",
      )}
    >
      {number}
    </div>
  );
}

export function StepProgressBar({ currentIndex }: StepProgressBarProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemax={setupSteps.length}
    >
      {setupSteps.map((config, i) => (
        <div key={config.step} className="flex items-center gap-2">
          {i > 0 && <StepConnector isCompleted={i <= currentIndex} />}
          <StepIndicator
            number={i + 1}
            isActive={i === currentIndex}
            isCompleted={i < currentIndex}
          />
        </div>
      ))}
    </div>
  );
}
