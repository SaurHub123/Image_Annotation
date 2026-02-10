import React, { useEffect } from 'react';
import { useTour } from '../../context/TourContext';
import TourOverlay from './TourOverlay';
import TourCard from './TourCard';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const TourContainer = () => {
    const {
        isOpen,
        currentStep,
        steps,
        nextStep,
        prevStep,
        closeTour,
        isLastStep,
        tourId,
        completeTour
    } = useTour();

    // Handle confetti on completion
    useEffect(() => {
        // We can trigger this when completeTour is called, 
        // but completeTour closes the tour. 
        // Let's just listen for a specific step or just assume the user wants it at end.
    }, []);

    const handleNext = () => {
        if (isLastStep) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            completeTour();
        } else {
            nextStep();
        }
    };

    if (!isOpen || !steps || steps.length === 0) return null;

    const step = steps[currentStep];

    return (
        <>
            <TourOverlay targetSelector={step.target} />
            <AnimatePresence>
                <TourCard
                    key={`${tourId}-${currentStep}`} // key ensures animation on step change
                    step={step}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onNext={handleNext}
                    onPrev={prevStep}
                    onClose={closeTour}
                    isLast={isLastStep}
                />
            </AnimatePresence>
        </>
    );
};

export default TourContainer;
