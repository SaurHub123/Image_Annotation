import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TourOverlay = ({ targetSelector, padding = 10, borderRadius = 12 }) => {
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        const updateRect = () => {
            // If no selector, center gracefully
            if (!targetSelector) {
                setTargetRect({
                    top: window.innerHeight / 2,
                    left: window.innerWidth / 2,
                    width: 0,
                    height: 0
                });
                return;
            }

            const element = document.querySelector(targetSelector);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect({
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                });
            } else {
                // target not found, fallback to center 0x0
                setTargetRect({
                    top: window.innerHeight / 2,
                    left: window.innerWidth / 2,
                    width: 0,
                    height: 0
                });
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [targetSelector, padding]);

    if (!targetRect) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[9998] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <motion.rect
                            initial={false}
                            animate={{
                                x: targetRect.left,
                                y: targetRect.top,
                                width: targetRect.width,
                                height: targetRect.height,
                                rx: borderRadius
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25
                            }}
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.6)"
                    mask="url(#spotlight-mask)"
                />

                {/* Indigo Glow Border */}
                <motion.rect
                    initial={false}
                    animate={{
                        x: targetRect.left,
                        y: targetRect.top,
                        width: targetRect.width,
                        height: targetRect.height,
                        rx: borderRadius
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="3"
                    style={{ filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))" }}
                />
            </svg>
        </motion.div>
    );
};

export default TourOverlay;
