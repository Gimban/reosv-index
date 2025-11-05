import React from "react";

export default function MobileStepper({
  steps,
  currentStep,
  goNext,
  goPrev,
  goToStep,
  isFirstStep,
  isLastStep,
  stepCompletion,
}) {
  const activeStep = steps[currentStep];
  const completionValue = stepCompletion
    ? stepCompletion[activeStep.id]
    : undefined;
  const canAdvance =
    completionValue === undefined ? true : Boolean(completionValue);

  return (
    <div className="dps-mobile-stepper">
      <div className="dps-mobile-stepper__progress">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = !!stepCompletion?.[step.id];
          const isClickable = index <= currentStep || isCompleted;

          return (
            <button
              type="button"
              key={step.id}
              className={`dps-mobile-stepper__chip${
                isActive ? " active" : ""
              }${isCompleted ? " completed" : ""}`}
              onClick={() => isClickable && goToStep(index)}
              aria-current={isActive ? "step" : undefined}
              disabled={!isClickable}
            >
              <span className="dps-mobile-stepper__index">{index + 1}</span>
              <span className="dps-mobile-stepper__label">{step.title}</span>
            </button>
          );
        })}
      </div>

      <div className="dps-mobile-stepper__content">{activeStep.render()}</div>

      <div className="dps-mobile-stepper__actions">
        <button
          type="button"
          className="dps-mobile-stepper__button secondary"
          onClick={goPrev}
          disabled={isFirstStep}
        >
          이전
        </button>
        {!isLastStep && (
          <button
            type="button"
            className="dps-mobile-stepper__button primary"
            onClick={goNext}
            disabled={!canAdvance}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
