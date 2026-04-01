import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group, Label, Tag, Text, Rect } from "react-konva";
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
  Zap,
  Hand // NEW
} from "lucide-react";
import { loadSkeletons } from "../utils/skeletonStorage";
import { useTour } from "../context/TourContext";
import SEO from "./SEO";

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
  const { startTour } = useTour();

  useEffect(() => {
    const tourCompleted = localStorage.getItem('tourCompleted_keypoint');
    if (!tourCompleted) {
      startTour('keypoint');
      localStorage.setItem('tourCompleted_keypoint', 'true');
    }
  }, [startTour]);

  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null); // Ref for measuring container

  // Theme & UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isSkeletonExpanded, setIsSkeletonExpanded] = useState(false);
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
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [labelLayouts, setLabelLayouts] = useState({});
  const [skeletons, setSkeletons] = useState([]);
  const [lockedSkeleton, setLockedSkeleton] = useState(null);
  const [currentAppliedSkeleton, setCurrentAppliedSkeleton] = useState(null);
  const [dataYamlCreated, setDataYamlCreated] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    document.title = "PosePoint • Keypoint Annotator";
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

  useEffect(() => {
    if (!keypoints.length) {
      setLabelLayouts({});
      return;
    }

    const occupiedBoxes = keypoints.map(kp => ({
      x: kp.x - 8, y: kp.y - 8, w: 16, h: 16
    }));

    const newLayouts = {};
    const angles = [
      -Math.PI / 2, // Top
      0,            // Right
      Math.PI,      // Left
      Math.PI / 2,  // Bottom
      -Math.PI / 4, // Top-Right
      -3 * Math.PI / 4, // Top-Left
      Math.PI / 4,  // Bottom-Right
      3 * Math.PI / 4   // Bottom-Left
    ];

    const checkOverlap = (rect) => {
      return occupiedBoxes.some(box => 
        rect.x < box.x + box.w &&
        rect.x + rect.w > box.x &&
        rect.y < box.y + box.h &&
        rect.y + rect.h > box.y
      );
    };

    keypoints.forEach(kp => {
      const w = Math.max(20, kp.name.length * 7 + 16);
      const h = 24;
      
      let placed = false;
      let finalDx = 0;
      let finalDy = 0;
      let candidateBox = null;

      outer: for (let d = 20; d <= 80; d += 15) {
        for (let angle of angles) {
          const dx = Math.cos(angle) * d;
          const dy = Math.sin(angle) * d;

          const rect = {
            x: kp.x + dx - w / 2,
            y: kp.y + dy - h / 2,
            w, h
          };

          if (!checkOverlap(rect)) {
            finalDx = dx;
            finalDy = dy;
            candidateBox = rect;
            placed = true;
            break outer;
          }
        }
      }

      if (!placed) {
        finalDx = 80;
        finalDy = -80;
        candidateBox = { x: kp.x + finalDx - w / 2, y: kp.y + finalDy - h / 2, w, h };
      }

      newLayouts[kp.id] = { dx: finalDx, dy: finalDy, w, h };
      occupiedBoxes.push(candidateBox);
    });

    setLabelLayouts(newLayouts);
  }, [keypoints]);

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
      let scale = 1;
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 40;
        const availableW = Math.max(100, clientWidth - padding);
        const availableH = Math.max(100, clientHeight - padding);
        scale = Math.min(availableW / img.width, availableH / img.height, 1);
      } else {
        scale = Math.min(900 / img.width, 1);
      }
      setStageSize({ w: Math.round(img.width * scale), h: Math.round(img.height * scale) });
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
      setImageObj(img);
      setFileName(fileData.name);
      setKeypoints([]);
      setConnections([]);
      setConnectionSource(null);

      if (fileData.isAnnotated && outputDirHandle) {
        const baseName = fileData.name.replace(/\.[^/.]+$/, "");
        loadAnnotationFile(baseName, scale, Math.round(img.width * scale), Math.round(img.height * scale));
      } else if (lockedSkeleton) {
        setTimeout(() => {
          applySkeleton(lockedSkeleton);
        }, 100);
      }
    };
    img.src = fileData.url;
  };

  const loadAnnotationFile = async (baseName, scale, stageW, stageH) => {
    try {
      const fileHandle = await outputDirHandle.getFileHandle(`${baseName}.txt`);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const parts = text.trim().split(/\s+/);
      
      if (parts.length > 5) {
        const kps = [];
        let index = 0;
        for (let i = 5; i < parts.length; i += 3) {
          const xNorm = parseFloat(parts[i]);
          const yNorm = parseFloat(parts[i + 1]);
          const vis = parseInt(parts[i + 2], 10);
          
          if (!isNaN(xNorm) && !isNaN(yNorm)) {
            const defaultName = toAlphabetic(index);
            const skelNode = lockedSkeleton?.keypoints?.[index];
            kps.push({
              id: crypto.randomUUID(),
              originalId: skelNode ? skelNode.id : undefined,
              x: xNorm * stageW,
              y: yNorm * stageH,
              name: skelNode ? skelNode.name : defaultName,
              visibility: vis >= 0 ? vis : 2,
            });
            index++;
          }
        }
        setKeypoints(kps);
        
        if (lockedSkeleton && lockedSkeleton.keypoints.length === kps.length) {
          const newConnections = [];
          lockedSkeleton.connections.forEach(conn => {
            const fromNode = kps.find(k => k.originalId === conn.from);
            const toNode = kps.find(k => k.originalId === conn.to);
            if (fromNode && toNode) {
              newConnections.push({ from: fromNode.id, to: toNode.id });
            }
          });
          setConnections(newConnections);
          setCurrentAppliedSkeleton(lockedSkeleton);
        }
        showToast("Loaded existing annotations.", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading existing annotations", "error");
    }
  };

  /* ================= SKELETON LOGIC ================= */
  const applySkeleton = (skeleton) => {
    if (!imageObj) {
      showToast("Load an image first", "error");
      return;
    }

    // If a skeleton has been locked, prevent applying a different one
    if (lockedSkeleton && lockedSkeleton.id !== skeleton.id) {
      showToast(
        `You cannot apply a different skeleton because '${lockedSkeleton.name}' has already been applied to the previous image.`,
        "error"
      );
      return;
    }

    // SkeletonPage uses normalized coordinates (0-1). 
    // We map these to the current stage size.
    const newKeypoints = skeleton.keypoints.map((kp) => ({
      id: crypto.randomUUID(), // New internal ID for this session
      originalId: kp.id,       // Reference to map connections
      name: kp.name,
      x: kp.x * stageSize.w,   // Scale normalized X to Stage Width
      y: kp.y * stageSize.h,   // Scale normalized Y to Stage Height
      visibility: 2,
    }));

    // Map connections using the originalId reference
    const newConnections = [];
    skeleton.connections.forEach(conn => {
      const fromNode = newKeypoints.find(k => k.originalId === conn.from);
      const toNode = newKeypoints.find(k => k.originalId === conn.to);
      if (fromNode && toNode) {
        newConnections.push({ from: fromNode.id, to: toNode.id });
      }
    });

    setKeypoints(newKeypoints);
    setConnections(newConnections);
    setCurrentAppliedSkeleton(skeleton); // Remember which skeleton was applied
    showToast(`Applied skeleton: ${skeleton.name}`);
  };

  /* ================= DATA YAML CREATION ================= */
  const createDataYaml = async (keypointCount) => {
    if (!outputDirHandle) return;

    const yamlContent = `path: .
train: images
val: images
nc: 1
names:
  ${classCode}: ${className}
kpt_shape: [${keypointCount}, 3]`;

    try {
      const fileHandle = await outputDirHandle.getFileHandle("data.yaml", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(yamlContent);
      await writable.close();
      showToast("data.yaml created successfully");
    } catch (err) {
      console.error("Error creating data.yaml", err);
      showToast("Error creating data.yaml", "error");
    }
  };

  /* ================= ANNOTATION LOGIC ================= */
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 10) return;

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleStageClick = (e) => {
    if (!imageObj || connectMode || panMode) return;
    const stage = e.target.getStage();
    if (e.target !== stage && e.target.className !== "Image") return;

    // Prevent adding manual keypoints if a skeleton has been applied
    if (currentAppliedSkeleton) {
      showToast("Cannot add keypoints manually after applying a skeleton. Modify existing keypoints instead.", "error");
      return;
    }

    const pos = stage.getPointerPosition();
    const relativePos = {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
    
    setKeypoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x: relativePos.x,
        y: relativePos.y,
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

    if (connectionSource === id) {
      setConnectionSource(null);
      return;
    }

    setConnections((prev) => {
      const exists = prev.some(c => (c.from === connectionSource && c.to === id) || (c.from === id && c.to === connectionSource));
      if (exists) {
        return prev.filter(c => !((c.from === connectionSource && c.to === id) || (c.from === id && c.to === connectionSource)));
      }
      return [...prev, { from: connectionSource, to: id }];
    });
    setConnectionSource(null);
  };

  const handleSave = async () => {
    if (!imageObj || !keypoints.length || !outputDirHandle) return;

    try {
      if (!dataYamlCreated) {
        if (currentAppliedSkeleton && !lockedSkeleton) {
          setLockedSkeleton(currentAppliedSkeleton);
        }
        setShowClassModal(true);
        return;
      }

      await saveAnnotationFile();
    } catch (err) {
      console.error(err);
      showToast("Error saving file", "error");
    }
  };

  const saveAnnotationFile = async () => {
    if (!imageObj || !keypoints.length || !outputDirHandle) return;

    try {
      // 1. Sort keypoints alphabetically to ensure consistent index mapping
      const ordered = [...keypoints].sort((a, b) => a.name.localeCompare(b.name));
      
      // 2. Calculate Bounding Box for the YOLO format header
      const xs = ordered.map(k => k.x);
      const ys = ordered.map(k => k.y);

      const nx = (v) => (v / stageSize.w).toFixed(6);
      const ny = (v) => (v / stageSize.h).toFixed(6);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const w = maxX - minX;
      const h = maxY - minY;

      // 3. Construct the parts array [class, cx, cy, w, h]
      const parts = ["0", nx(cx), ny(cy), nx(w), ny(h)];

      // 4. Append [x, y, visibility] for every keypoint
      ordered.forEach((k) => {
        parts.push(nx(k.x));
        parts.push(ny(k.y));
        parts.push(k.visibility);
      });

      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const fileHandle = await outputDirHandle.getFileHandle(`${baseName}.txt`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(parts.join(" "));
      await writable.close();

      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, isAnnotated: true } : f));
      showToast(`Saved ${baseName}.txt with visibility flags`);
    } catch (err) {
      console.error(err);
      showToast("Error saving file", "error");
    }
  };

  const handleClassModalConfirm = async () => {
    if (!classCode.trim() || !className.trim()) {
      showToast("Please enter both class code and class name", "error");
      return;
    }

    setShowClassModal(false);
    if (!dataYamlCreated) {
      const kpCount = currentAppliedSkeleton ? currentAppliedSkeleton.keypoints.length : keypoints.length;
      await createDataYaml(kpCount);
      setDataYamlCreated(true);
    }
    await saveAnnotationFile();
  };


  const getFilters = () => {
    switch (activeFilter) {
      case "Grayscale": return [Konva.Filters.Grayscale];
      case "Invert": return [Konva.Filters.Invert];
      default: return [];
    }
  };

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

      {/* ===== TOP NAVIGATION ===== */}
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
            ) : <span className="text-xs italic opacity-30">Load folders to start</span>}
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
        <aside className={`tour-nodes-list w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 ${theme.sidebar}`}>
          <div className="p-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-5 h-5 text-indigo-500" />
              </Link>
              <Crosshair className="w-6 h-6 text-indigo-500" />
              <span className="text-sm font-medium text-slate-500">
                <h1 className="font-bold text-xl tracking-tight">PosePoint</h1>
              </span>
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
                <LinkIcon size={16} /> {connectMode ? "Linking" : "Link"}
              </button>
              <button onClick={() => setPanMode(!panMode)} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${panMode ? "bg-amber-500 text-white shadow-lg" : theme.buttonSecondary}`}>
                <Hand size={16} /> {panMode ? "Panning" : "Pan"}
              </button>
              <button onClick={handleSave} disabled={!keypoints.length} className={`col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${!keypoints.length ? "opacity-50 " + theme.buttonSecondary : "bg-sky-600 text-white shadow-lg"}`}>
                <Download size={16} /> Save
              </button>
            </div>
          </div>

          {/* SKELETON PRESETS */}
          <div className="border-b border-inherit">
            <div 
              onClick={() => setIsSkeletonExpanded(!isSkeletonExpanded)}
              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Skeleton Presets</h3>
              </div>
              {isSkeletonExpanded ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
            </div>
            
            {isSkeletonExpanded && (
              <div className="p-2 grid grid-cols-1 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                {skeletons.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => applySkeleton(s)}
                    className={`text-left px-3 py-2 rounded-md text-xs font-medium transition-all ${theme.buttonSecondary} border border-transparent hover:border-indigo-500/50 flex items-center justify-between group`}
                  >
                    {s.name}
                    <span className="opacity-40 text-[10px]">{s.keypoints.length} nodes</span>
                  </button>
                ))}
                {skeletons.length === 0 && <p className="text-[10px] text-center py-4 opacity-40 italic">Create skeletons in Editor first</p>}
              </div>
            )}
          </div>

          {/* KEYPOINT LIST */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div 
              onClick={() => setIsListExpanded(!isListExpanded)} 
              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
              } border-b border-inherit`}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-indigo-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Active Nodes <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">{keypoints.length}</span>
                </h3>
              </div>
              {isListExpanded ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
            </div>

            {isListExpanded && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {keypoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 opacity-20">
                    <Crosshair size={32} strokeWidth={1} />
                    <p className="text-[11px] mt-2 italic">Click canvas to add nodes</p>
                  </div>
                ) : (
                  keypoints.map((kp) => {
                    const isActive = activeKp === kp.id;
                    return (
                      <div 
                        key={kp.id} 
                        onClick={() => setActiveKp(kp.id)} 
                        className={`group relative flex flex-col gap-1.5 p-2 rounded-md border transition-all cursor-pointer ${
                          isActive 
                            ? "bg-indigo-500/5 border-indigo-500/50 ring-1 ring-indigo-500/20" 
                            : `${theme.card} border-transparent hover:border-slate-400/30`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                            isActive ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          }`}>
                            {kp.name[0].toUpperCase()}
                          </div>
                          
                          <input
                            value={kp.name}
                            spellCheck={false}
                            onChange={(e) => setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, name: e.target.value } : k))}
                            className="flex-1 text-xs font-medium bg-transparent focus:outline-none"
                            placeholder="Label..."
                          />

                          <select
                            value={kp.visibility}
                            onChange={(e) => setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, visibility: Number(e.target.value) } : k))}
                            className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded border-none bg-transparent cursor-pointer ${
                              kp.visibility === 2 ? "text-emerald-500" : kp.visibility === 1 ? "text-amber-500" : "text-slate-400"
                            }`}
                          >
                            <option value={2}>Visible</option>
                            <option value={1}>Occluded</option>
                            <option value={0}>Hidden</option>
                          </select>

                          <button 
                            onClick={(e) => { e.stopPropagation(); setKeypoints(s => s.filter(x => x.id !== kp.id)); }} 
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className={`flex items-center gap-3 text-[9px] font-mono opacity-40 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}>
                          <span>X: {Math.round(kp.x)}</span>
                          <span>Y: {Math.round(kp.y)}</span>
                        </div>
                        {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500 rounded-full" />}
                      </div>
                    );
                  })
                )}
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
        <main ref={containerRef} className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative bg-neutral-100/30 dark:bg-slate-900/10">
          {!imageObj ? (
            <div onClick={handleOpenFolders} className="flex flex-col items-center justify-center w-full max-w-2xl h-96 border-2 border-dashed rounded-3xl cursor-pointer bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-300 dark:border-slate-700">
              <div className="p-6 bg-indigo-500/10 rounded-full mb-4 text-indigo-500"><ImagePlus size={48} /></div>
              <h3 className="text-2xl font-bold mb-1">PosePoint Workspace</h3>
              <p className={theme.subText}>Select folders to start keypoint annotation</p>
            </div>
          ) : (
            <div className="tour-canvas shadow-2xl rounded-xl overflow-hidden border-4 border-white dark:border-slate-800">
              <Stage 
                ref={stageRef} 
                width={stageSize.w} 
                height={stageSize.h} 
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                onMouseDown={handleStageClick} 
                onWheel={handleWheel}
                draggable={panMode}
                onDragEnd={(e) => {
                  if (e.target === stageRef.current) {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                  }
                }}
                style={{ cursor: panMode ? "grab" : connectMode ? "alias" : "crosshair", touchAction: 'none' }}
              >
                <Layer><KonvaImage ref={imageRef} image={imageObj} width={stageSize.w} height={stageSize.h} filters={getFilters()} /></Layer>
                <Layer>
                  {/* Render Connections */}
                  {connections.map((c, i) => {
                    const a = keypoints.find(k => k.id === c.from);
                    const b = keypoints.find(k => k.id === c.to);
                    if (!a || !b) return null;
                    return <Line key={i} points={[a.x, a.y, b.x, b.y]} stroke="#10b981" strokeWidth={3} lineCap="round" opacity={0.8} />;
                  })}
                  {/* Render Keypoints */}
                  {keypoints.map((kp) => (
                    <Group key={kp.id} x={kp.x} y={kp.y} draggable onDragMove={(e) => {
                      const { x, y } = e.target.position();
                      setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, x, y } : k));
                    }} onClick={(e) => handleKeypointClick(kp.id, e)}>
                      <Circle radius={kp.id === connectionSource ? 8 : 6} fill={kp.id === connectionSource ? "#fbbf24" : "#6366f1"} stroke="white" strokeWidth={2} />
                      {labelLayouts[kp.id] && (
                        <Group>
                          <Line
                            points={[0, 0, labelLayouts[kp.id].dx, labelLayouts[kp.id].dy]}
                            stroke={kp.id === connectionSource || activeKp === kp.id ? "#ffffff" : "#cbd5e1"}
                            strokeWidth={1}
                            dash={[2, 2]}
                            opacity={0.8}
                          />
                          <Group x={labelLayouts[kp.id].dx - labelLayouts[kp.id].w / 2} y={labelLayouts[kp.id].dy - labelLayouts[kp.id].h / 2} opacity={kp.id === connectionSource || activeKp === kp.id ? 1 : 0.75}>
                            <Rect
                              width={labelLayouts[kp.id].w}
                              height={labelLayouts[kp.id].h}
                              fill="#1e293b"
                              cornerRadius={4}
                            />
                            <Text
                              text={kp.name}
                              fill="white"
                              width={labelLayouts[kp.id].w}
                              height={labelLayouts[kp.id].h}
                              align="center"
                              verticalAlign="middle"
                              fontSize={11}
                              fontStyle="bold"
                            />
                          </Group>
                        </Group>
                      )}
                    </Group>
                  ))}
                </Layer>
              </Stage>
            </div>
          )}
          <Snackbar show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

          {/* CLASS INFO MODAL */}
          {showClassModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className={`rounded-lg p-8 w-96 shadow-2xl ${theme.sidebar}`}>
                <h2 className="text-xl font-bold mb-4">Enter Class Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Class Code</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="e.g., 0"
                      className={`w-full px-4 py-2 rounded border ${theme.card} focus:ring-2 focus:ring-indigo-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class Name</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., buffalo"
                      className={`w-full px-4 py-2 rounded border ${theme.card} focus:ring-2 focus:ring-indigo-500 outline-none`}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowClassModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-500 hover:bg-slate-600 text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClassModalConfirm}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <SEO
        title="PosePoint • Keypoint Annotation"
        description="Precise keypoint annotation tool for pose estimation and feature tracking."
        keywords="keypoint, pose estimation, landmark detection, annotation tool"
      />
    </div>
  );
}