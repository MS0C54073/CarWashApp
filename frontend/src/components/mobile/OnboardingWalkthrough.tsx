import { useState, useEffect } from 'react';
import { OnboardingService, OnboardingSection } from '../../services/onboarding-service';
import './OnboardingWalkthrough.css';

interface OnboardingWalkthroughProps {
  sections: OnboardingSection[];
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  sections,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const currentSection = sections[currentStep];

  useEffect(() => {
    if (currentSection?.targetSelector) {
      const element = document.querySelector(currentSection.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + rect.height + 10,
          left: rect.left,
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, currentSection]);

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!currentSection) return null;

  return (
    <>
      <div className="onboarding-overlay" />
      <div
        className="onboarding-tooltip-mobile"
        style={position ? { top: `${position.top}px`, left: `${position.left}px` } : {}}
      >
        <div className="tooltip-progress">
          <div
            className="progress-bar"
            style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
          />
          <span className="progress-text">
            {currentStep + 1} of {sections.length}
          </span>
        </div>
        <div className="tooltip-content-mobile">
          <h3>{currentSection.title}</h3>
          <p>{currentSection.description}</p>
        </div>
        <div className="tooltip-actions-mobile">
          <button className="btn btn-text" onClick={onSkip}>
            Skip
          </button>
          <div className="action-buttons">
            {currentStep > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {currentStep === sections.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingWalkthrough;
