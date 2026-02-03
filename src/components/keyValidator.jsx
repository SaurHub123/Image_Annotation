import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect, Group, Text, Label, Tag } from "react-konva";
import { Upload, Eye, FileText, Image as ImageIcon, RefreshCw } from "lucide-react";

export default function KeypointVisualizer() {
  const [imageObj, setImageObj] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });
  const [annotation, setAnnotation] = useState(null);
  const [fileName, setFileName] = useState("");

  /* ================= PARSE YOLO TEXT ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes("image")) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(900 / img.width, 1);
        setStageSize({ w: img.width * scale, h: img.height * scale });
        setImageObj(img);
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Parse YOLO .txt file
      const text = await file.text();
      const parts = text.trim().split(/\s+/).map(Number);
      
      if (parts.length < 5) return;

      // parts[0] = class index
      // parts[1,2,3,4] = bbox (cx, cy, w, h)
      // parts[5...] = keypoints (x, y, v)
      const bbox = { cx: parts[1], cy: parts[2], w: parts[3], h: parts[4] };
      const kps = [];
      for (let i = 5; i < parts.length; i += 3) {
        kps.push({ x: parts[i], y: parts[i + 1], v: parts[i + 2] });
      }
      setAnnotation({ bbox, kps });
      setFileName(file.name);
    }
  };

  /* ================= COORDINATE HELPERS ================= */
  // Convert normalized YOLO (0-1) to Stage Pixels
  const getBoxCoords = (bbox) => {
    const w = bbox.w * stageSize.w;
    const h = bbox.h * stageSize.h;
    const x = (bbox.cx * stageSize.w) - (w / 2);
    const y = (bbox.cy * stageSize.h) - (h / 2);
    return { x, y, w, h };
  };

  const box = annotation ? getBoxCoords(annotation.bbox) : null;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900 z-20">
        <div className="flex items-center gap-3">
          <Eye className="text-emerald-500" />
          <h1 className="text-xl font-bold tracking-tight">YOLOv8 Keypoint Inspector</h1>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-all border border-slate-700">
            <ImageIcon size={18} /> Upload Image
            <input hidden type="file" accept="image/*" onChange={handleFileUpload} />
          </label>
          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg cursor-pointer transition-all shadow-lg shadow-indigo-500/20">
            <FileText size={18} /> Upload .txt Result
            <input hidden type="file" accept=".txt" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-10 overflow-hidden">
        {!imageObj && (
          <div className="text-center opacity-50">
            <RefreshCw size={48} className="mx-auto mb-4 animate-spin-slow" />
            <p>Waiting for image and YOLO data...</p>
          </div>
        )}

        {imageObj && (
          <div className="shadow-2xl border-4 border-slate-800 rounded-lg overflow-hidden bg-black">
            <Stage width={stageSize.w} height={stageSize.h}>
              <Layer>
                <KonvaImage image={imageObj} width={stageSize.w} height={stageSize.h} opacity={0.8} />
              </Layer>

              {annotation && (
                <Layer>
                  {/* DRAW Bounding Box */}
                  <Rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                  
                  {/* LABEL FOR BBOX */}
                  <Text 
                    x={box.x} 
                    y={box.y - 20} 
                    text={`Object: 0 (${Math.round(box.w)}x${Math.round(box.h)})`} 
                    fill="#fbbf24" 
                    fontSize={14} 
                    fontStyle="bold" 
                  />

                  {/* DRAW KEYPOINTS */}
                  {annotation.kps.map((kp, i) => {
                    const px = kp.x * stageSize.w;
                    const py = kp.y * stageSize.h;
                    // Visibility: 0=none, 1=labeled but not visible, 2=labeled and visible
                    if (kp.v === 0) return null;

                    return (
                      <Group key={i}>
                        <Circle
                          x={px}
                          y={py}
                          radius={5}
                          fill={kp.v === 2 ? "#10b981" : "#f43f5e"}
                          stroke="white"
                          strokeWidth={1}
                        />
                        <Text
                          x={px + 8}
                          y={py - 8}
                          text={String.fromCharCode(65 + i)}
                          fill="white"
                          fontSize={10}
                          fontStyle="bold"
                        />
                      </Group>
                    );
                  })}
                </Layer>
              )}
            </Stage>
          </div>
        )}

        {/* INFO OVERLAY */}
        {annotation && (
          <div className="absolute bottom-10 left-10 bg-slate-800/90 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-2xl max-w-xs">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                <FileText size={14}/> {fileName}
            </h3>
            <div className="space-y-1 text-xs text-slate-300">
                <p>Keypoints Detected: <span className="text-white">{annotation.kps.length}</span></p>
                <p>BBox Center: <span className="text-white">{annotation.bbox.cx.toFixed(3)}, {annotation.bbox.cy.toFixed(3)}</span></p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

