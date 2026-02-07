import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

/**
 * MobileRestriction Component
 * 
 * Wraps content that should only be visible on larger screens (Laptop/Desktop).
 * Shows a strict warning message on screens narrower than 1024px.
 */
const MobileRestriction = ({ children }) => {
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    useEffect(() => {
        const checkScreenSize = () => {
            // 1024px is a common breakpoint for landscape tablets/small laptops
            setIsLargeScreen(window.innerWidth >= 1024);
        };

        // Initial check
        checkScreenSize();

        // Listen for resize events
        window.addEventListener("resize", checkScreenSize);

        // Cleanup
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    if (isLargeScreen) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
                <div className="flex justify-center mb-6 space-x-4 text-slate-300">
                    <Smartphone className="w-8 h-8" />
                    <Tablet className="w-10 h-10" />
                    <div className="relative">
                        <Monitor className="w-12 h-12 text-indigo-600" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    Desktop Experience Required
                </h2>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    The annotation tools require a larger display for precision and best performance.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm font-medium mb-6">
                    Please open this page on a Laptop, Desktop, or Large Tablet.
                </div>

                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Current Width: {window.innerWidth}px
                </div>
            </div>
        </div>
    );
};

export default MobileRestriction;
