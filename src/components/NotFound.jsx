import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-slate-200 select-none">
                    404
                </h1>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Page Not Found
                </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Lost in the Pixel Space?
            </h2>

            <p className="text-slate-600 max-w-md mx-auto mb-10 leading-relaxed text-lg">
                The page you exist looking for might have been moved, deleted, or possibly never existed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                    <Home size={18} />
                    Go Home
                </Link>

                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    <ArrowLeft size={18} />
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFound;
