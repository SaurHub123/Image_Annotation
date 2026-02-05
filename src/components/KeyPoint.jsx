import React, { useRef, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Circle,
  Text,
  Group,
  Label,
  Tag,
} from "react-konva";
import {
  Download,
  Upload,
  Link as LinkIcon,
  Trash2,
  Sun,
  Moon,
  Crosshair,
  ImagePlus, // Changed icon for better context
  X,
  Palette,
  Layers,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelRightClose
} from "lucide-react";
import Konva from "konva";
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

const downloadText = (text, name) => {
  const a = document.createElement("A");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = name;
  a.click();
};

/* ================= COMPONENT ================= */
export default function KeypointAnnotator() {
  const stageRef = useRef(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App State
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });
  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectMode, setConnectMode] = useState(false);
  const [activeKp, setActiveKp] = useState(null);

  // Skeleton & Filter State
  const [skeletons, setSkeletons] = useState([]);
  const [activeFilter, setActiveFilter] = useState("None");
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const imageRef = useRef(null);

  // Connection State
  const [connectionSource, setConnectionSource] = useState(null);
  const [connectionTarget, setConnectionTarget] = useState(null);

  /* ================= EFFECTS ================= */
  React.useEffect(() => {
    setSkeletons(loadSkeletons());
  }, []);

  React.useEffect(() => {
    if (imageObj && imageRef.current) {
      imageRef.current.cache();
    }
  }, [imageObj, activeFilter, stageSize]);

  /* ================= UPLOAD ================= */
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(900 / img.width, 1);
      setStageSize({
        w: Math.round(img.width * scale),
        h: Math.round(img.height * scale),
      });
      setImageObj(img);
      setFileName(file.name);
      // Reset state on new image
      setKeypoints([]);
      setConnections([]);
      setConnectionSource(null);
      setConnectionTarget(null);
    };
    img.src = URL.createObjectURL(file);
  };

  /* ================= ADD KEYPOINT ================= */
  const addKeypoint = (x, y) => {
    setKeypoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x,
        y,
        name: toAlphabetic(prev.length),
        visibility: 2,
      },
    ]);
  };

  const handleStageClick = (e) => {
    if (!imageObj) return;
    const stage = e.target.getStage();
    if (e.target !== stage && e.target.className !== "Image") return;
    const pos = stage.getPointerPosition();
    addKeypoint(pos.x, pos.y);
  };

  /* ================= DRAG ================= */
  const handleDrag = (id, e) => {
    const { x, y } = e.target.position();
    setKeypoints((prev) =>
      prev.map((k) => (k.id === id ? { ...k, x, y } : k))
    );
  };

  /* ================= CONNECTION LOGIC ================= */
  const handleKeypointClick = (id, e) => {
    e.cancelBubble = true;

    if (!connectMode) {
      setActiveKp(id);
      return;
    }

    if (!connectionSource) {
      setConnectionSource(id);
      setActiveKp(id);
      return;
    }

    if (connectionSource === id) return; // Prevent self-connection

    setConnectionTarget(id);

    setConnections((prev) => {
      const exists = prev.some(
        (c) =>
          (c.from === connectionSource && c.to === id) ||
          (c.from === id && c.to === connectionSource)
      );
      if (exists) return prev;
      return [...prev, { from: connectionSource, to: id }];
    });

    // Reset after connection
    setConnectionSource(null);
    setConnectionTarget(null);
    setActiveKp(null);
  };

  /* ================= DELETE ================= */
  const deleteKeypoint = (id) => {
    setKeypoints((prev) => prev.filter((k) => k.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (connectionSource === id) setConnectionSource(null);
    if (connectionTarget === id) setConnectionTarget(null);
  };

  /* ================= SKELETONS ================= */
  const applySkeleton = (sk) => {
    // scale 0-1 coords to stageSize
    const newKpMap = new Map();
    const newKeypoints = sk.keypoints.map((kp) => {
      const newId = crypto.randomUUID();
      newKpMap.set(kp.id, newId);
      return {
        id: newId,
        x: kp.x * stageSize.w,
        y: kp.y * stageSize.h,
        name: kp.name,
        visibility: 2,
      };
    });

    const newConnections = sk.connections.map((c) => ({
      from: newKpMap.get(c.from),
      to: newKpMap.get(c.to),
    }));

    setKeypoints((prev) => [...prev, ...newKeypoints]);
    setConnections((prev) => [...prev, ...newConnections]);
  };

  /* ================= FILTERS ================= */
  const getFilters = () => {
    switch (activeFilter) {
      case "Grayscale":
        return [Konva.Filters.Grayscale];
      case "Invert":
        return [Konva.Filters.Invert];
      case "Contrast":
        return [Konva.Filters.Brighten]; // Using Brighten as simple proxy or Contrast
      case "Sepia":
        return [Konva.Filters.Sepia];
      default:
        return [];
    }
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!keypoints.length) return;

    const ordered = [...keypoints].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const xs = ordered.map((k) => k.x);
    const ys = ordered.map((k) => k.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const nx = (v) => (v / stageSize.w).toFixed(6);
    const ny = (v) => (v / stageSize.h).toFixed(6);

    const parts = ["0", nx(cx), ny(cy), nx(maxX - minX), ny(maxY - minY)];
    ordered.forEach((k) => parts.push(nx(k.x), ny(k.y), k.visibility));

    downloadText(parts.join(" "), fileName.replace(/\..+$/, "") + ".txt");
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
    uploadBox: isDarkMode
      ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500"
      : "border-slate-300 bg-slate-100 hover:bg-white hover:border-indigo-500",
  };

  /* ================= RENDER ================= */
  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>

        {/* Header */}
        <div className="p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-indigo-500" />
            <h1 className="font-bold text-xl tracking-tight">PixelPoint</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3 border-b border-inherit">
          <label className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
            <Upload size={18} />
            Upload Image
            <input hidden type="file" accept="image/*" onChange={handleUpload} />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setConnectMode(!connectMode)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${connectMode
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900"
                : theme.buttonSecondary
                }`}
            >
              <LinkIcon size={16} />
              {connectMode ? "Linking..." : "Link Mode"}
            </button>
            <button
              onClick={handleSave}
              disabled={!keypoints.length}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${!keypoints.length ? "opacity-50 cursor-not-allowed " + theme.buttonSecondary : "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
                }`}
            >
              <Download size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-4 border-b border-inherit">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-50">
            <Palette size={12} />
            <span>Filters</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["None", "Grayscale", "Invert"].map(f => ( // Added Sepia later if needed
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs py-1.5 rounded border transition-all ${activeFilter === f
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : theme.buttonSecondary
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Keypoints List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>
              Keypoints ({keypoints.length})
            </h3>
            {keypoints.length > 0 && (
              <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => { setKeypoints([]); setConnections([]) }}>Clear All</span>
            )}
          </div>

          {!keypoints.length && (
            <div className={`text-center py-10 ${theme.subText} text-sm`}>
              No keypoints added yet.<br />Click on the image to start.
            </div>
          )}

          {keypoints.map((kp) => {
            const linked = connections
              .filter((c) => c.from === kp.id || c.to === kp.id)
              .map((c) =>
                c.from === kp.id
                  ? keypoints.find((k) => k.id === c.to)?.name
                  : keypoints.find((k) => k.id === c.from)?.name
              );

            const isFocus = activeKp === kp.id;

            return (
              <div
                key={kp.id}
                className={`group relative rounded-lg border p-3 transition-all ${theme.card} ${isFocus ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                    {/* {kp.name} */}
                    {kp.name?.charAt(0).toUpperCase()}
                  </div>
                  <input
                    value={kp.name}
                    onChange={(e) =>
                      setKeypoints((prev) =>
                        prev.map((k) =>
                          k.id === kp.id ? { ...k, name: e.target.value } : k
                        )
                      )
                    }
                    className={`flex-1 text-sm font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.input}`}
                  />
                  <button
                    onClick={() => deleteKeypoint(kp.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                    title="Delete Point"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <LinkIcon size={10} />
                    <span className="truncate max-w-[120px]">
                      {linked.length ? linked.join(", ") : "No links"}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveKp(kp.id)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${isFocus ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'}`}
                  >
                    {/*isFocus ? 'FOCUSED' : 'FOCUS'*/}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ===== CANVAS AREA ===== */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative">
        {!imageObj ? (
          // CHANGED: Use Label instead of Div to make it clickable
          <label
            className={`flex flex-col items-center justify-center w-full max-w-2xl h-96 border-2 border-dashed rounded-xl cursor-pointer transition-all ${theme.uploadBox}`}
          >
            <div className="bg-slate-200 dark:bg-slate-700 p-5 rounded-full mb-4">
              <ImagePlus className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Click to Upload Image</h3>
            <p className={theme.subText}>Or drag and drop a file here</p>
            {/* Added Hidden Input */}
            <input hidden type="file" accept="image/*" onChange={handleUpload} />
          </label>
        ) : (
          <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-500/20">
            <Stage
              ref={stageRef}
              width={stageSize.w}
              height={stageSize.h}
              onMouseDown={handleStageClick}
              style={{ cursor: connectMode ? "alias" : "crosshair" }}
            >
              <Layer>
                <KonvaImage
                  ref={imageRef}
                  image={imageObj}
                  width={stageSize.w}
                  height={stageSize.h}
                  filters={getFilters()}
                  brightness={activeFilter === "Contrast" ? 0.2 : 0} // Example if using Brighten for contrast/brightness
                />
              </Layer>

              <Layer>
                {/* CONNECTIONS */}
                {connections.map((c, i) => {
                  const a = keypoints.find((k) => k.id === c.from);
                  const b = keypoints.find((k) => k.id === c.to);
                  if (!a || !b) return null;
                  return (
                    <Line
                      key={i}
                      points={[a.x, a.y, b.x, b.y]}
                      stroke="#10b981" // Emerald-500
                      strokeWidth={3}
                      shadowColor="black"
                      shadowBlur={2}
                      shadowOpacity={0.3}
                    />
                  );
                })}

                {/* KEYPOINTS */}
                {keypoints.map((kp) => (
                  <Group
                    key={kp.id}
                    x={kp.x}
                    y={kp.y}
                    draggable
                    onDragMove={(e) => handleDrag(kp.id, e)}
                    onClick={(e) => handleKeypointClick(kp.id, e)}
                    dragBoundFunc={(pos) => ({
                      x: Math.max(0, Math.min(stageSize.w, pos.x)),
                      y: Math.max(0, Math.min(stageSize.h, pos.y)),
                    })}
                  >
                    {/* The Dot */}
                    <Circle
                      radius={kp.id === connectionSource ? 8 : 6}
                      fill={kp.id === connectionSource ? "#22c55e" : "#6366f1"} // Green if source, else Indigo
                      stroke="white"
                      strokeWidth={2}
                      shadowColor="black"
                      shadowBlur={4}
                      shadowOpacity={0.5}
                    />

                    {/* The Label (Fixed for visibility) */}
                    <Label x={10} y={-24} opacity={0.9}>
                      <Tag
                        fill="#1e293b" // Slate-800 background
                        cornerRadius={4}
                        pointerDirection="left"
                        pointerWidth={6}
                        pointerHeight={6}
                        lineJoin="round"
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOpacity={0.3}
                      />
                      <Text
                        text={kp.name}
                        fontFamily="sans-serif"
                        fontSize={12}
                        padding={6}
                        fill="white"
                        fontStyle="bold"
                      />
                    </Label>
                  </Group>
                ))}
              </Layer>
            </Stage>
          </div>
        )}
      </main>

      {/* ===== RIGHT SIDEBAR: SAVED TEMPLATES ===== */}
      <div className="relative flex h-full">
        <button
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className={`absolute top-1/2 -left-3 transform -translate-y-1/2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md text-slate-500 hover:text-indigo-500 transition-colors ${showRightSidebar ? '' : 'rotate-180'}`}
        >
          <ChevronRight size={14} />
        </button>

        <aside
          className={`flex-shrink-0 border-l flex flex-col shadow-xl z-10 transition-all duration-300 overflow-hidden ${theme.sidebar}`}
          style={{ width: showRightSidebar ? '18rem' : '0px', opacity: showRightSidebar ? 1 : 0 }}
        >
          <div className="p-5 border-b border-inherit">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>Saved templates</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-w-[18rem]">
            {skeletons.length === 0 ? (
              <div className={`text-xs opacity-50 italic text-center py-10 ${theme.subText}`}>No saved skeletons</div>
            ) : (
              <div className="space-y-2">
                {skeletons.map(sk => (
                  <button
                    key={sk.id}
                    onClick={() => applySkeleton(sk)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all hover:border-indigo-400 group ${theme.card}`}
                  >
                    <div>
                      <span className="font-semibold text-sm block">{sk.name}</span>
                      <span className={`text-[10px] ${theme.subText}`}>{sk.keypoints.length} nodes</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-indigo-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
