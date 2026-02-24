import { setupSteps } from "../setupSteps";

type StepProgressBarProps = {
  currentIndex: number;
};

export function StepProgressBar({ currentIndex }: StepProgressBarProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={setupSteps.length}>
      {setupSteps.map((config, i) => (
        <div key={config.step} className="flex items-center gap-2">
          {i > 0 && (
            <div
              className={`h-0.5 w-8 ${i <= currentIndex ? "bg-primary" : "bg-muted"}`}
            />
          )}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : i < currentIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
}
