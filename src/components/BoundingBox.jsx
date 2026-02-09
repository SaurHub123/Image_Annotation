// import React, { useRef, useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import Snackbar from "../utils/snackbar";
// import {
//     Stage,
//     Layer,
//     Image as KonvaImage,
//     Rect,
//     Transformer,
//     Text,
//     Group,
//     Label,
//     Tag,
// } from "react-konva";
// import {
//     Download,
//     Upload,
//     Trash2,
//     Sun,
//     Moon,
//     Crosshair,
//     ImagePlus,
//     Palette,
//     Square,
//     Undo
// } from "lucide-react";
// import Konva from "konva";

// /* ================= COMPONENT ================= */
// export default function BoundingBoxAnnotator() {
//     const stageRef = useRef(null);
//     const transformerRef = useRef(null);

//     // Theme State
//     const [isDarkMode, setIsDarkMode] = useState(false);

//     // App State
//     const [imageObj, setImageObj] = useState(null);
//     const [fileName, setFileName] = useState("");
//     const [stageSize, setStageSize] = useState({ w: 900, h: 600 });

//     // Annotation State
//     const [rectangles, setRectangles] = useState([]);
//     const [selectedId, setSelectedId] = useState(null);
//     const [newRect, setNewRect] = useState(null); // {x, y, w, h}

//     // Filter State
//     const [activeFilter, setActiveFilter] = useState("None");
//     const imageRef = useRef(null);

//     const [toast, setToast] = useState({ show: false, message: "", type: "success" });

//     // Helper function to trigger it
//     const showToast = (message, type = "success") => {
//         setToast({ show: true, message, type });
//     };


//     /* ================= EFFECTS ================= */
//     useEffect(() => {
//         if (imageObj && imageRef.current) {
//             imageRef.current.cache();
//         }
//     }, [imageObj, activeFilter, stageSize]);

//     /* ================= UPLOAD ================= */
//     const handleUpload = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         const img = new Image();
//         img.onload = () => {
//             const scale = Math.min(900 / img.width, 1);
//             setStageSize({
//                 w: Math.round(img.width * scale),
//                 h: Math.round(img.height * scale),
//             });
//             setImageObj(img);
//             setFileName(file.name);
//             setRectangles([]);
//             setNewRect(null);
//             setSelectedId(null);
//         };
//         img.src = URL.createObjectURL(file);
//     };

//     /* ================= DRAWING LOGIC ================= */
//     const handleMouseDown = (e) => {
//         if (!imageObj) return;

//         // clicking on empty stage - remove selection
//         const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === "Image";
//         if (clickedOnEmpty) {
//             setSelectedId(null);
//         } else {
//             // clicked on a rectangle?
//             return;
//         }

//         // Start drawing
//         const { x, y } = e.target.getStage().getPointerPosition();
//         setNewRect({ x, y, w: 0, h: 0, id: crypto.randomUUID() });
//     };

//     const handleMouseMove = (e) => {
//         if (!newRect) return;

//         const { x, y } = e.target.getStage().getPointerPosition();
//         setNewRect(prev => ({
//             ...prev,
//             w: x - prev.x,
//             h: y - prev.y
//         }));
//     };

//     const handleMouseUp = () => {
//         if (!newRect) return;

//         // Minimum size check (5x5)
//         if (Math.abs(newRect.w) > 5 && Math.abs(newRect.h) > 5) {
//             setRectangles(prev => [...prev, {
//                 ...newRect,
//                 name: `Box ${prev.length + 1}`,
//                 color: Konva.Util.getRandomColor()
//             }]);
//         }
//         setNewRect(null);
//     };

//     /* ================= TRANSFORMER ================= */
//     useEffect(() => {
//         if (selectedId && transformerRef.current) {
//             // we need to attach transformer manually
//             const node = stageRef.current.findOne('#' + selectedId);
//             if (node) {
//                 transformerRef.current.nodes([node]);
//                 transformerRef.current.getLayer().batchDraw();
//             }
//         }
//     }, [selectedId, rectangles]);

//     /* ================= DELETE ================= */
//     const deleteRectangle = (id) => {
//         setRectangles((prev) => prev.filter((r) => r.id !== id));
//         if (selectedId === id) setSelectedId(null);
//     };

//     /* ================= SAVE ================= */
//     const handleSave = () => {
//         if (!rectangles.length || !imageObj) return;

//         const imgW = stageSize.w;
//         const imgH = stageSize.h;

//         const yoloLines = rectangles.map((r, idx) => {
//             const xCenter = (r.x + r.w / 2) / imgW;
//             const yCenter = (r.y + r.h / 2) / imgH;
//             const wNorm = r.w / imgW;
//             const hNorm = r.h / imgH;

//             const classId = 0; // TODO: replace with real class mapping

//             return [
//                 classId,
//                 xCenter.toFixed(6),
//                 yCenter.toFixed(6),
//                 wNorm.toFixed(6),
//                 hNorm.toFixed(6),
//             ].join(" ");
//         });

//         const blob = new Blob([yoloLines.join("\n")], { type: "text/plain" });
//         const a = document.createElement("a");
//         a.href = URL.createObjectURL(blob);
//         a.download = fileName.replace(/\.[^/.]+$/, "") + "_bbox.txt";
//         a.click();
//         showToast("Annotation saved successfully!", "success");
//     };

//     // const handleSave = () => {
//     //     if (!rectangles.length) return;

//     //     // Simple JSON export for now
//     //     const data = {
//     //         image: fileName,
//     //         boxes: rectangles.map(r => ({
//     //             label: r.name,
//     //             x: r.x,
//     //             y: r.y,
//     //             w: r.w,
//     //             h: r.h
//     //         }))
//     //     };

//     //     const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//     //     const a = document.createElement("a");
//     //     a.href = URL.createObjectURL(blob);
//     //     a.download = fileName.replace(/\.[^/.]+$/, "") + "_bbox.json";
//     //     a.click();
//     // };

//     /* ================= FILTERS ================= */
//     const getFilters = () => {
//         switch (activeFilter) {
//             case "Grayscale": return [Konva.Filters.Grayscale];
//             case "Invert": return [Konva.Filters.Invert];
//             case "Contrast": return [Konva.Filters.Brighten];
//             case "Sepia": return [Konva.Filters.Sepia];
//             default: return [];
//         }
//     };

//     /* ================= UI CLASSES ================= */
//     const theme = {
//         bg: isDarkMode ? "bg-slate-900" : "bg-slate-50",
//         sidebar: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
//         text: isDarkMode ? "text-slate-100" : "text-slate-800",
//         subText: isDarkMode ? "text-slate-400" : "text-slate-500",
//         card: isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-200",
//         input: isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-slate-50 border-slate-300 text-slate-900",
//         buttonSecondary: isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800",
//         uploadBox: isDarkMode
//             ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500"
//             : "border-slate-300 bg-slate-100 hover:bg-white hover:border-indigo-500",
//     };

//     return (
//         <div className={`flex h-screen w-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>

//             {/* ===== SIDEBAR ===== */}
//             <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.sidebar}`}>

//                 {/* Header */}
//                 <div className="p-5 border-b border-inherit flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <Square className="w-6 h-6 text-indigo-500" />
//                         <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
//                         <h1 className="font-bold text-xl tracking-tight">PixelBox</h1>
//                        </Link>
//                     </div>
//                     <button
//                         onClick={() => setIsDarkMode(!isDarkMode)}
//                         className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
//                     >
//                         {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
//                     </button>
//                 </div>

//                 {/* Controls */}
//                 <div className="p-4 space-y-3 border-b border-inherit">
//                     <label className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
//                         <Upload size={18} />
//                         Upload Image
//                         <input hidden type="file" accept="image/*" onChange={handleUpload} />
//                     </label>

//                     <div className="grid grid-cols-2 gap-2">
//                         <button
//                             onClick={() => {
//                                 setRectangles(prev => prev.slice(0, -1));
//                                 setSelectedId(null);
//                             }}
//                             disabled={!rectangles.length}
//                             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${theme.buttonSecondary} ${!rectangles.length && 'opacity-50 cursor-not-allowed'}`}
//                         >
//                             <Undo size={16} /> Undo
//                         </button>
//                         <button
//                             onClick={handleSave}
//                             disabled={!rectangles.length}
//                             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${!rectangles.length ? "opacity-50 cursor-not-allowed " + theme.buttonSecondary : "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
//                                 }`}
//                         >
//                             <Download size={16} />
//                             Save
//                         </button>
//                     </div>
//                 </div>

//                 {/* Filters */}
//                 <div className="px-4 pb-4 border-b border-inherit pt-3">
//                     <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-50">
//                         <Palette size={12} />
//                         <span>Filters</span>
//                     </div>
//                     <div className="grid grid-cols-3 gap-1.5">
//                         {["None", "Grayscale", "Invert"].map(f => (
//                             <button
//                                 key={f}
//                                 onClick={() => setActiveFilter(f)}
//                                 className={`text-xs py-1.5 rounded border transition-all ${activeFilter === f
//                                         ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
//                                         : theme.buttonSecondary
//                                     }`}
//                             >
//                                 {f}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* List */}
//                 <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
//                     <div className="flex items-center justify-between">
//                         <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>
//                             Boxes ({rectangles.length})
//                         </h3>
//                         {rectangles.length > 0 && (
//                             <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => setRectangles([])}>Clear All</span>
//                         )}
//                     </div>

//                     {!rectangles.length && (
//                         <div className={`text-center py-10 ${theme.subText} text-sm`}>
//                             Drag on the image to create<br />bounding boxes.
//                         </div>
//                     )}

//                     {rectangles.map((r, i) => (
//                         <div
//                             key={r.id}
//                             onClick={() => setSelectedId(r.id)}
//                             className={`group relative rounded-lg border p-3 transition-all cursor-pointer ${theme.card} ${selectedId === r.id ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
//                         >
//                             <div className="flex items-center gap-3">
//                                 <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color || '#6366f1' }} />
//                                 <input
//                                     value={r.name}
//                                     onChange={(e) =>
//                                         setRectangles((prev) =>
//                                             prev.map((item) =>
//                                                 item.id === r.id ? { ...item, name: e.target.value } : item
//                                             )
//                                         )
//                                     }
//                                     onClick={(e) => e.stopPropagation()}
//                                     className={`flex-1 text-sm font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.input} bg-transparent`}
//                                 />
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         deleteRectangle(r.id);
//                                     }}
//                                     className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
//                                 >
//                                     <Trash2 size={14} />
//                                 </button>
//                             </div>
//                             <div className="flex justify-between mt-2 text-[10px] opacity-60 font-mono">
//                                 <span>X: {Math.round(r.x)}</span>
//                                 <span>Y: {Math.round(r.y)}</span>
//                                 <span>W: {Math.round(r.w)}</span>
//                                 <span>H: {Math.round(r.h)}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </aside>

//             {/* ===== CANVAS AREA ===== */}
//             <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative">
//                 {!imageObj ? (
//                     <label
//                         className={`flex flex-col items-center justify-center w-full max-w-2xl h-96 border-2 border-dashed rounded-xl cursor-pointer transition-all ${theme.uploadBox}`}
//                     >
//                         <div className="bg-slate-200 dark:bg-slate-700 p-5 rounded-full mb-4">
//                             <ImagePlus className="w-10 h-10 text-indigo-500" />
//                         </div>
//                         <h3 className="text-xl font-bold mb-2">Click to Upload Image</h3>
//                         <p className={theme.subText}>Or drag and drop a file here</p>
//                         <input hidden type="file" accept="image/*" onChange={handleUpload} />
//                     </label>
//                 ) : (
//                     <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-500/20">
//                         <Stage
//                             ref={stageRef}
//                             width={stageSize.w}
//                             height={stageSize.h}
//                             onMouseDown={handleMouseDown}
//                             onMouseMove={handleMouseMove}
//                             onMouseUp={handleMouseUp}
//                             style={{ cursor: "crosshair" }}
//                         >
//                             <Layer>
//                                 <KonvaImage
//                                     ref={imageRef}
//                                     image={imageObj}
//                                     width={stageSize.w}
//                                     height={stageSize.h}
//                                     filters={getFilters()}
//                                     brightness={activeFilter === "Contrast" ? 0.2 : 0}
//                                 />
//                             </Layer>

//                             <Layer>
//                                 {rectangles.map((rect, i) => (
//                                     <Group
//                                         key={rect.id}
//                                         id={rect.id}
//                                         x={rect.x}
//                                         y={rect.y}
//                                         draggable
//                                         onClick={() => setSelectedId(rect.id)}
//                                         onDragStart={() => setSelectedId(rect.id)}
//                                         onDragEnd={(e) => {
//                                             const node = e.target;
//                                             setRectangles(prev => prev.map(r => r.id === rect.id ? { ...r, x: node.x(), y: node.y() } : r));
//                                         }}
//                                         onTransformEnd={(e) => {
//                                             const node = e.target;
//                                             const scaleX = node.scaleX();
//                                             const scaleY = node.scaleY();
//                                             node.scaleX(1);
//                                             node.scaleY(1);
//                                             setRectangles(prev => prev.map(r => r.id === rect.id ? {
//                                                 ...r,
//                                                 x: node.x(),
//                                                 y: node.y(),
//                                                 // set minimal value
//                                                 w: Math.max(5, node.width() * scaleX),
//                                                 h: Math.max(5, node.height() * scaleY),
//                                             } : r));
//                                         }}
//                                     >
//                                         <Rect
//                                             width={rect.w}
//                                             height={rect.h}
//                                             stroke={rect.color || '#00FF00'}
//                                             strokeWidth={2}
//                                             fill={selectedId === rect.id ? (rect.color || '#00FF00') + '33' : 'transparent'} // Add transparency
//                                         />
//                                         <Label
//                                             y={rect.h > 0 ? -20 : rect.h - 20}
//                                             opacity={0.9}
//                                         >
//                                             <Tag
//                                                 fill="#1e293b"
//                                                 pointerDirection="down"
//                                                 pointerWidth={6}
//                                                 pointerHeight={6}
//                                                 lineJoin="round"
//                                                 shadowColor="black"
//                                             />
//                                             <Text
//                                                 text={rect.name}
//                                                 fontFamily="sans-serif"
//                                                 fontSize={12}
//                                                 padding={4}
//                                                 fill="white"
//                                             />
//                                         </Label>
//                                     </Group>
//                                 ))}

//                                 {newRect && (
//                                     <Rect
//                                         x={newRect.x}
//                                         y={newRect.y}
//                                         width={newRect.w}
//                                         height={newRect.h}
//                                         stroke="#00FF00"
//                                         strokeWidth={2}
//                                     />
//                                 )}

//                                 <Transformer
//                                     ref={transformerRef}
//                                     boundBoxFunc={(oldBox, newBox) => {
//                                         // limit resize
//                                         if (newBox.width < 5 || newBox.height < 5) {
//                                             return oldBox;
//                                         }
//                                         return newBox;
//                                     }}
//                                 />
//                             </Layer>
//                         </Stage>
//                         <Snackbar 
//                             show={toast.show} 
//                             message={toast.message} 
//                             type={toast.type} 
//                             onClose={() => setToast({ ...toast, show: false })} 
//                           />
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// }



























import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Label, Tag, Text } from "react-konva";
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
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Upload
} from "lucide-react";

export default function BoundingBoxAnnotator() {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const imageRef = useRef(null);

  // Theme & UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isImageNavExpanded, setIsImageNavExpanded] = useState(false);

  // Folder & File State
  const [inputDirHandle, setInputDirHandle] = useState(null);
  const [outputDirHandle, setOutputDirHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Annotation State
  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [activeFilter, setActiveFilter] = useState("None");

  useEffect(() => {
    document.title = "PixelBox • Bounding Box Annotator";
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
      if (entry.name.endsWith("_bbox.txt")) {
        annotatedSet.add(entry.name.replace("_bbox.txt", ""));
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
      setRectangles([]);
      setNewRect(null);
      setSelectedId(null);
    };
    img.src = fileData.url;
  };

  /* ================= DRAWING LOGIC ================= */
  const handleMouseDown = (e) => {
    if (!imageObj) return;
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === "Image";
    if (clickedOnEmpty) {
      setSelectedId(null);
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewRect({ x, y, w: 0, h: 0, id: crypto.randomUUID() });
    }
  };

  const handleMouseMove = (e) => {
    if (!newRect) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewRect(prev => ({ ...prev, w: x - prev.x, h: y - prev.y }));
  };

  const handleMouseUp = () => {
    if (!newRect) return;
    if (Math.abs(newRect.w) > 5 && Math.abs(newRect.h) > 5) {
      setRectangles(prev => [...prev, {
        ...newRect,
        name: `Box ${prev.length + 1}`,
        color: Konva.Util.getRandomColor()
      }]);
    }
    setNewRect(null);
  };

  /* ================= TRANSFORMER ================= */
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, rectangles]);

  /* ================= SAVE LOGIC ================= */
  const handleSave = async () => {
    if (!imageObj || !rectangles.length || !outputDirHandle) return;

    const imgW = stageSize.w;
    const imgH = stageSize.h;
    const yoloLines = rectangles.map((r) => {
      const xCenter = (r.x + r.w / 2) / imgW;
      const yCenter = (r.y + r.h / 2) / imgH;
      const wNorm = Math.abs(r.w) / imgW;
      const hNorm = Math.abs(r.h) / imgH;
      return `0 ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${wNorm.toFixed(6)} ${hNorm.toFixed(6)}`;
    }).join("\n");

    try {
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const outputFileName = `${baseName}_bbox.txt`;
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

  /* ================= UI THEME ================= */
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
            <button onClick={() => setIsImageNavExpanded(!isImageNavExpanded)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Images</span>
              {isImageNavExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="flex-1 flex justify-center px-4 overflow-hidden">
            {files.length > 0 ? (
              <div className={`flex items-center gap-4 transition-all duration-300 ${isImageNavExpanded ? 'flex-wrap justify-center' : 'flex-nowrap'}`}>
                {files.slice(viewIndex, viewIndex + 10).map((file) => (
                  <div key={file.name} onClick={() => handleSelectImage(file)} className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-all ${fileName === file.name ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-transparent hover:border-slate-300'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${file.isAnnotated ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span className={`text-[11px] truncate max-w-[100px] ${fileName === file.name ? 'font-bold text-indigo-500' : 'font-medium opacity-70'}`}>{file.name}</span>
                    </div>
                    {isImageNavExpanded && (
                      <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${fileName === file.name ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <span className="text-xs italic opacity-30">Load folders to start</span>}
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
        <aside className={`w-80 flex-shrink-0 border-r flex flex-col shadow-xl z-10 ${theme.sidebar}`}>
          <div className="p-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Square className="w-6 h-6 text-indigo-500" />
              <Link to="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                <h1 className="font-bold text-xl tracking-tight">PixelBox</h1>
              </Link>
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
              <button onClick={() => setRectangles(r => r.slice(0, -1))} disabled={!rectangles.length} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${theme.buttonSecondary} disabled:opacity-50`}>
                <Undo size={16} /> Undo
              </button>
              <button onClick={handleSave} disabled={!rectangles.length} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${!rectangles.length ? "opacity-50 " + theme.buttonSecondary : "bg-sky-600 text-white shadow-lg"}`}>
                <Download size={16} /> Save
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div onClick={() => setIsListExpanded(!isListExpanded)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-inherit">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Boxes ({rectangles.length})</h3>
              </div>
              {isListExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isListExpanded && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {rectangles.map((r) => (
                  <div key={r.id} onClick={() => setSelectedId(r.id)} className={`group rounded-lg border p-2.5 cursor-pointer transition-all ${theme.card} ${selectedId === r.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'hover:border-slate-400'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <input 
                        value={r.name} 
                        onChange={(e) => setRectangles(prev => prev.map(item => item.id === r.id ? { ...item, name: e.target.value } : item))} 
                        className="flex-1 text-sm bg-transparent focus:outline-none"
                      />
                      <button onClick={(e) => { e.stopPropagation(); setRectangles(rects => rects.filter(x => x.id !== r.id)); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500">
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
              <h3 className="text-2xl font-bold mb-1">PixelBox Workspace</h3>
              <p className={theme.subText}>Open folders to start bounding box annotation</p>
            </div>
          ) : (
            <div className="shadow-2xl rounded-xl overflow-hidden border-4 border-white dark:border-slate-800">
              <Stage
                ref={stageRef}
                width={stageSize.w}
                height={stageSize.h}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: "crosshair" }}
              >
                <Layer>
                  <KonvaImage ref={imageRef} image={imageObj} width={stageSize.w} height={stageSize.h} filters={getFilters()} />
                </Layer>
                <Layer>
                  {rectangles.map((rect) => (
                    <Group
                      key={rect.id}
                      id={rect.id}
                      x={rect.x}
                      y={rect.y}
                      draggable
                      onClick={() => setSelectedId(rect.id)}
                      onDragEnd={(e) => setRectangles(prev => prev.map(r => r.id === rect.id ? { ...r, x: e.target.x(), y: e.target.y() } : r))}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRectangles(prev => prev.map(r => r.id === rect.id ? {
                          ...r,
                          x: node.x(),
                          y: node.y(),
                          w: Math.max(5, node.width() * node.scaleX()),
                          h: Math.max(5, node.height() * node.scaleY()),
                        } : r));
                        node.scaleX(1); node.scaleY(1);
                      }}
                    >
                      <Rect width={rect.w} height={rect.h} stroke={rect.color} strokeWidth={2} fill={selectedId === rect.id ? rect.color + '33' : 'transparent'} />
                      <Label y={-20}>
                        <Tag fill="#1e293b" pointerDirection="down" />
                        <Text text={rect.name} fill="white" padding={4} fontSize={11} />
                      </Label>
                    </Group>
                  ))}
                  {newRect && <Rect x={newRect.x} y={newRect.y} width={newRect.w} height={newRect.h} stroke="#00FF00" strokeWidth={2} />}
                  <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox} />
                </Layer>
              </Stage>
            </div>
          )}
          <Snackbar show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </main>
      </div>
    </div>
  );
}