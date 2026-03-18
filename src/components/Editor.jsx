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
  Undo,
  Pentagon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers
} from "lucide-react";

import { useTour } from "../context/TourContext";
import SEO from "./SEO";

/* ================= HELPERS ================= */
const calculatePolygonArea = (vertices) => {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i += 2) {
    const x1 = vertices[i];
    const y1 = vertices[i + 1];
    const x2 = vertices[(i + 2) % n];
    const y2 = vertices[(i + 3) % n];
    area += (x1 * y2) - (x2 * y1);
  }
  return Math.abs(area / 2);
};

export default function Editor() {
  const stageRef = useRef(null);
  const imageRef = useRef(null);

  // Theme & UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isListExpanded, setIsListExpanded] = useState(true); // Sidebar Accordion
  const [isImageNavExpanded, setIsImageNavExpanded] = useState(false); // Header Accordion

  // Folder & File State
  const [inputDirHandle, setInputDirHandle] = useState(null);
  const [outputDirHandle, setOutputDirHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ===== STATE ===== */
  const { startTour } = useTour();

  useEffect(() => {
    const tourCompleted = localStorage.getItem('tourCompleted_editor');
    if (!tourCompleted) {
      startTour('editor');
      localStorage.setItem('tourCompleted_editor', 'true');
    }
  }, [startTour]);

  // Annotation State
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });
  const [shapes, setShapes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("None");

  const isDrawing = currentPoints.length > 0;

  useEffect(() => {
    document.title = "PosePoly • Folder Annotator";
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
    setLoading(true);
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
    setLoading(false);
  };

  const handleSelectImage = async (fileData) => {
    const file = await fileData.handle.getFile();
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(900 / img.width, 1);
      setStageSize({ w: Math.round(img.width * scale), h: Math.round(img.height * scale) });
      setImageObj(img);
      setFileName(fileData.name);
      setShapes([]);
      setCurrentPoints([]);
    };
    img.src = fileData.url;
  };

  /* ================= DRAWING & SAVING LOGIC ================= */
  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy().invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  const handleStageClick = (e) => {
    if (!imageObj || e.target.attrs.id === "closer") return;
    const { x, y } = getRelativePointerPosition(e.target.getStage());
    setCurrentPoints((prev) => [...prev, x, y]);
  };

  const handleMouseMove = (e) => {
    if (!imageObj) return;
    setMousePos(getRelativePointerPosition(e.target.getStage()));
  };

  const handleCloseShape = () => {
    if (currentPoints.length < 6) return;
    const closedPoints = [...currentPoints, currentPoints[0], currentPoints[1]];
    setShapes([...shapes, {
      id: Date.now(),
      name: `Poly ${shapes.length + 1}`,
      points: closedPoints,
      color: Konva.Util.getRandomColor()
    }]);
    setCurrentPoints([]);
    setMousePos(null);
  };

  const handleUndo = () => {
    isDrawing ? setCurrentPoints(p => p.slice(0, -2)) : setShapes(s => s.slice(0, -1));
  };

  const handleSave = async () => {
    if (!imageObj || !shapes.length || !outputDirHandle) return;

    const imgW = stageSize.w;
    const imgH = stageSize.h;
    const yoloLines = shapes.map((shape) => {
      const pts = shape.points.slice(0, -2);
      const normalized = [];
      for (let i = 0; i < pts.length; i += 2) {
        normalized.push((pts[i] / imgW).toFixed(6), (pts[i + 1] / imgH).toFixed(6));
      }
      return `0 ${normalized.join(" ")}`;
    }).join("\n");

    try {
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const outputFileName = `${baseName}.txt`;
      const fileHandle = await outputDirHandle.getFileHandle(outputFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(yoloLines);
      await writable.close();

      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, isAnnotated: true } : f));
      showToast(`Saved ${outputFileName}`);
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

  /* ================= UI CLASSES ================= */
  const theme = {
    bg: isDarkMode ? "bg-slate-900" : "bg-slate-50",
    sidebar: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    subText: isDarkMode ? "text-slate-400" : "text-slate-500",
    card: isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-200",
    buttonSecondary: isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800",
  };

  const previewPoints = useMemo(() => (!mousePos || currentPoints.length === 0) ? currentPoints : [...currentPoints, mousePos.x, mousePos.y], [currentPoints, mousePos]);
  const isOverStart = useMemo(() => (currentPoints.length >= 6 && mousePos) ? Math.hypot(mousePos.x - currentPoints[0], mousePos.y - currentPoints[1]) < 10 : false, [currentPoints, mousePos]);

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>

      {/* ===== TOP IMAGE LIST ACCORDION ===== */}
      <div className={`border-b transition-all duration-300 ${theme.sidebar} ${isImageNavExpanded ? 'py-6' : 'h-16'}`}>
        <div className="flex items-center justify-between px-8 h-full">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewIndex(Math.max(0, viewIndex - 1))}
              className={`p-1.5 rounded-full ${theme.buttonSecondary} disabled:opacity-20`}
              disabled={viewIndex === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIsImageNavExpanded(!isImageNavExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Images</span>
              {isImageNavExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="flex-1 flex justify-center px-4 overflow-hidden">
            {files.length > 0 ? (
              <div className={`flex items-center gap-4 transition-all duration-300 ${isImageNavExpanded ? 'flex-wrap justify-center' : 'flex-nowrap'}`}>
                {files.slice(viewIndex, viewIndex + 10).map((file) => (
                  <div
                    key={file.name}
                    onClick={() => handleSelectImage(file)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    {/* Default View: Name and Status Circle */}
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-all ${fileName === file.name ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-transparent hover:border-slate-300'
                      }`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${file.isAnnotated ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span className={`text-[11px] truncate max-w-[100px] ${fileName === file.name ? 'font-bold text-indigo-500' : 'font-medium opacity-70'}`}>
                        {file.name}
                      </span>
                    </div>

                    {/* Accordion View: Thumbnails */}
                    {isImageNavExpanded && (
                      <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${fileName === file.name ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700'
                        }`}>
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs italic opacity-30">Load folders to see images</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewIndex(Math.min(files.length - 10, viewIndex + 1))}
              className={`p-1.5 rounded-full ${theme.buttonSecondary} disabled:opacity-20`}
              disabled={files.length <= viewIndex + 10}
            >
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
        <aside className={`tour-toolbar w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 ${theme.sidebar}`}>
          <div className="p-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-5 h-5 text-indigo-500" />
              </Link>             
              <Pentagon className="w-6 h-6 text-indigo-500" />
              <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                <h1 className="font-bold text-xl tracking-tight">PosePoly</h1>
              </Link>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>

          <div className="p-4 space-y-3 border-b border-inherit">
            <button onClick={handleOpenFolders} className="tour-upload-btn flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-md">
              <FolderOpen size={18} /> Open Project Folder
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleUndo} disabled={!shapes.length && !isDrawing} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${theme.buttonSecondary} disabled:opacity-50`}>
                <Undo size={16} /> Undo
              </button>
              <button onClick={handleSave} disabled={!shapes.length} className={`tour-export-btn flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${!shapes.length ? "opacity-50 " + theme.buttonSecondary : "bg-sky-600 text-white shadow-lg"}`}>
                <Download size={16} /> Save
              </button>
            </div>
          </div>

          {/* SIDEBAR POLYGON ACCORDION */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div
              onClick={() => setIsListExpanded(!isListExpanded)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-inherit"
            >
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Polygons ({shapes.length})</h3>
              </div>
              {isListExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isListExpanded && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {shapes.length === 0 && <div className="text-center py-10 opacity-30 text-xs italic">No polygons drawn</div>}
                {shapes.map((shape) => (
                  <div key={shape.id} onClick={() => setActiveShapeId(shape.id)} className={`group rounded-lg border p-2.5 cursor-pointer transition-all ${theme.card} ${activeShapeId === shape.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'hover:border-slate-400'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: shape.color || '#6366f1' }} />
                      <input
                        value={shape.name}
                        onChange={(e) => setShapes(prev => prev.map(item => item.id === shape.id ? { ...item, name: e.target.value } : item))}
                        className="flex-1 text-sm bg-transparent focus:outline-none border-none p-0"
                      />
                      <button onClick={(e) => { e.stopPropagation(); setShapes(s => s.filter(x => x.id !== shape.id)); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-inherit">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase opacity-40"><Palette size={12} /> Filters</div>
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
              <h3 className="text-2xl font-bold mb-1">PosePoly Workspace</h3>
              <p className={theme.subText}>Select folders to start your project</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* <div className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-3 border shadow-sm ${
                files.find(f => f.name === fileName)?.isAnnotated 
                ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/30" 
                : "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30"
              }`}>
                {files.find(f => f.name === fileName)?.isAnnotated ? <><CheckCircle2 size={18}/> Saved</> : <><Clock size={18}/> Unsaved</>}
                <span className="opacity-20 font-light">|</span>
                <span className="opacity-90">{fileName}</span>
              </div> */}

              <div className="tour-canvas shadow-2xl rounded-xl overflow-hidden border-4 border-white dark:border-slate-800">
                <Stage ref={stageRef} width={stageSize.w} height={stageSize.h} onMouseDown={handleStageClick} onMouseMove={handleMouseMove} className={isDrawing ? "cursor-crosshair" : "cursor-default"}>
                  <Layer><KonvaImage ref={imageRef} image={imageObj} width={stageSize.w} height={stageSize.h} filters={getFilters()} /></Layer>
                  <Layer>
                    {shapes.map((shape) => (
                      <Group key={shape.id} onClick={(e) => { e.cancelBubble = true; setActiveShapeId(shape.id); }}>
                        <Line points={shape.points} closed stroke={shape.color || "#00FF00"} strokeWidth={2} fill={activeShapeId === shape.id ? (shape.color || "#00FF00") + "66" : (shape.color || "#00FF00") + "33"} />
                        <Label x={shape.points[0]} y={shape.points[1] - 20}><Tag fill="#1e293b" pointerDirection="down" /><Text text={shape.name} fill="white" padding={4} fontSize={11} /></Label>
                      </Group>
                    ))}
                    {isDrawing && (
                      <>
                        <Line points={previewPoints} stroke="#6366f1" strokeWidth={2} dash={[4, 4]} />
                        {currentPoints.map((val, i) => i % 2 === 0 && (
                          <Circle key={i} x={val} y={currentPoints[i + 1]} radius={i === 0 ? 6 : 3.5} fill={i === 0 && isOverStart ? "#ef4444" : "#ffffff"} stroke="#6366f1" id={i === 0 ? "closer" : undefined} onClick={i === 0 ? handleCloseShape : undefined} />
                        ))}
                      </>
                    )}
                  </Layer>
                </Stage>
              </div>
            </div>
          )}
          <Snackbar show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </main>
      </div>
      <SEO
        title="PosePoly • Polygon Annotation"
        description="Advanced polygon annotation tool for semantic segmentation. Support for complex shapes and YOLO export."
        keywords="polygon, segmentation, semantic segmentation, annotation tool"
      />
    </div>
  );
}