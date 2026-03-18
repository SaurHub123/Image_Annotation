import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Download, 
  ChevronLeft, 
  Loader, 
  Search, 
  Moon, 
  Sun, 
  Box, 
  User, 
  Zap,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "./SEO";

const SIZE = 240;

const SkeletonThumbnail = ({ keypoints, connections }) => {
  return (
    <motion.svg 
      width={SIZE} 
      height={SIZE} 
      viewBox={`0 0 ${SIZE} ${SIZE}`} 
      className="rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Subtle Grid Background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Draw connections */}
      {connections.map((c, i) => {
        const a = keypoints.find(k => k.id === c.from);
        const b = keypoints.find(k => k.id === c.to);
        if (!a || !b) return null;
        return (
          <motion.line
            key={`conn-${i}`}
            x1={a.x * SIZE} y1={a.y * SIZE}
            x2={b.x * SIZE} y2={b.y * SIZE}
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: i * 0.02 }}
          />
        );
      })}

      {/* Draw keypoints */}
      {keypoints.map((kp) => (
        <motion.g key={kp.id} whileHover={{ scale: 1.2 }}>
          <circle
            cx={kp.x * SIZE}
            cy={kp.y * SIZE}
            r="4"
            fill="#4f46e5"
            className="drop-shadow-sm"
          />
          <circle
            cx={kp.x * SIZE}
            cy={kp.y * SIZE}
            r="8"
            fill="#6366f1"
            fillOpacity="0.2"
          />
        </motion.g>
      ))}
    </motion.svg>
  );
};

export default function SkeletonStore() {
  const [skeletons, setSkeletons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchSkeletons();
  }, []);

  const fetchSkeletons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/skeletons");
      const data = await response.json();
      const skeletonsArray = Array.isArray(data) ? data : [data];
      setSkeletons(skeletonsArray.filter(sk => sk && sk.name && sk.keypoints));
    } catch (err) {
      console.error(err);
      setSkeletons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkeletons = useMemo(() => {
    return skeletons.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [skeletons, searchQuery]);

  const handleDownload = (skeleton) => {
    setDownloadingId(skeleton.id);
    const dataStr = JSON.stringify(skeleton, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${skeleton.name.replace(/\s+/g, "_")}_skeleton.json`;
    link.click();
    
    setTimeout(() => setDownloadingId(null), 2000); // Reset after 2s
  };

  const theme = {
    bg: isDarkMode ? "bg-slate-950" : "bg-slate-50",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    card: isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200",
    input: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${theme.bg} ${theme.text}`}>
      <SEO title="PosePoint • Skeleton Store" />

      {/* Modern Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-2 text-indigo-500 font-medium">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Editor</span>
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <h1 className="text-2xl font-black tracking-tight tracking-tighter">
              SKELETON<span className="text-indigo-500">STORE</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64 ${theme.input}`}
              />
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-full transition-all ${isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-white shadow-sm border text-slate-600"}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold mb-2">Community Templates</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Jumpstart your annotation projects with pre-configured skeletons for pose estimation and object tracking.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader className="animate-spin w-10 h-10 text-indigo-500" />
            <p className="animate-pulse font-medium text-slate-400">Loading library...</p>
          </div>
        ) : filteredSkeletons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-24 rounded-3xl border-2 border-dashed ${theme.card}`}
          >
            <Box className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-xl font-semibold">No skeletons found</p>
            <p className="text-slate-500 mt-2">Try adjusting your search or create one in the editor.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredSkeletons.map((skeleton) => (
                <motion.div
                  layout
                  key={skeleton.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${theme.card}`}
                >
                  {/* Visual Preview */}
                  <div className="aspect-square relative flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-800/50 rounded-t-[22px] overflow-hidden">
                    <SkeletonThumbnail 
                      keypoints={skeleton.keypoints} 
                      connections={skeleton.connections} 
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                       <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                         {skeleton.keypoints.length > 15 ? 'Complex' : 'Simple'}
                       </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">
                        {skeleton.name}
                      </h3>
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <User className="w-3 h-3 text-indigo-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-500">
                        {skeleton.author || "Community"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10">
                      {skeleton.description || "A standard keypoint template for accurate data labeling."}
                    </p>

                    <button
                      onClick={() => handleDownload(skeleton)}
                      disabled={downloadingId === skeleton.id}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                        downloadingId === skeleton.id 
                        ? "bg-emerald-500 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25"
                      }`}
                    >
                      {downloadingId === skeleton.id ? (
                        <>
                          <CheckCircle2 size={18} />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download JSON
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}