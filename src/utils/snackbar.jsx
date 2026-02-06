import React, { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

/**
 * Reusable Snackbar Component
 * @param {boolean} show - Visibility state
 * @param {string} message - Text to display
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {function} onClose - Function to close the snackbar
 * @param {number} duration - Auto-hide time in ms
 */
export default function Snackbar({ 
  show, 
  message, 
  type = "success", 
  onClose, 
  duration = 3000 
}) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const styles = {
    success: "bg-emerald-500 border-emerald-600",
    error: "bg-red-500 border-red-600",
    info: "bg-blue-500 border-blue-600",
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform 
        ${show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}
    >
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-white ${styles[type] || styles.success}`}>
        <span className="shrink-0">{icons[type] || icons.success}</span>
        <p className="text-sm font-semibold tracking-wide whitespace-nowrap">
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}