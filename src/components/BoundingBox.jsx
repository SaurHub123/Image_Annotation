import React, { useRef, useState, useEffect } from "react";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Rect,
    Transformer,
    Text,
    Group,
    Label,
    Tag,
} from "react-konva";
import {
    Download,
    Upload,
    Trash2,
    Sun,
    Moon,
    Crosshair,
    ImagePlus,
    Palette,
    Square,
    Undo
} from "lucide-react";
import Konva from "konva";

/* ================= COMPONENT ================= */
export default function BoundingBoxAnnotator() {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(false);

    // App State
    const [imageObj, setImageObj] = useState(null);
    const [fileName, setFileName] = useState("");
    const [stageSize, setStageSize] = useState({ w: 900, h: 600 });

    // Annotation State
    const [rectangles, setRectangles] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [newRect, setNewRect] = useState(null); // {x, y, w, h}

    // Filter State
    const [activeFilter, setActiveFilter] = useState("None");
    const imageRef = useRef(null);

    /* ================= EFFECTS ================= */
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
            setRectangles([]);
            setNewRect(null);
            setSelectedId(null);
        };
        img.src = URL.createObjectURL(file);
    };

    /* ================= DRAWING LOGIC ================= */
    const handleMouseDown = (e) => {
        if (!imageObj) return;

        // clicking on empty stage - remove selection
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === "Image";
        if (clickedOnEmpty) {
            setSelectedId(null);
        } else {
            // clicked on a rectangle?
            return;
        }

        // Start drawing
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewRect({ x, y, w: 0, h: 0, id: crypto.randomUUID() });
    };

    const handleMouseMove = (e) => {
        if (!newRect) return;

        const { x, y } = e.target.getStage().getPointerPosition();
        setNewRect(prev => ({
            ...prev,
            w: x - prev.x,
            h: y - prev.y
        }));
    };

    const handleMouseUp = () => {
        if (!newRect) return;

        // Minimum size check (5x5)
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
            // we need to attach transformer manually
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId, rectangles]);

    /* ================= DELETE ================= */
    const deleteRectangle = (id) => {
        setRectangles((prev) => prev.filter((r) => r.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    /* ================= SAVE ================= */
    const handleSave = () => {
        if (!rectangles.length) return;

        // Simple JSON export for now
        const data = {
            image: fileName,
            boxes: rectangles.map(r => ({
                label: r.name,
                x: r.x,
                y: r.y,
                w: r.w,
                h: r.h
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName.replace(/\.[^/.]+$/, "") + "_bbox.json";
        a.click();
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
                        <Square className="w-6 h-6 text-indigo-500" />
                        <h1 className="font-bold text-xl tracking-tight">PixelBox</h1>
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
                            onClick={() => {
                                setRectangles(prev => prev.slice(0, -1));
                                setSelectedId(null);
                            }}
                            disabled={!rectangles.length}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${theme.buttonSecondary} ${!rectangles.length && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <Undo size={16} /> Undo
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!rectangles.length}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${!rectangles.length ? "opacity-50 cursor-not-allowed " + theme.buttonSecondary : "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
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

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <div className="flex items-center justify-between">
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.subText}`}>
                            Boxes ({rectangles.length})
                        </h3>
                        {rectangles.length > 0 && (
                            <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => setRectangles([])}>Clear All</span>
                        )}
                    </div>

                    {!rectangles.length && (
                        <div className={`text-center py-10 ${theme.subText} text-sm`}>
                            Drag on the image to create<br />bounding boxes.
                        </div>
                    )}

                    {rectangles.map((r, i) => (
                        <div
                            key={r.id}
                            onClick={() => setSelectedId(r.id)}
                            className={`group relative rounded-lg border p-3 transition-all cursor-pointer ${theme.card} ${selectedId === r.id ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color || '#6366f1' }} />
                                <input
                                    value={r.name}
                                    onChange={(e) =>
                                        setRectangles((prev) =>
                                            prev.map((item) =>
                                                item.id === r.id ? { ...item, name: e.target.value } : item
                                            )
                                        )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 text-sm font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme.input} bg-transparent`}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRectangle(r.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] opacity-60 font-mono">
                                <span>X: {Math.round(r.x)}</span>
                                <span>Y: {Math.round(r.y)}</span>
                                <span>W: {Math.round(r.w)}</span>
                                <span>H: {Math.round(r.h)}</span>
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
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            style={{ cursor: "crosshair" }}
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
                                {rectangles.map((rect, i) => (
                                    <Group
                                        key={rect.id}
                                        id={rect.id}
                                        x={rect.x}
                                        y={rect.y}
                                        draggable
                                        onClick={() => setSelectedId(rect.id)}
                                        onDragStart={() => setSelectedId(rect.id)}
                                        onDragEnd={(e) => {
                                            const node = e.target;
                                            setRectangles(prev => prev.map(r => r.id === rect.id ? { ...r, x: node.x(), y: node.y() } : r));
                                        }}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            const scaleX = node.scaleX();
                                            const scaleY = node.scaleY();
                                            node.scaleX(1);
                                            node.scaleY(1);
                                            setRectangles(prev => prev.map(r => r.id === rect.id ? {
                                                ...r,
                                                x: node.x(),
                                                y: node.y(),
                                                // set minimal value
                                                w: Math.max(5, node.width() * scaleX),
                                                h: Math.max(5, node.height() * scaleY),
                                            } : r));
                                        }}
                                    >
                                        <Rect
                                            width={rect.w}
                                            height={rect.h}
                                            stroke={rect.color || '#00FF00'}
                                            strokeWidth={2}
                                            fill={selectedId === rect.id ? (rect.color || '#00FF00') + '33' : 'transparent'} // Add transparency
                                        />
                                        <Label
                                            y={rect.h > 0 ? -20 : rect.h - 20}
                                            opacity={0.9}
                                        >
                                            <Tag
                                                fill="#1e293b"
                                                pointerDirection="down"
                                                pointerWidth={6}
                                                pointerHeight={6}
                                                lineJoin="round"
                                                shadowColor="black"
                                            />
                                            <Text
                                                text={rect.name}
                                                fontFamily="sans-serif"
                                                fontSize={12}
                                                padding={4}
                                                fill="white"
                                            />
                                        </Label>
                                    </Group>
                                ))}

                                {newRect && (
                                    <Rect
                                        x={newRect.x}
                                        y={newRect.y}
                                        width={newRect.w}
                                        height={newRect.h}
                                        stroke="#00FF00"
                                        strokeWidth={2}
                                    />
                                )}

                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        // limit resize
                                        if (newBox.width < 5 || newBox.height < 5) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                />
                            </Layer>
                        </Stage>
                    </div>
                )}
            </main>
        </div>
    );
}
