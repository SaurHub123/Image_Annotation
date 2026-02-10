import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const AppTour = ({ tourId, steps }) => {
    const [run, setRun] = useState(false);
    const storageKey = `tourCompleted_${tourId}`;

    useEffect(() => {
        const tourCompleted = localStorage.getItem(storageKey);
        if (!tourCompleted) {
            setRun(true);
        }
    }, [storageKey]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem(storageKey, 'true');
        }
    };

    useEffect(() => {
        const handleRestart = () => {
            setRun(true);
        };
        // specific event for this tour
        window.addEventListener(`restartTour_${tourId}`, handleRestart);
        return () => window.removeEventListener(`restartTour_${tourId}`, handleRestart);
    }, [tourId]);

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={run}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#4f46e5', // Indigo-600 matches the theme
                },
            }}
        />
    );
};

export default AppTour;
