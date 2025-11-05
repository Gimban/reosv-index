import { useCallback, useState } from "react";

export function useStepNavigation(stepCount, initialStep = 0) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (initialStep < 0 || initialStep >= stepCount) {
      return 0;
    }
    return initialStep;
  });

  const goToStep = useCallback(
    (index) => {
      if (index < 0 || index >= stepCount) return;
      setCurrentStep(index);
    },
    [stepCount]
  );

  const goNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= stepCount - 1) return prev;
      return prev + 1;
    });
  }, [stepCount]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  return {
    currentStep,
    goNext,
    goPrev,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === stepCount - 1,
  };
}

