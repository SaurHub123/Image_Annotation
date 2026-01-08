import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from "react-konva";

// --- UI Icons (Inline SVGs for zero-dependency) ---
const Icons = {
  Upload: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Undo: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  Save: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Image: () => <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

// ------------------ Helper: Shoelace Formula for Area ------------------
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

// ------------------ Helper: Download ------------------
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

export default function Annotator() {
  useEffect(() => {
    document.title = "Emplitech • COCO Annotator";
  }, []);

  const stageRef = useRef(null);

  // ------------------ State ------------------
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 1024, h: 640 });
  const [shapes, setShapes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);

  const isDrawing = currentPoints.length > 0;

  // ------------------ Upload ------------------
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxW = 1000;
      const ratio = Math.min(maxW / img.width, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      setImageObj(img);
      setStageSize({ w, h });
      setFileName(file.name);
      setShapes([]);
      setCurrentPoints([]);
    };
    img.src = url;
  };

  // ------------------ Interaction ------------------
  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  const handleStageClick = (e) => {
    if (e.target.attrs.id === "closer") return;

    const stage = e.target.getStage();
    const { x, y } = getRelativePointerPosition(stage);
    setCurrentPoints((prev) => [...prev, x, y]);
  };

  const handleMouseMove = (e) => {
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
      points: closedPoints,
      color: "#00FF00"
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

  // ------------------ Export ------------------
  const handleSave = () => {
    if (!imageObj) return;

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
      info: { year: new Date().getFullYear(), version: "1.0", description: "Exported from React" },
      licenses: [],
      images: [{ id: 1, width: stageSize.w, height: stageSize.h, file_name: fileName }],
      categories,
      annotations
    };

    const baseName = fileName.replace(/\.[^/.]+$/, "");
    downloadJSON(cocoData, `${baseName}_coco.json`);
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    downloadURI(dataURL, `${baseName}_annotated.png`);
  };

  // ------------------ Render Helpers ------------------
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

  // CSS for Dotted Background
  const bgStyle = {
    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- Top Navigation --- */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-wide">EMPLITECH</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Annotator Tool</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Action Toolbar */}
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 mr-2">
            <button 
              onClick={handleUndo} 
              disabled={!shapes.length && !isDrawing}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icons.Undo /> Undo
            </button>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all shadow-sm">
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
            <Icons.Upload />
            {fileName ? "Replace Image" : "Upload Image"}
          </label>

          <button
            onClick={handleSave}
            disabled={shapes.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Icons.Save /> Save Project
          </button>
        </div>
      </header>

      {/* --- Workspace --- */}
      <main className="flex-1 overflow-auto relative flex flex-col items-center justify-center p-8" style={bgStyle}>
        
        {/* Helper Badge */}
        {imageObj && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-4 py-1.5 rounded-full z-10">
             <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Click points to draw. Click the <span className="text-red-500 font-bold">red start node</span> to close.
             </p>
           </div>
        )}

        {/* Canvas Container */}
        <div className={`transition-all duration-500 ease-in-out ${imageObj ? 'scale-100 opacity-100' : 'scale-95 opacity-100'}`}>
          {!imageObj ? (
            <label className="group flex flex-col items-center justify-center w-[600px] h-[400px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50/50 cursor-pointer transition-all duration-300">
              <div className="p-4 rounded-full bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Icons.Image />
              </div>
              <p className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Click to Upload Image</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
              <input type="file" accept="image/*" hidden onChange={handleUpload} />
            </label>
          ) : (
            <div className="bg-white shadow-2xl rounded-sm ring-1 ring-slate-900/5">
              <Stage
                ref={stageRef}
                width={stageSize.w}
                height={stageSize.h}
                onMouseDown={handleStageClick}
                onMouseMove={handleMouseMove}
                className="cursor-crosshair"
              >
                <Layer>
                  <KonvaImage image={imageObj} width={stageSize.w} height={stageSize.h} />
                </Layer>

                <Layer>
                  {shapes.map((shape) => (
                    <Group key={shape.id}>
                      <Line
                        points={shape.points}
                        closed={true}
                        stroke="#00FF00"
                        strokeWidth={2}
                        fill="rgba(0, 255, 0, 0.2)"
                      />
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
        </div>
      </main>
    </div>
  );
}