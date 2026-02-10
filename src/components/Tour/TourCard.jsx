import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TourCard = ({ step, currentStep, totalSteps, onNext, onPrev, onClose, isLast }) => {
    // Determine position based on hint or calculate (simplified for now: center-bottom or based on target)
    // Ideally, we'd use popper.js or similar, but for custom request "animated overlays", 
    // let's place it relative to the spotlight or fixed if no target.

    // For this "rich UI", a floating card near the target is best.
    // If target is undefined (e.g. welcome step), center it.

    // Simple positioning logic:
    // If placement is 'center', fixed center.
    // Else, we might need coordinates. 
    // To keep it robust without heavy libraries, let's use a fixed position styles for now 
    // OR we can pass the rect from the parent.
    // Let's stick to a beautiful fixed card at bottom/center for mobile 
    // and near target for desktop if we had coords. 
    // Given the constraints and desire for "Motion", a fixed standardized card often looks cleaner than jumping around too much.
    // Let's try:
    // If step.placement === 'center', center of screen.
    // Else, positioning near target is tricky without rect data sharing. 
    // Let's assume the parent (TourContainer) will handle positioning OR we just float it in a nice spot (e.g. bottom center, or corners).

    // Actually, "Spotlight focus effects" usually implies the card is near the spotlight.
    // Let's accept `position` style props or use a fixed "Dialog" style that looks good everywhere.

    return (
        <motion.div
            className="fixed z-[9999] pointer-events-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
                // positioning logic could be improved, but centering for "Welcome" and efficient handling for others
                top: step?.placement === 'center' ? '50%' : undefined,
                left: step?.placement === 'center' ? '50%' : undefined,
                bottom: step?.placement === 'center' ? undefined : '5%',
                right: step?.placement === 'center' ? undefined : '5%',
                transform: step?.placement === 'center' ? 'translate(-50%, -50%)' : undefined,
                // Fallback for non-center steps: Bottom Right corner is unobtrusive
            }}
        >
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 w-[350px] max-w-[90vw] overflow-hidden relative">

                {/* Ambient background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            {/* Animated Icon if provided, or default */}
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                {currentStep + 1}
                            </span>
                            <h3 className="font-bold text-lg text-slate-800 leading-tight">
                                {step.title || "Quick Tip"}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Close tour"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="text-slate-600 text-sm leading-relaxed mb-6">
                        {step.content}
                    </div>

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between mt-2">
                        {/* Progress Dots */}
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalSteps }).map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${idx <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    layout
                                    transition={{ duration: 0.3 }}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={onPrev}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={onNext}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                {isLast ? (
                                    <>Finish <Check size={14} /></>
                                ) : (
                                    <>Next <ChevronRight size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TourCard;
