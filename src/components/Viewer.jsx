import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Text as KonvaText } from "react-konva";

// --- Icons ---
const Icons = {
  UploadImg: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  UploadJson: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Eye: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
};

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

export default function AnnotationViewer() {
  useEffect(() => {
    document.title = "Emplitech • Annotation Viewer";
  }, []);

  const stageRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 1024, h: 640 });

  const [lines, setLines] = useState([]);
  const [rects, setRects] = useState([]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [categoryMap, setCategoryMap] = useState({});
  const [showBoxes, setShowBoxes] = useState(true);

  const wrapperStyle = useMemo(() => ({ width: stageSize.w }), [stageSize.w]);

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    setBgImage(img);
    setImageFileName(file.name);

    const fitted = fitWithin(img.width, img.height);
    setStageSize({ w: fitted.w, h: fitted.h });

    setLines([]);
    setRects([]);
  };

  // const parseCOCO = (coco) => {
  //   const newLines = [];
  //   const newRects = [];
  //   const cmap = {};
  //   if (Array.isArray(coco.categories)) {
  //     coco.categories.forEach((c) => {
  //       cmap[c.id] = c.name ?? `class_${c.id}`;
  //     });
  //   }

  //   if (Array.isArray(coco.images) && coco.images[0]) {
  //     const im = coco.images[0];
  //     if (Number.isFinite(im.width) && Number.isFinite(im.height)) {
  //       setStageSize({ w: im.width, h: im.height });
  //     }
  //   }

  //   const anns = Array.isArray(coco.annotations) ? coco.annotations : [];
  //   anns.forEach((a) => {
  //     const cat = a.category_id ?? 0;
  //     const color = palette[Math.abs(cat) % palette.length];
  //     const label = cmap[cat] ?? `class_${cat}`;

  //     if (Array.isArray(a.segmentation) && a.segmentation.length > 0) {
  //       const seg = a.segmentation[0];
  //       if (Array.isArray(seg) && seg.length >= 4) {
  //         newLines.push({ points: seg, color, strokeWidth, label });
  //       }
  //     }

  //     if (Array.isArray(a.bbox) && a.bbox.length === 4) {
  //       const [x, y, w, h] = a.bbox;
  //       newRects.push({ x, y, w, h, color, label });
  //     }
  //   });

  //   setCategoryMap(cmap);
  //   setLines(newLines);
  //   setRects(newRects);
  // };

  const parseYOLOSegmentation = (text) => {
  const newLines = [];
  const newRects = [];

  const imgW = stageSize.w;
  const imgH = stageSize.h;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  lines.forEach((line, idx) => {
    const parts = line.split(/\s+/).map(Number);
    if (parts.length < 3) return;

    const classId = parts[0];
    const coords = parts.slice(1);

    const color = palette[Math.abs(classId) % palette.length];
    const label = `class_${classId}`;

    const points = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i] * imgW;
      const y = coords[i + 1] * imgH;

      points.push(x, y);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    newLines.push({ points, color, strokeWidth, label });

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
  } catch (err) {
    alert("Invalid YOLOv8 segmentation file.");
    console.error(err);
  } finally {
    e.target.value = "";
  }
};


  // const handleUploadCOCO = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   try {
  //     const text = await file.text();
  //     const coco = JSON.parse(text);
  //     const cocoImage = Array.isArray(coco.images) && coco.images[0] ? coco.images[0] : null;
  //     const cocoFileName = cocoImage?.file_name || "";

  //     if (imageFileName) {
  //       if (cocoFileName) {
  //         if (cocoFileName !== imageFileName) {
  //           alert(`⚠ File name mismatch.\nUploaded: ${imageFileName}\nCOCO: ${cocoFileName}`);
  //         }
  //       }
  //     } else if (cocoFileName) {
  //       alert(`ℹ COCO expects image: ${cocoFileName}. You haven't uploaded an image yet.`);
  //     }

  //     parseCOCO(coco);
  //   } catch (err) {
  //     alert("Invalid COCO JSON.");
  //     console.error(err);
  //   } finally {
  //     e.target.value = "";
  //   }
  // };

  const clearAll = () => {
    setLines([]);
    setRects([]);
    // Optional: Keep image? For now clearing all data.
  };

  const bgStyle = {
    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* --- Header --- */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-wide">EMPLITECH</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Viewer Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Controls Group */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
             <div className="flex items-center px-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-2 tracking-wider">Stroke</span>
                <select
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                >
                  <option value={2}>2px</option>
                  <option value={3}>3px</option>
                  <option value={4}>4px</option>
                  <option value={6}>6px</option>
                </select>
             </div>
             <div className="w-px h-4 bg-slate-300 mx-1"></div>
             <button
               onClick={() => setShowBoxes((v) => !v)}
               className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${showBoxes ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {showBoxes ? <Icons.Eye /> : <Icons.EyeOff />}
               {showBoxes ? "Boxes On" : "Boxes Off"}
             </button>
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          {/* Data Actions */}
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all shadow-sm">
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
              <Icons.UploadImg />
              {imageFileName ? "Change Image" : "Upload Image"}
            </label>

            <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all shadow-sm">
              {/* <input type="file" accept="application/json" className="hidden" onChange={handleUploadCOCO} /> */}
              <input type="file" accept=".txt" onChange={handleUploadYOLO} />
              <Icons.Upload />
              Load Yolo
            </label>

            <button 
              onClick={clearAll} 
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
            >
              <Icons.Trash /> Clear
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 relative" style={bgStyle}>
        
        {/* Floating Info Pill */}
        {!bgImage && !lines.length && (
            <div className="mb-6 max-w-md text-center">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Ready to Inspect</h3>
                <p className="text-sm text-slate-500">Upload an image and a corresponding COCO JSON file to visualize annotations with parity checks.</p>
            </div>
        )}

        <div className={`transition-all duration-500 ease-in-out ${bgImage ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
             <div className="bg-white shadow-2xl rounded-sm ring-1 ring-slate-900/5 relative">
                {!bgImage && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-slate-300 text-sm font-medium">No Image Loaded</span>
                    </div>
                )}
                
                <Stage ref={stageRef} width={stageSize.w} height={stageSize.h}>
                  <Layer listening={false}>
                    {bgImage ? (
                      <KonvaImage image={bgImage} width={stageSize.w} height={stageSize.h} />
                    ) : (
                      <Rect x={0} y={0} width={stageSize.w} height={stageSize.h} fill="#f8fafc" />
                    )}
                  </Layer>

                  {showBoxes && (
                    <Layer listening={false}>
                      {rects.map((r, i) => (
                        <React.Fragment key={`rect-${i}`}>
                          <Rect x={r.x} y={r.y} width={r.w} height={r.h} stroke={r.color} strokeWidth={2} />
                          <KonvaText 
                            x={r.x + 4} 
                            y={r.y + 4} 
                            text={r.label ?? "bbox"} 
                            fontSize={12} 
                            fill="white" 
                            padding={4}
                            fontStyle="bold"
                            shadowColor="black"
                            shadowBlur={2}
                            shadowOpacity={0.5}
                          />
                        </React.Fragment>
                      ))}
                    </Layer>
                  )}

                  <Layer listening={false}>
                    {lines.map((l, i) => (
                      <Line
                        key={`line-${i}`}
                        points={l.points}
                        stroke={l.color}
                        strokeWidth={l.strokeWidth ?? strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                        closed={true}
                        fill={`${l.color}33`} // 20% opacity hex
                      />
                    ))}
                  </Layer>
                </Stage>
             </div>
        </div>
      </main>
    </div>
  );
}