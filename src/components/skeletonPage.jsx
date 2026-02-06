import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Circle, Line, Text, Group, Rect, Label, Tag, Image as KonvaImage } from "react-konva";
import { loadSkeletons, saveSkeletons } from "../utils/skeletonStorage";
import Snackbar from "../utils/snackbar";
import { Link } from "react-router-dom";
import {
  Trash2,
  Save,
  Link as LinkIcon,
  Bone,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  Image as ImageIcon,
  X
} from "lucide-react";

const SIZE = 600;

export default function SkeletonEditor() {
  /* ===== STATE ===== */
  const [skeletons, setSkeletons] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [name, setName] = useState("");
  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);

  const [connectMode, setConnectMode] = useState(false);
  const [source, setSource] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // New States for Reference Image
  const [bgImage, setBgImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Helper function to trigger it
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };


  /* ===== LOAD STORAGE ===== */
  useEffect(() => {
    setSkeletons(loadSkeletons());
  }, []);

  /* ===== HELPERS ===== */
  const clamp = (v) => Math.max(0, Math.min(1, v));

  /* ===== IMAGE HANDLING ===== */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setBgImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  /* ===== CANVAS CLICK ===== */
  const handleStageClick = (e) => {
    if (connectMode) return;
    const isBackground = e.target === e.target.getStage() || e.target.attrs.name === 'background' || e.target.attrs.name === 'refImage';
    if (!isBackground) return;

    const pos = e.target.getStage().getPointerPosition();

    setKeypoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `KP ${prev.length + 1}`,
        x: clamp(pos.x / SIZE),
        y: clamp(pos.y / SIZE),
      },
    ]);
  };

  /* ===== CONNECT ===== */
  const handlePointClick = (id, e) => {
    e.cancelBubble = true;
    if (!connectMode) return;
    if (!source) {
      setSource(id);
      return;
    }
    if (source === id) {
      setSource(null);
      return;
    }
    const exists = connections.some(c =>
      (c.from === source && c.to === id) || (c.from === id && c.to === source)
    );
    if (!exists) {
      setConnections((prev) => [...prev, { from: source, to: id }]);
    }
    setSource(null);
  };

  /* ===== SAVE ===== */
  const saveSkeleton = () => {
    if (!name) return alert("Please enter a name");
    const updated = [...skeletons.filter(s => s.id !== activeId), {
      id: activeId || crypto.randomUUID(),
      name,
      keypoints,
      connections,
    }];
    saveSkeletons(updated);
    setSkeletons(updated);
    showToast("Skeleton saved successfully!", "success");
  };

  /* ===== LOAD ===== */
  const loadSkeleton = (sk) => {
    setActiveId(sk.id);
    setName(sk.name);
    setKeypoints(sk.keypoints);
    setConnections(sk.connections);
  };

  /* ===== RESET / NEW ===== */
  const handleNew = () => {
    setActiveId(null);
    setName("");
    setKeypoints([]);
    setConnections([]);
    setSource(null);
    setBgImage(null);
  };

  const deleteKeypoint = (id) => {
    setKeypoints(k => k.filter(p => p.id !== id));
    setConnections(c => c.filter(x => x.from !== id && x.to !== id));
  };

  const deleteSkeleton = (id, e) => {
    e.stopPropagation();
    const updated = skeletons.filter(s => s.id !== id);
    saveSkeletons(updated);
    setSkeletons(updated);
    if (activeId === id) handleNew();
  };

  /* ================= UI CLASSES ================= */
  const theme = {
    bg: isDarkMode ? "bg-slate-900" : "bg-slate-50",
    sidebar: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    subText: isDarkMode ? "text-slate-400" : "text-slate-500",
    card: isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-200",
    input: isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-slate-50 border-slate-300 text-slate-900",
    buttonSecondary: isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800",
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      {/* ===== LEFT SIDEBAR ===== */}
      <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>
        <div className="p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bone className="w-6 h-6 text-indigo-500" />
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <h1 className="font-bold text-xl tracking-tight">PixelSkeleton</h1>
            </Link>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-inherit">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skeleton Name (e.g. Human)"
            className={`w-full text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme.input}`}
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setConnectMode(!connectMode)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${connectMode ? "bg-emerald-500 text-white" : theme.buttonSecondary}`}
            >
              <LinkIcon size={16} /> {connectMode ? "Linking..." : "Link Mode"}
            </button>
            <button onClick={saveSkeleton} className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Save size={16} /> Save
            </button>
          </div>

          {/* Reference Image Control */}
          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium border-2 border-dashed transition-all ${bgImage ? 'border-indigo-500 text-indigo-500' : 'border-slate-300 text-slate-500'}`}
            >
              <ImageIcon size={16} /> {bgImage ? "Change Reference" : "Upload Reference"}
            </button>
            
            {bgImage && (
              <div className="px-1">
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1 opacity-60">
                  <span>Image Opacity</span>
                  <span>{Math.round(imageOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={imageOpacity} 
                  onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>

          <button onClick={handleNew} className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded hover:bg-opacity-80 transition-all ${theme.subText} border border-dashed border-slate-400`}>
            <Plus size={12} /> New Project
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar min-h-0 border-b border-inherit">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.subText}`}>Keypoints ({keypoints.length})</h3>
          {keypoints.map((kp) => (
            <div key={kp.id} className={`flex items-center gap-2 p-2 mb-2 rounded border transition-all ${theme.card}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${source === kp.id ? 'bg-amber-400' : 'bg-indigo-500'}`}>
                {kp.name?.charAt(0).toUpperCase()}
              </div>
              <input
                value={kp.name}
                onChange={(e) => setKeypoints(prev => prev.map(p => p.id === kp.id ? { ...p, name: e.target.value } : p))}
                className={`flex-1 text-sm bg-transparent focus:outline-none font-medium ${theme.text}`}
              />
              <button onClick={() => deleteKeypoint(kp.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ===== CANVAS AREA ===== */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-100/50 relative overflow-hidden">
        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
          <Stage
            width={SIZE}
            height={SIZE}
            onMouseDown={handleStageClick}
            style={{
              cursor: connectMode ? "crosshair" : "default",
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff"
            }}
          >
            <Layer>
              {/* 1. Background Rect */}
              <Rect width={SIZE} height={SIZE} fill="transparent" name="background" />
              
              {/* 2. Reference Image */}
              {bgImage && (
                <KonvaImage
                  image={bgImage}
                  width={SIZE}
                  height={SIZE}
                  opacity={imageOpacity}
                  name="refImage"
                  // Maintains aspect ratio logic could be added here
                />
              )}

              {/* 3. Connections */}
              {connections.map((c, i) => {
                const a = keypoints.find(k => k.id === c.from);
                const b = keypoints.find(k => k.id === c.to);
                if (!a || !b) return null;
                return (
                  <Line
                    key={i}
                    points={[a.x * SIZE, a.y * SIZE, b.x * SIZE, b.y * SIZE]}
                    stroke={isDarkMode ? "#34d399" : "#059669"}
                    strokeWidth={3}
                    lineCap="round"
                    opacity={0.8}
                  />
                );
              })}

              {/* 4. Nodes */}
              {keypoints.map((kp) => (
                <Group
                  key={kp.id}
                  x={kp.x * SIZE}
                  y={kp.y * SIZE}
                  draggable={!connectMode}
                  onDragMove={(e) => {
                    const p = e.target.position();
                    setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, x: clamp(p.x / SIZE), y: clamp(p.y / SIZE) } : k));
                  }}
                  onClick={(e) => handlePointClick(kp.id, e)}
                >
                  <Circle
                    radius={source === kp.id ? 9 : 6}
                    fill={source === kp.id ? "#fbbf24" : "#6366f1"}
                    stroke="white"
                    strokeWidth={2}
                    shadowBlur={4}
                  />
                  <Label y={-24} opacity={0.8}>
                    <Tag fill={isDarkMode ? "#0f172a" : "#334155"} cornerRadius={4} pointerDirection="down" />
                    <Text text={kp.name} padding={5} fill="white" fontSize={11} fontStyle="bold" />
                  </Label>
                </Group>
              ))}
            </Layer>
          </Stage>

          <Snackbar 
    show={toast.show} 
    message={toast.message} 
    type={toast.type} 
    onClose={() => setToast({ ...toast, show: false })} 
  />
          
          {/* Clear Image Overlay Button */}
          {bgImage && (
            <button 
              onClick={() => setBgImage(null)}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
              title="Remove Background"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className={`mt-4 text-xs font-medium ${theme.subText}`}>
          Canvas: {SIZE}x{SIZE}px | Reference active: {bgImage ? 'Yes' : 'No'}
        </div>
      </main>

      {/* ===== RIGHT SIDEBAR ===== */}
      <aside className={`w-72 flex-shrink-0 border-l flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>
        <div className="p-5 border-b border-inherit">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>Saved templates</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {skeletons.map(sk => (
            <div
              key={sk.id}
              onClick={() => loadSkeleton(sk)}
              className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${activeId === sk.id ? "bg-indigo-50 border-indigo-200" : theme.card}`}
            >
              <div>
                <p className="font-semibold text-sm">{sk.name}</p>
                <p className={`text-[10px] ${theme.subText}`}>{sk.keypoints.length} nodes</p>
              </div>
              <button onClick={(e) => deleteSkeleton(sk.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}