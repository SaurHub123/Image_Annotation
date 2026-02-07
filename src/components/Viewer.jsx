import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Text as KonvaText } from "react-konva";
import {
  Image as ImageIcon,
  FileText,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

/* -------------------- Utils -------------------- */

const MAX_W = 1400;
const MAX_H = 800;

function fitWithin(w, h, maxW = MAX_W, maxH = MAX_H) {
  const r = Math.min(maxW / w, maxH / h, 1);
  return { w: Math.round(w * r), h: Math.round(h * r) };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const palette = [
  "#2563eb", "#16a34a", "#ef4444", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#dc2626", "#10b981", "#eab308", "#f97316",
];

/* -------------------- Component -------------------- */

export default function AnnotationViewer() {
  const stageRef = useRef(null);

  const [bgImage, setBgImage] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 1024, h: 640 });

  const [lines, setLines] = useState([]);
  const [rects, setRects] = useState([]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showBoxes, setShowBoxes] = useState(true);

  useEffect(() => {
    document.title = "PixelSuite • Annotation Viewer";
  }, []);

  const wrapperStyle = useMemo(() => ({ width: stageSize.w }), [stageSize.w]);

  /* -------------------- Handlers -------------------- */

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = await loadImage(url);

    const fitted = fitWithin(img.width, img.height);

    setBgImage(img);
    setImageFileName(file.name);
    setStageSize({ w: fitted.w, h: fitted.h });
    setLines([]);
    setRects([]);
    e.target.value = "";
  };

  const parseYOLOSegmentation = (text) => {
    const newLines = [];
    const newRects = [];

    const imgW = stageSize.w;
    const imgH = stageSize.h;

    text
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .forEach((row) => {
        const nums = row.split(/\s+/).map(Number);
        if (nums.length < 7) return;

        const classId = nums[0];
        const coords = nums.slice(1);
        const color = palette[Math.abs(classId) % palette.length];
        const label = `class_${classId}`;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const points = [];

        for (let i = 0; i < coords.length; i += 2) {
          const x = coords[i] * imgW;
          const y = coords[i + 1] * imgH;

          points.push(x, y);

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }

        newLines.push({ points, color, label });
        newRects.push({
          x: minX,
          y: minY,
          w: maxX - minX,
          h: maxY - minY,
          color,
          label
        });
      });

    setLines(newLines);
    setRects(newRects);
  };

  const handleUploadYOLO = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      parseYOLOSegmentation(text);
    } catch {
      alert("Invalid YOLO segmentation file.");
    } finally {
      e.target.value = "";
    }
  };

  const clearAll = () => {
    setLines([]);
    setRects([]);
  };

  const bgStyle = {
    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Header */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">PixelSuite</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Viewer Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Controls */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border">
            <select
              className="bg-transparent text-xs font-semibold outline-none"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            >
              <option value={2}>2px</option>
              <option value={3}>3px</option>
              <option value={4}>4px</option>
              <option value={6}>6px</option>
            </select>

            <button
              onClick={() => setShowBoxes(v => !v)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white shadow-sm"
            >
              {showBoxes ? <Eye size={14} /> : <EyeOff size={14} />}
              {showBoxes ? "Boxes On" : "Boxes Off"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">

            <label className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border rounded-md cursor-pointer">
              <input type="file" accept="image/*" hidden onChange={handleUploadImage} />
              <ImageIcon size={14} />
              {imageFileName ? "Change Image" : "Upload Image"}
            </label>

            <label className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border rounded-md cursor-pointer">
              <input type="file" accept=".txt" hidden onChange={handleUploadYOLO} />
              <FileText size={14} />
              Load YOLO
            </label>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md"
            >
              <Trash2 size={14} />
              Clear
            </button>

          </div>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 flex items-center justify-center p-8" style={bgStyle}>
        <div style={wrapperStyle} className="bg-white shadow-xl rounded-sm ring-1 ring-black/5">
          <Stage ref={stageRef} width={stageSize.w} height={stageSize.h}>

            <Layer listening={false}>
              {bgImage
                ? <KonvaImage image={bgImage} width={stageSize.w} height={stageSize.h} />
                : <Rect width={stageSize.w} height={stageSize.h} fill="#f8fafc" />}
            </Layer>

            {showBoxes && (
              <Layer listening={false}>
                {rects.map((r, i) => (
                  <React.Fragment key={i}>
                    <Rect {...r} stroke={r.color} strokeWidth={2} />
                    <KonvaText
                      x={r.x + 4}
                      y={r.y + 4}
                      text={r.label}
                      fontSize={12}
                      fill="white"
                      padding={4}
                      fontStyle="bold"
                      shadowColor="black"
                      shadowBlur={2}
                      shadowOpacity={0.6}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            )}

            <Layer listening={false}>
              {lines.map((l, i) => (
                <Line
                  key={i}
                  points={l.points}
                  stroke={l.color}
                  strokeWidth={strokeWidth}
                  closed
                  fill={`${l.color}33`}
                  lineJoin="round"
                />
              ))}
            </Layer>

          </Stage>
        </div>
      </main>
    </div>
  );
}
