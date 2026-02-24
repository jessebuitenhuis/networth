import { Button } from "@/components/ui/button";

import type { StepConfig } from "../setupSteps";
import { StepProgressBar } from "./StepProgressBar";

type StepLayoutProps = {
  config: StepConfig;
  stepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
};

export function StepLayout({
  config,
  stepIndex,
  isFirstStep,
  isLastStep,
  onNext,
  onBack,
  children,
}: StepLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-12">
      <div className="mb-8 flex justify-center">
        <StepProgressBar currentIndex={stepIndex} />
      </div>
      <div className="flex-1">
        <h1 className="mb-2 text-2xl font-bold">{config.title}</h1>
        <p className="mb-8 text-muted-foreground">{config.description}</p>
        {children}
      </div>
      <div className="flex justify-between pt-8">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <Button onClick={onNext}>
          {isLastStep ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
