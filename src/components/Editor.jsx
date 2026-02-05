import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group, Label, Tag, Text } from "react-konva";
import Konva from "konva";
import {
  Download,
  Upload,
  Link as LinkIcon,
  Trash2,
  Sun,
  Moon,
  Crosshair,
  ImagePlus,
  Palette,
  Undo,
  Pentagon,
  ChevronRight,
  Layers
} from "lucide-react";

/* ================= HELPERS (Preserved) ================= */
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

const downloadURI = (uri, name) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadJSON = (data, name) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  downloadURI(url, name);
};

/* ================= COMPONENT ================= */
export default function Editor() {
  const stageRef = useRef(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App State
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });
  const [shapes, setShapes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [activeShapeId, setActiveShapeId] = useState(null);

  // Filter State
  const [activeFilter, setActiveFilter] = useState("None");
  const imageRef = useRef(null);

  const isDrawing = currentPoints.length > 0;

  /* ================= EFFECTS ================= */
  useEffect(() => {
    document.title = "PixelPoly • Polygon Annotator";
  }, []);

  useEffect(() => {
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
      setShapes([]);
      setCurrentPoints([]);
    };
    img.src = URL.createObjectURL(file);
  };

  /* ================= DRAWING LOGIC (Preserved & Adapted) ================= */
  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  const handleStageClick = (e) => {
    if (!imageObj) return;

    // If clicking on a shape, select it (unless creating new point)
    // Here we prioritize drawing
    if (e.target.attrs.id === "closer") return;

    const stage = e.target.getStage();
    const { x, y } = getRelativePointerPosition(stage);
    setCurrentPoints((prev) => [...prev, x, y]);
  };

  const handleMouseMove = (e) => {
    if (!imageObj) return;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    setMousePos(pos);
  };

  const handleCloseShape = () => {
    if (currentPoints.length < 6) return;

    const startX = currentPoints[0];
    const startY = currentPoints[1];
    const closedPoints = [...currentPoints, startX, startY];

    const newShape = {
      id: Date.now(),
      name: `Poly ${shapes.length + 1}`, // Added name for list
      points: closedPoints,
      color: Konva.Util.getRandomColor()
    };

    setShapes([...shapes, newShape]);
    setCurrentPoints([]);
    setMousePos(null);
  };

  const handleUndo = () => {
    if (isDrawing) {
      setCurrentPoints((prev) => prev.slice(0, -2));
    } else {
      setShapes((prev) => prev.slice(0, -1));
    }
  };

  const deleteShape = (id) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    if (activeShapeId === id) setActiveShapeId(null);
  };

  /* ================= FILTERS ================= */
  const getFilters = () => {
    switch (activeFilter) {
      case "Grayscale": return [Konva.Filters.Grayscale];
      case "Invert": return [Konva.Filters.Invert];
      case "Contrast": return [Konva.Filters.Brighten];
      case "Sepia": return [Konva.Filters.Sepia];
      default: return [];
    }
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!imageObj) return;

    // COCO-like export structure preserved
    const categories = [{ id: 1, name: "object" }];
    const annotations = shapes.map((shape, index) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      for (let i = 0; i < shape.points.length; i += 2) {
        const x = shape.points[i];
        const y = shape.points[i + 1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      return {
        id: index + 1,
        image_id: 1,
        category_id: 1,
        segmentation: [shape.points],
        area: calculatePolygonArea(shape.points),
        bbox: [minX, minY, maxX - minX, maxY - minY],
        iscrowd: 0
      };
    });

    const cocoData = {
      info: { year: new Date().getFullYear(), version: "1.0", description: "Exported from PixelPoly" },
      licenses: [],
      images: [{ id: 1, width: stageSize.w, height: stageSize.h, file_name: fileName }],
      categories,
      annotations
    };

    const baseName = fileName.replace(/\.[^/.]+$/, "");
    downloadJSON(cocoData, `${baseName}_coco.json`);
    // Optional: download screenshot too like before?
    // const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    // downloadURI(dataURL, `${baseName}_annotated.png`);
  };

  /* ================= RENDER HELPERS ================= */
  const previewPoints = useMemo(() => {
    if (!mousePos || currentPoints.length === 0) return currentPoints;
    return [...currentPoints, mousePos.x, mousePos.y];
  }, [currentPoints, mousePos]);

  const isOverStart = useMemo(() => {
    if (currentPoints.length < 6 || !mousePos) return false;
    const startX = currentPoints[0];
    const startY = currentPoints[1];
    const dist = Math.hypot(mousePos.x - startX, mousePos.y - startY);
    return dist < 10;
  }, [currentPoints, mousePos]);


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

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>

        {/* Header */}
        <div className="p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pentagon className="w-6 h-6 text-indigo-500" />
            <h1 className="font-bold text-xl tracking-tight">PixelPoly</h1>
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
              onClick={handleUndo}
              disabled={!shapes.length && !isDrawing}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${theme.buttonSecondary} ${(!shapes.length && !isDrawing) && 'opacity-50 cursor-not-allowed'}`}
            >
              <Undo size={16} /> Undo
            </button>
            <button
              onClick={handleSave}
              disabled={!shapes.length}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${!shapes.length ? "opacity-50 cursor-not-allowed " + theme.buttonSecondary : "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
                }`}
            >
              <Download size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-4 border-b border-inherit pt-3">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-50">
            <Palette size={12} />
            <span>Filters</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["None", "Grayscale", "Invert"].map(f => (
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

        {/* Saved Shapes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>
              Polygons ({shapes.length})
            </h3>
            {shapes.length > 0 && (
              <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => setShapes([])}>Clear All</span>
            )}
          </div>

          {!shapes.length && (
            <div className={`text-center py-10 ${theme.subText} text-sm`}>
              Start clicking on the image<br />to draw a polygon.
            </div>
          )}

          {shapes.map((shape, i) => (
            <div
              key={shape.id}
              onClick={() => setActiveShapeId(shape.id)}
              className={`group relative rounded-lg border p-3 transition-all cursor-pointer ${theme.card} ${activeShapeId === shape.id ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: shape.color || '#6366f1' }} />

                <input
                  value={shape.name}
                  onChange={(e) =>
                    setShapes((prev) =>
                      prev.map((item) =>
                        item.id === shape.id ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                  onClick={(e) => e.stopPropagation()}
                  className={`flex-1 text-sm font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.input} bg-transparent`}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteShape(shape.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2 text-[10px] opacity-60 font-mono">
                Points: {shape.points.length / 2}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ===== CANVAS AREA ===== */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative">
        {!imageObj ? (
          <label
            className={`flex flex-col items-center justify-center w-full max-w-2xl h-96 border-2 border-dashed rounded-xl cursor-pointer transition-all ${theme.uploadBox}`}
          >
            <div className="bg-slate-200 dark:bg-slate-700 p-5 rounded-full mb-4">
              <ImagePlus className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Click to Upload Image</h3>
            <p className={theme.subText}>Or drag and drop a file here</p>
            <input hidden type="file" accept="image/*" onChange={handleUpload} />
          </label>
        ) : (
          <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-500/20">
            <Stage
              ref={stageRef}
              width={stageSize.w}
              height={stageSize.h}
              onMouseDown={handleStageClick}
              onMouseMove={handleMouseMove}
              className={isDrawing ? "cursor-crosshair" : "cursor-default"}
            >
              <Layer>
                <KonvaImage
                  ref={imageRef}
                  image={imageObj}
                  width={stageSize.w}
                  height={stageSize.h}
                  filters={getFilters()}
                  brightness={activeFilter === "Contrast" ? 0.2 : 0}
                />
              </Layer>

              <Layer>
                {shapes.map((shape) => (
                  <Group key={shape.id} onClick={(e) => { e.cancelBubble = true; setActiveShapeId(shape.id); }}>
                    <Line
                      points={shape.points}
                      closed={true}
                      stroke={shape.color || "#00FF00"}
                      strokeWidth={2}
                      fill={activeShapeId === shape.id ? (shape.color || "#00FF00") + "66" : (shape.color || "#00FF00") + "33"}
                    />
                    {/* Label for the shape */}
                    {shape.points.length > 0 && (
                      <Label
                        x={shape.points[0]}
                        y={shape.points[1] - 20}
                        opacity={0.9}
                      >
                        <Tag
                          fill="#1e293b"
                          pointerDirection="down"
                          pointerWidth={6}
                          pointerHeight={6}
                          lineJoin="round"
                        />
                        <Text
                          text={shape.name}
                          fontFamily="sans-serif"
                          fontSize={12}
                          padding={4}
                          fill="white"
                        />
                      </Label>
                    )}
                  </Group>
                ))}

                {isDrawing && (
                  <>
                    <Line
                      points={previewPoints}
                      stroke="#6366f1"
                      strokeWidth={2}
                      dash={[4, 4]}
                    />
                    {currentPoints.map((val, i) => {
                      if (i % 2 !== 0) return null;
                      const x = val;
                      const y = currentPoints[i + 1];
                      const isStart = i === 0;

                      return (
                        <Circle
                          key={i}
                          x={x}
                          y={y}
                          radius={isStart ? 6 : 3.5}
                          fill={isStart ? (isOverStart ? "#ef4444" : "#6366f1") : "#ffffff"}
                          stroke={isStart ? (isOverStart ? "#ffffff" : "#ffffff") : "#6366f1"}
                          strokeWidth={isStart ? 2 : 1.5}
                          id={isStart ? "closer" : undefined}
                          onClick={isStart ? handleCloseShape : undefined}
                          onMouseEnter={(e) => {
                            if (isStart) {
                              e.target.scale({ x: 1.3, y: 1.3 });
                              document.body.style.cursor = 'pointer';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isStart) {
                              e.target.scale({ x: 1, y: 1 });
                              document.body.style.cursor = 'crosshair';
                            }
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </Layer>
            </Stage>
          </div>
        )}
      </main>
    </div>
  );
}