import { Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  PenTool,
  BoxSelect,
  Crosshair,
  Bone,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  WifiOff
} from "lucide-react";

import Editor from "./components/Editor";
import AnnotationViewer from "./components/Viewer";
import KeypointAnnotator from "./components/KeyPoint";
import SkeletonEditor from "./components/skeletonPage";
import KeypointVisualizer from "./components/keyValidator";
import BoundingBoxAnnotator from "./components/BoundingBox";
import DownloadPage from "./components/Download";

function Home() {
  useEffect(() => {
    document.title = "Pixel Suite • Annotation Tools";
  }, []);

  const tools = [
    {
      id: "poly",
      name: "PixelPoly",
      path: "/editor",
      icon: <PenTool className="w-6 h-6" />,
      color: "bg-blue-500",
      title: "Polygon Segmentation",
      desc: "Precise freehand and polygon drawing for semantic segmentation tasks. Ideal for detailed object outlines."
    },
    {
      id: "bbox",
      name: "PixelBox",
      path: "/bbox",
      icon: <BoxSelect className="w-6 h-6" />,
      color: "bg-emerald-500",
      title: "Bounding Box",
      desc: "Fast and efficient object detection labeling. Draw, resize, and classify objects with standard bounding boxes."
    },
    {
      id: "keypoint",
      name: "PixelPoint",
      path: "/keypoints",
      icon: <Crosshair className="w-6 h-6" />,
      color: "bg-indigo-500",
      title: "Keypoint Annotation",
      desc: "Advanced pose estimation labeling. Define joint positions and key features with sub-pixel accuracy."
    },
    {
      id: "skeleton",
      name: "PixelSkeleton",
      path: "/skeletons",
      icon: <Bone className="w-6 h-6" />,
      color: "bg-amber-500",
      title: "Skeleton Creator",
      desc: "Design custom skeleton structures. Link keypoints to define relationships for pose estimation models."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">

      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Pixel<span className="text-indigo-600">Suite</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/download" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold text-indigo-600">
              <Download size={16} /> Download
            </Link>
            <a href="#" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            <Cpu size={14} />
            <span>v1.0.0</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            The Modern Suite for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Computer Vision Data
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A unified platform for all your image annotation needs.
            Label polygons, bounding boxes, and keypoints with pixel-perfect precision.
            Export to COCO format instantly.
          </p>

          <div className="flex items-center justify-center gap-4">
            {/* <Link to="#tools" className="group px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link> */}
            <a
              href="#tools"
              className="group px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>

          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24" id="tools">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${tool.color} opacity-5 rounded-bl-full group-hover:scale-110 transition-transform`} />

              <div className={`w-12 h-12 rounded-xl ${tool.color} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {tool.name}
              </h3>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                {tool.title}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Researchers Choose Pixel<span className="text-indigo-600">Suite</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built by developers for developers. We focus on speed, accuracy, and standardization.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Standardized Exports",
                desc: "All tools export to the industry-standard COCO JSON format, ready for direct integration with PyTorch, TensorFlow, and YOLO."
              },
              {
                title: "Local Privacy",
                desc: "Your data stays on your machine. We use browser-based processing so your sensitive images never leave your device."
              },
              {
                title: "Dark Mode Ready",
                desc: "Reduce eye strain during long annotation sessions with our carefully crafted dark mode across the entire suite."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 flex-shrink-0 text-indigo-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Desktop App Promo */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 py-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-left md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
              <WifiOff size={14} />
              <span>Offline Support</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">Take Pixel Offline</h2>
            <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
              Download the desktop application for Windows, macOS, and Linux.
              Annotate significantly larger datasets with native performance and complete privacy.
            </p>
            <Link
              to="/download"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-900 font-bold text-lg shadow-lg hover:bg-slate-100 transition-all"
            >
              Download Desktop App
            </Link>
          </div>

          {/* Abstract visual for desktop app */}
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-400 font-mono ml-4">Pixel Desktop</div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
                  <Layers className="text-slate-700 w-12 h-12" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                  <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                </div>
                <div className="h-4 bg-slate-700/50 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Layers size={18} />
          <span className="font-bold">Pixel Suite</span>
        </div>
        <p>© 2026 Annotation Tools. Open Source Project.</p>
      </footer>

    </div >
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/viewer" element={<AnnotationViewer />} />
      <Route path="/keypoints" element={<KeypointAnnotator />} />
      <Route path="/skeletons" element={<SkeletonEditor />} />
      <Route path="/bbox" element={<BoundingBoxAnnotator />} />
      <Route path="/validator" element={<KeypointVisualizer />} />
      <Route path="/download" element={<DownloadPage />} />
    </Routes>
  );
}
