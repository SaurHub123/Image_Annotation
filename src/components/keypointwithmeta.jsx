import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect, Group, Text } from "react-konva";
import { Upload, Eye, FileJson, FileText, Image as ImageIcon, Box } from "lucide-react";

export default function YOLOVisualizer() {
  const [imageObj, setImageObj] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });
  const [annotation, setAnnotation] = useState(null);
  const [meta, setMeta] = useState(null);

  // Helper to handle all file types
  const handleFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(window.innerWidth * 0.7 / img.width, 1);
        setStageSize({ w: img.width * scale, h: img.height * scale });
        setImageObj(img);
      };
      img.src = URL.createObjectURL(file);
    } 
    
    else if (type === "yolo") {
      const text = await file.text();
      const parts = text.trim().split(/\s+/).map(Number);
      if (parts.length < 5) return;

      const kps = [];
      // YOLO keypoints start at index 5 and come in triplets (x, y, visibility)
      for (let i = 5; i < parts.length; i += 3) {
        kps.push({ x: parts[i], y: parts[i + 1], v: parts[i + 2] });
      }

      setAnnotation({
        bbox: { cx: parts[1], cy: parts[2], w: parts[3], h: parts[4] },
        kps: kps
      });
    } 
    
    else if (type === "meta") {
      const content = await file.text();
      setMeta(JSON.parse(content));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      {/* HEADER */}
      <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Eye className="text-emerald-500" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">YOLO <span className="text-emerald-500">Reviewer</span></h1>
        </div>

        <div className="flex gap-4">
          <UploadButton 
            icon={<ImageIcon size={16}/>} 
            label="1. Image" 
            color="bg-slate-800" 
            onChange={(e) => handleFile(e, "image")} 
          />
          <UploadButton 
            icon={<FileText size={16}/>} 
            label="2. YOLO .txt" 
            color="bg-slate-800" 
            onChange={(e) => handleFile(e, "yolo")} 
          />
          <UploadButton 
            icon={<FileJson size={16}/>} 
            label="3. Meta .json" 
            color="bg-indigo-600" 
            onChange={(e) => handleFile(e, "meta")} 
          />
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex items-center justify-center p-10 bg-[slate-900] overflow-auto">
        {!imageObj ? (
          <div className="text-center opacity-40">
            <Box size={64} className="mx-auto mb-4" />
            <p>Upload files to visualize annotation</p>
          </div>
        ) : (
          <div className="relative rounded-lg shadow-2xl border-2 border-slate-700 bg-black overflow-hidden">
            <Stage width={stageSize.w} height={stageSize.h}>
              <Layer>
                <KonvaImage image={imageObj} width={stageSize.w} height={stageSize.h} />
              </Layer>

              {annotation && (
                <Layer>
                  {/* BOUNDING BOX */}
                  <Rect
                    x={(annotation.bbox.cx * stageSize.w) - (annotation.bbox.w * stageSize.w / 2)}
                    y={(annotation.bbox.cy * stageSize.h) - (annotation.bbox.h * stageSize.h / 2)}
                    width={annotation.bbox.w * stageSize.w}
                    height={annotation.bbox.h * stageSize.h}
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dash={[8, 5]}
                  />

                  {/* SKELETON CONNECTIONS */}
                  {meta?.skeleton?.map((pair, idx) => {
                    const p1 = annotation.kps[pair[0]];
                    const p2 = annotation.kps[pair[1]];
                    
                    // Only draw if both points are marked as visible in YOLO (v > 0)
                    if (!p1 || !p2 || p1.v === 0 || p2.v === 0) return null;

                    return (
                      <Line
                        key={`line-${idx}`}
                        points={[
                          p1.x * stageSize.w, p1.y * stageSize.h, 
                          p2.x * stageSize.w, p2.y * stageSize.h
                        ]}
                        stroke="#10b981"
                        strokeWidth={3}
                        lineCap="round"
                        lineJoin="round"
                        opacity={0.8}
                      />
                    );
                  })}

                  {/* KEYPOINT CIRCLES */}
                  {annotation.kps.map((kp, i) => (
                    kp.v > 0 && (
                      <Group key={i} x={kp.x * stageSize.w} y={kp.y * stageSize.h}>
                        <Circle 
                          radius={5} 
                          fill="#6366f1" 
                          stroke="white" 
                          strokeWidth={2} 
                          shadowBlur={5}
                          shadowColor="black"
                        />
                        <Text 
                          text={meta?.names?.[i] || String.fromCharCode(65 + i)} 
                          y={-20} 
                          x={-10} 
                          fill="white" 
                          fontSize={11} 
                          fontStyle="bold" 
                          align="center"
                        />
                      </Group>
                    )
                  ))}
                </Layer>
              )}
            </Stage>
          </div>
        )}
      </main>

      {/* FOOTER INFO */}
      <footer className="h-10 bg-slate-950 border-t border-slate-800 px-8 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
        <div>Status: {annotation ? "Data Loaded" : "Waiting for files"}</div>
        <div>YOLOv8 Pose Format (Normalized)</div>
      </footer>
    </div>
  );
}

// Sub-component for clean buttons
function UploadButton({ icon, label, color, onChange }) {
  return (
    <label className={`flex items-center gap-2 ${color} hover:brightness-110 transition-all px-4 py-2 rounded-md cursor-pointer text-sm font-semibold shadow-md`}>
      {icon} {label}
      <input hidden type="file" onChange={onChange} />
    </label>
  );
}