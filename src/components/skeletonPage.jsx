import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Circle, Line, Text, Group, Rect, Label, Tag } from "react-konva";
import { loadSkeletons, saveSkeletons } from "../utils/skeletonStorage";
import {
  Trash2,
  Save,
  Link as LinkIcon,
  Move,
  ChevronRight,
  Bone, // using Bone or similar for Skeleton icon
  Sun,
  Moon,
  Plus,
  RotateCcw,
  ChevronLeft
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
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  /* ===== LOAD STORAGE ===== */
  useEffect(() => {
    setSkeletons(loadSkeletons());
  }, []);

  /* ===== HELPERS ===== */
  const clamp = (v) => Math.max(0, Math.min(1, v));

  /* ===== CANVAS CLICK ===== */
  const handleStageClick = (e) => {
    // Only add point if not in connect mode and clicking on empty stage
    if (connectMode) return;
    // Check if clicked target is Stage or the background Rect
    const isBackground = e.target === e.target.getStage() || e.target.attrs.name === 'background';
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

    // Check availability
    const exists = connections.some(c =>
      (c.from === source && c.to === id) || (c.from === id && c.to === source)
    );

    if (!exists) {
      setConnections((prev) => [
        ...prev,
        { from: source, to: id },
      ]);
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
    // alert("Skeleton saved");
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
  };

  /* ===== DELETE KEYPOINT ===== */
  const deleteKeypoint = (id) => {
    setKeypoints(k => k.filter(p => p.id !== id));
    setConnections(c =>
      c.filter(x => x.from !== id && x.to !== id)
    );
  };

  /* ===== DELETE SKELETON ===== */
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
    itemHover: isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50",
    activeItem: isDarkMode ? "bg-indigo-900/50 border-indigo-500" : "bg-indigo-50 border-indigo-200",
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>

        {/* Header */}
        <div className="p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bone className="w-6 h-6 text-indigo-500" />
            <h1 className="font-bold text-xl tracking-tight">PixelSkeleton</h1>
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skeleton Name (e.g. Human)"
            className={`w-full text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme.input}`}
          />

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
              onClick={saveSkeleton}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20`}
            >
              <Save size={16} /> Save
            </button>
          </div>

          <button
            onClick={handleNew}
            className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded hover:bg-opacity-80 transition-all ${theme.subText} border border-dashed border-slate-400`}
          >
            <Plus size={12} /> New Skeleton
          </button>
        </div>

        {/* Keypoints List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar min-h-0 border-b border-inherit">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>Keypoints ({keypoints.length})</h3>
            {keypoints.length > 0 && (
              <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => { setKeypoints([]); setConnections([]); }}>Clear All</span>
            )}
          </div>

          {keypoints.length === 0 ? (
            <div className={`text-center py-6 ${theme.subText} text-xs italic`}>
              Click canvas to add nodes
            </div>
          ) : (
            <div className="space-y-2">
              {keypoints.map((kp) => (
                <div key={kp.id} className={`flex items-center gap-2 p-2 rounded border transition-all ${theme.card}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${source === kp.id ? 'bg-amber-400' : 'bg-indigo-500'}`}>
                    {kp.name?.charAt(0).toUpperCase()}
                  </div>
                  <input
                    value={kp.name}
                    onChange={(e) => setKeypoints(prev => prev.map(p => p.id === kp.id ? { ...p, name: e.target.value } : p))}
                    className={`flex-1 text-sm bg-transparent focus:outline-none font-medium ${theme.text}`}
                  />
                  <button onClick={() => deleteKeypoint(kp.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </aside>

      {/* ===== CANVAS AREA ===== */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-100/50 relative overflow-hidden">
        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
          {/* Background Grid */}
          <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}
            style={{
              backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

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
              <Rect width={SIZE} height={SIZE} fill="transparent" name="background" />

              {/* CONNECTIONS */}
              {connections.map((c, i) => {
                const a = keypoints.find(k => k.id === c.from);
                const b = keypoints.find(k => k.id === c.to);
                if (!a || !b) return null;
                return (
                  <Line
                    key={i}
                    points={[
                      a.x * SIZE, a.y * SIZE,
                      b.x * SIZE, b.y * SIZE
                    ]}
                    stroke={isDarkMode ? "#34d399" : "#059669"} // Emerald
                    strokeWidth={3}
                    lineCap="round"
                    opacity={0.8}
                  />
                );
              })}

              {/* NODES */}
              {keypoints.map((kp) => (
                <Group
                  key={kp.id}
                  x={kp.x * SIZE}
                  y={kp.y * SIZE}
                  draggable={!connectMode}
                  dragBoundFunc={(pos) => ({
                    x: Math.max(0, Math.min(SIZE, pos.x)),
                    y: Math.max(0, Math.min(SIZE, pos.y)),
                  })}
                  onDragMove={(e) => {
                    const p = e.target.position();
                    setKeypoints(prev =>
                      prev.map(k =>
                        k.id === kp.id
                          ? {
                            ...k,
                            x: clamp(p.x / SIZE),
                            y: clamp(p.y / SIZE),
                          }
                          : k
                      )
                    );
                  }}
                  onClick={(e) => handlePointClick(kp.id, e)}
                >
                  <Circle
                    radius={source === kp.id ? 9 : 6}
                    fill={source === kp.id ? "#fbbf24" : "#6366f1"}
                    stroke={isDarkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={2}
                    shadowBlur={4}
                    shadowColor="black"
                    shadowOpacity={0.3}
                  />
                  <Label y={-24} opacity={0.8}>
                    <Tag
                      fill={isDarkMode ? "#0f172a" : "#334155"}
                      cornerRadius={4}
                      pointerDirection="down"
                      pointerWidth={6}
                      pointerHeight={6}
                      shadowColor="black"
                    />
                    <Text
                      text={kp.name}
                      padding={5}
                      fill="white"
                      fontSize={11}
                      fontStyle="bold"
                    />
                  </Label>
                </Group>
              ))}

            </Layer>
          </Stage>
        </div>

        <div className={`mt-4 text-xs font-medium ${theme.subText}`}>
          Board Size: {SIZE}x{SIZE}px
        </div>
      </main>

      {/* ===== RIGHT SIDEBAR: SAVED TEMPLATES ===== */}
      <aside className={`w-72 flex-shrink-0 border-l flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>
        <div className="p-5 border-b border-inherit">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>Saved templates</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {skeletons.map(sk => (
            <div
              key={sk.id}
              onClick={() => loadSkeleton(sk)}
              className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${activeId === sk.id ? theme.activeItem : `${theme.card} ${theme.itemHover}`}`}
            >
              <div>
                <p className="font-semibold text-sm">{sk.name}</p>
                <p className={`text-[10px] ${theme.subText}`}>{sk.keypoints.length} nodes</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => deleteSkeleton(sk.id, e)} className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={12} />
                </button>
                {activeId !== sk.id && <ChevronRight size={14} className={theme.subText} />}
              </div>
            </div>
          ))}

          {skeletons.length === 0 && (
            <div className={`text-xs opacity-50 italic text-center py-10 ${theme.subText}`}>No saved skeletons</div>
          )}
        </div>
      </aside>

    </div>
  );
}