import React from "react";
import {
    Download,
    Monitor,
    Apple,
    ArrowRight,
    CheckCircle2,
    WifiOff,
    Zap,
    ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DownloadPage() {
    const versions = [
        {
            os: "Windows",
            icon: <Monitor className="w-8 h-8" />,
            version: "v1.0.0",
            arch: "x64",
            size: "45 MB",
            color: "bg-blue-600",
            hover: "hover:bg-blue-700",
            link: "#",//"https://github.com/SaurHub123/Image_Annotation", // Placeholder
            button: "Not Available"
        },
        {
            os: "macOS",
            icon: <Apple className="w-8 h-8" />,
            version: "v1.0.0",
            arch: "Apple M & Intel",
            size: "38 MB",
            color: "bg-slate-900",
            hover: "hover:bg-slate-800",
            link: "#",
            button: "Not Available"
        },
        {
            os: "Linux",
            icon: <Monitor className="w-8 h-8" />, // Using monitor for generic linux/terminal feel or code icon
            version: "v1.0.0",
            arch: "Debian/Ubuntu",
            size: "20 MB",
            color: "bg-orange-600",
            hover: "hover:bg-orange-700",
            link: "#",
            button: "Not Available"
        }
    ];


    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* Header */}
            <nav className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                        Pixel<span className="text-indigo-600">Suite</span>
                    </Link>
                    <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 text-center px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Download for Desktop
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                    Experience the full power of Pixel Suite offline.
                    Native performance, local file system access, and enhanced privacy.
                </p>
            </section>

            {/* Downloads Grid */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {versions.map((v) => (
                        <div key={v.os} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                            <div className="p-8 text-center flex-1">
                                <div className={`w-16 h-16 mx-auto rounded-2xl ${v.color} text-white flex items-center justify-center mb-6 shadow-md`}>
                                    {v.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{v.os}</h3>
                                <div className="text-sm font-medium text-slate-500 mb-6 bg-slate-100 inline-block px-3 py-1 rounded-full">{v.version}</div>

                                <div className="space-y-2 text-sm text-slate-600 mb-8 text-left max-w-[80%] mx-auto">
                                    <div className="flex justify-between border-b border-slate-100 pb-1">
                                        <span>Architecture</span>
                                        <span className="font-medium text-slate-900">{v.arch}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-1">
                                        <span>Size</span>
                                        <span className="font-medium text-slate-900">{v.size}</span>
                                    </div>
                                </div>

                                <a
                                    href={v.link}
                                    className={`w-full block py-3 rounded-xl font-bold text-white transition-colors ${v.color} ${v.hover} shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2`}
                                >
                                    {/* Not Available */}
                                    <Download size={18} />
                                    {v.button} 
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="bg-white border-y border-slate-200 py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <WifiOff size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Works Offline</h3>
                            <p className="text-slate-600">No internet? No problem. Annotate your datasets anywhere, anytime without server dependencies.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Enhanced Privacy</h3>
                            <p className="text-slate-600">Your images never touch cloud servers. Desktop app ensures complete data sovereignty.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Native Performance</h3>
                            <p className="text-slate-600">Optimized for your hardware with direct GPU acceleration for rendering large datasets.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-slate-400 text-sm">
                <p>Current Release: Stable 2.0.0 | Licensed under MIT</p>
            </footer>
        </div>
    );
}
