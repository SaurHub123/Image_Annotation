import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

const TourContext = createContext();

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};

export const TourProvider = ({ children, stepsMap }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tourId, setTourId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Derived state
    const steps = tourId && stepsMap[tourId] ? stepsMap[tourId] : [];
    const isLastStep = currentStep === steps.length - 1;

    // Persist completed tours
    const isTourCompleted = useCallback((id) => {
        return localStorage.getItem(`tourCompleted_${id}`) === 'true';
    }, []);

    const markTourCompleted = useCallback((id) => {
        localStorage.setItem(`tourCompleted_${id}`, 'true');
    }, []);

    const startTour = useCallback((id) => {
        // if (isTourCompleted(id)) return; // Optional: Force restart or check here
        setTourId(id);
        setCurrentStep(0);
        setIsOpen(true);
    }, []);

    const closeTour = useCallback(() => {
        setIsOpen(false);
        setTourId(null);
        setCurrentStep(0);
    }, []);

    const completeTour = useCallback(() => {
        if (tourId) {
            markTourCompleted(tourId);
            setIsOpen(false); // Close the tour
            setTourId(null); // Clear tour ID
            setCurrentStep(0); // Reset step

            // Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ec4899', '#ffffff']
            });
        }
    }, [tourId, markTourCompleted]);

    const nextStep = useCallback(() => {
        if (isLastStep) {
            completeTour();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    }, [isLastStep, completeTour]);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    }, []);

    // Auto-start check (can be moved to individual pages if they prefer detailed control, 
    // but centralizing here is cleaner if we pass a "defaultTourId" or similar, 
    // mainly we just provide the 'startTour' function for components to call)

    const value = {
        currentStep,
        setCurrentStep,
        tourId,
        isOpen,
        steps,
        isLastStep,
        startTour,
        closeTour,
        nextStep,
        prevStep,
        completeTour,
        isTourCompleted
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};
