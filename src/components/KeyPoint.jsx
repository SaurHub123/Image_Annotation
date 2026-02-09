import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group, Label, Tag, Text } from "react-konva";
import { Link } from "react-router-dom";
import Snackbar from "../utils/snackbar";
import Konva from "konva";
import {
  Download,
  FolderOpen,
  Trash2,
  Sun,
  Moon,
  ImagePlus,
  Palette,
  Crosshair,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings2
} from "lucide-react";
import { loadSkeletons } from "../utils/skeletonStorage";

/* ================= HELPERS ================= */
const toAlphabetic = (n) => {
  let s = "";
  n += 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export default function KeypointAnnotator() {
  const stageRef = useRef(null);
  const imageRef = useRef(null);

  // Theme & UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isImageNavExpanded, setIsImageNavExpanded] = useState(false);

  // Folder & File State
  const [inputDirHandle, setInputDirHandle] = useState(null);
  const [outputDirHandle, setOutputDirHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);

  // Annotation State
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });
  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectMode, setConnectMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState(null);
  const [activeKp, setActiveKp] = useState(null);
  const [activeFilter, setActiveFilter] = useState("None");
  const [skeletons, setSkeletons] = useState([]);

  useEffect(() => {
    document.title = "PixelPoint • Keypoint Annotator";
    setSkeletons(loadSkeletons());
  }, []);

  useEffect(() => {
    if (imageObj && imageRef.current) {
      imageRef.current.cache();
    }
  }, [imageObj, activeFilter, stageSize]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  /* ================= FOLDER LOGIC ================= */
  const handleOpenFolders = async () => {
    try {
      const inputHandle = await window.showDirectoryPicker();
      const outputHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      setInputDirHandle(inputHandle);
      setOutputDirHandle(outputHandle);
      await scanDirectory(inputHandle, outputHandle);
      showToast("Folders synced successfully");
    } catch (err) {
      console.error("Folder selection cancelled", err);
    }
  };

  const scanDirectory = async (input, output) => {
    if (!input || !output) return;
    const validFiles = [];
    const annotatedSet = new Set();

    for await (const entry of output.values()) {
      if (entry.name.endsWith(".txt")) {
        annotatedSet.add(entry.name.replace(".txt", ""));
      }
    }

    for await (const entry of input.values()) {
      if (entry.kind === "file" && /\.(jpe?g|png|webp|bmp)$/i.test(entry.name)) {
        const file = await entry.getFile();
        const baseName = entry.name.replace(/\.[^/.]+$/, "");
        validFiles.push({
          handle: entry,
          name: entry.name,
          url: URL.createObjectURL(file),
          isAnnotated: annotatedSet.has(baseName)
        });
      }
    }
    setFiles(validFiles);
  };

  const handleSelectImage = async (fileData) => {
    const file = await fileData.handle.getFile();
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(900 / img.width, 1);
      setStageSize({ w: Math.round(img.width * scale), h: Math.round(img.height * scale) });
      setImageObj(img);
      setFileName(fileData.name);
      setKeypoints([]);
      setConnections([]);
      setConnectionSource(null);
    };
    img.src = fileData.url;
  };

  /* ================= ANNOTATION LOGIC ================= */
  const handleStageClick = (e) => {
    if (!imageObj || connectMode) return;
    const stage = e.target.getStage();
    if (e.target !== stage && e.target.className !== "Image") return;
    
    const pos = stage.getPointerPosition();
    setKeypoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x: pos.x,
        y: pos.y,
        name: toAlphabetic(prev.length),
        visibility: 2,
      },
    ]);
  };

  const handleKeypointClick = (id, e) => {
    e.cancelBubble = true;
    if (!connectMode) {
      setActiveKp(id);
      return;
    }

    if (!connectionSource) {
      setConnectionSource(id);
      return;
    }

    if (connectionSource === id) return;

    setConnections((prev) => {
      const exists = prev.some(c => (c.from === connectionSource && c.to === id) || (c.from === id && c.to === connectionSource));
      return exists ? prev : [...prev, { from: connectionSource, to: id }];
    });
    setConnectionSource(null);
  };

  const handleSave = async () => {
    if (!imageObj || !keypoints.length || !outputDirHandle) return;
    
    const ordered = [...keypoints].sort((a, b) => a.name.localeCompare(b.name));
    const xs = ordered.map(k => k.x);
    const ys = ordered.map(k => k.y);

    const nx = (v) => (v / stageSize.w).toFixed(6);
    const ny = (v) => (v / stageSize.h).toFixed(6);

    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);

    const parts = ["0", nx(cx), ny(cy), nx(w), ny(h)];
    ordered.forEach((k) => parts.push(nx(k.x), ny(k.y), k.visibility));

    try {
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const fileHandle = await outputDirHandle.getFileHandle(`${baseName}.txt`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(parts.join(" "));
      await writable.close();
      
      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, isAnnotated: true } : f));
      showToast(`Saved ${baseName}.txt`);
    } catch (err) {
      showToast("Error saving file", "error");
    }
  };

  const getFilters = () => {
    switch (activeFilter) {
      case "Grayscale": return [Konva.Filters.Grayscale];
      case "Invert": return [Konva.Filters.Invert];
      default: return [];
    }
  };

  /* ================= UI THEME ================= */
  const theme = {
    bg: isDarkMode ? "bg-slate-900" : "bg-slate-50",
    sidebar: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    subText: isDarkMode ? "text-slate-400" : "text-slate-500",
    card: isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-200",
    buttonSecondary: isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800",
  };

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      
      {/* ===== TOP NAVIGATION ACCORDION ===== */}
      <div className={`border-b transition-all duration-300 ${theme.sidebar} ${isImageNavExpanded ? 'py-6' : 'h-16'}`}>
        <div className="flex items-center justify-between px-8 h-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewIndex(Math.max(0, viewIndex - 1))} className={`p-1.5 rounded-full ${theme.buttonSecondary}`} disabled={viewIndex === 0}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setIsImageNavExpanded(!isImageNavExpanded)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Images</span>
              {isImageNavExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="flex-1 flex justify-center px-4 overflow-hidden">
            {files.length > 0 ? (
              <div className={`flex items-center gap-4 transition-all duration-300 ${isImageNavExpanded ? 'flex-wrap justify-center' : 'flex-nowrap'}`}>
                {files.slice(viewIndex, viewIndex + 10).map((file) => (
                  <div key={file.name} onClick={() => handleSelectImage(file)} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-all ${fileName === file.name ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-transparent hover:border-slate-300'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${file.isAnnotated ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={`text-[11px] truncate max-w-[100px] ${fileName === file.name ? 'font-bold text-indigo-500' : 'opacity-70'}`}>{file.name}</span>
                    </div>
                    {isImageNavExpanded && (
                      <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${fileName === file.name ? 'border-indigo-500' : 'border-slate-200'}`}>
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <span className="text-xs italic opacity-30">Load folders to see images</span>}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setViewIndex(Math.min(files.length - 1, viewIndex + 1))} className={`p-1.5 rounded-full ${theme.buttonSecondary}`}>
              <ChevronRight size={18} />
            </button>
            <div className="pl-4 border-l border-inherit flex flex-col items-end">
                <span className="text-[10px] font-bold text-indigo-500">{files.filter(f => f.isAnnotated).length}/{files.length}</span>
                <span className="text-[8px] uppercase tracking-tighter opacity-40 font-bold">Progress</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 ${theme.sidebar}`}>
          <div className="p-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-6 h-6 text-indigo-500" />
              <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              <h1 className="font-bold text-xl tracking-tight">PixelPoint</h1>
              </Link>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>

          <div className="p-4 space-y-3 border-b border-inherit">
            <button onClick={handleOpenFolders} className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-md">
              <FolderOpen size={18} /> Open Project Folder
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConnectMode(!connectMode)} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${connectMode ? "bg-emerald-500 text-white shadow-lg" : theme.buttonSecondary}`}>
                <LinkIcon size={16} /> {connectMode ? "Linking..." : "Link Mode"}
              </button>
              <button onClick={handleSave} disabled={!keypoints.length} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${!keypoints.length ? "opacity-50 " + theme.buttonSecondary : "bg-sky-600 text-white shadow-lg"}`}>
                <Download size={16} /> Save
              </button>
            </div>
          </div>

          {/* KEYPOINT LIST ACCORDION */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div onClick={() => setIsListExpanded(!isListExpanded)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-inherit">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Nodes ({keypoints.length})</h3>
              </div>
              {isListExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isListExpanded && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {keypoints.length === 0 && <div className="text-center py-10 opacity-30 text-xs italic">Click image to add points</div>}
                {keypoints.map((kp) => (
                  <div key={kp.id} onClick={() => setActiveKp(kp.id)} className={`group rounded-lg border p-2.5 cursor-pointer transition-all ${theme.card} ${activeKp === kp.id ? 'ring-2 ring-indigo-500' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">{kp.name}</div>
                      <input
                        value={kp.name}
                        onChange={(e) => setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, name: e.target.value } : k))}
                        className="flex-1 text-sm bg-transparent focus:outline-none"
                      />
                      <button onClick={(e) => { e.stopPropagation(); setKeypoints(s => s.filter(x => x.id !== kp.id)); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-inherit">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase opacity-40"><Palette size={12} /> View Filters</div>
            <div className="grid grid-cols-3 gap-1.5">
              {["None", "Grayscale", "Invert"].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} className={`text-[10px] py-1.5 rounded font-bold transition-all ${activeFilter === f ? "bg-indigo-600 text-white shadow-md" : theme.buttonSecondary}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== CANVAS AREA ===== */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative">
          {!imageObj ? (
            <div onClick={handleOpenFolders} className="flex flex-col items-center justify-center w-full max-w-2xl h-96 border-2 border-dashed rounded-3xl cursor-pointer bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-300 dark:border-slate-700">
              <div className="p-6 bg-indigo-500/10 rounded-full mb-4 text-indigo-500"><ImagePlus size={48} /></div>
              <h3 className="text-2xl font-bold mb-1">PixelPoint Workspace</h3>
              <p className={theme.subText}>Select folders to start keypoint annotation</p>
            </div>
          ) : (
            <div className="shadow-2xl rounded-xl overflow-hidden border-4 border-white dark:border-slate-800">
              <Stage ref={stageRef} width={stageSize.w} height={stageSize.h} onMouseDown={handleStageClick} style={{ cursor: connectMode ? "alias" : "crosshair" }}>
                <Layer><KonvaImage ref={imageRef} image={imageObj} width={stageSize.w} height={stageSize.h} filters={getFilters()} /></Layer>
                <Layer>
                  {/* Lines */}
                  {connections.map((c, i) => {
                    const a = keypoints.find(k => k.id === c.from);
                    const b = keypoints.find(k => k.id === c.to);
                    if (!a || !b) return null;
                    return <Line key={i} points={[a.x, a.y, b.x, b.y]} stroke="#10b981" strokeWidth={3} />;
                  })}
                  {/* Points */}
                  {keypoints.map((kp) => (
                    <Group key={kp.id} x={kp.x} y={kp.y} draggable onDragMove={(e) => {
                      const { x, y } = e.target.position();
                      setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, x, y } : k));
                    }} onClick={(e) => handleKeypointClick(kp.id, e)}>
                      <Circle radius={kp.id === connectionSource ? 8 : 6} fill={kp.id === connectionSource ? "#22c55e" : "#6366f1"} stroke="white" strokeWidth={2} />
                      <Label y={-25} x={10}>
                        <Tag fill="#1e293b" pointerDirection="left" pointerWidth={6} pointerHeight={6} cornerRadius={4} />
                        <Text text={kp.name} fill="white" padding={5} fontSize={11} fontStyle="bold" />
                      </Label>
                    </Group>
                  ))}
                </Layer>
              </Stage>
            </div>
          )}
          <Snackbar show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </main>
      </div>
    </div>
  );
}