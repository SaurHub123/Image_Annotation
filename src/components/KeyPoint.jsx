import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text, Group } from "react-konva";

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

  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });

  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);

  const [connectMode, setConnectMode] = useState(false);
  const [activeKp, setActiveKp] = useState(null);

  // 🔑 SIMPLE CONNECTION STATE
  const [connectionSource, setConnectionSource] = useState(null);
  const [connectionTarget, setConnectionTarget] = useState(null);

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

  /* ================= CONNECTION LOGIC (SIMPLE & CORRECT) ================= */
  const handleKeypointClick = (id, e) => {
    e.cancelBubble = true;

    if (!connectMode) {
      setActiveKp(id);
      return;
    }

    // STEP 1: pick source
    if (!connectionSource) {
      setConnectionSource(id);
      setActiveKp(id);
      return;
    }

    // prevent self-connection
    if (connectionSource === id) return;

    // STEP 2: pick destination
    setConnectionTarget(id);

    // create ONE connection
    setConnections((prev) => {
      const exists = prev.some(
        (c) =>
          (c.from === connectionSource && c.to === id) ||
          (c.from === id && c.to === connectionSource)
      );
      if (exists) return prev;
      return [...prev, { from: connectionSource, to: id }];
    });

    // 🔁 RESET after ONE connection
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

  const removeConnection = (from, to) => {
    setConnections((prev) =>
      prev.filter(
        (c) =>
          !(
            (c.from === from && c.to === to) ||
            (c.from === to && c.to === from)
          )
      )
    );
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

  /* ================= UI ================= */
  return (
    <div className="flex h-screen bg-slate-100">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-96 bg-white border-r p-4 flex flex-col gap-3">
        <h2 className="font-bold text-lg">Keypoints</h2>

        <label className="bg-indigo-600 text-white py-2 text-center rounded cursor-pointer">
          Upload Image
          <input hidden type="file" accept="image/*" onChange={handleUpload} />
        </label>

        <button
          onClick={() => setConnectMode((v) => !v)}
          className={`py-2 rounded ${
            connectMode ? "bg-emerald-600 text-white" : "bg-slate-200"
          }`}
        >
          {connectMode ? "Connect Mode ON" : "Connect Mode OFF"}
        </button>

        <div className="flex-1 overflow-auto space-y-2">
          {keypoints.map((kp) => {
            const linked = connections
              .filter((c) => c.from === kp.id || c.to === kp.id)
              .map((c) =>
                c.from === kp.id
                  ? keypoints.find((k) => k.id === c.to)?.name
                  : keypoints.find((k) => k.id === c.from)?.name
              );

            return (
              <div key={kp.id} className="border rounded p-2 text-sm">
                <input
                  value={kp.name}
                  onChange={(e) =>
                    setKeypoints((prev) =>
                      prev.map((k) =>
                        k.id === kp.id ? { ...k, name: e.target.value } : k
                      )
                    )
                  }
                  className="font-semibold w-full"
                />

                <div className="text-xs text-slate-500 mt-1">
                  Connected: {linked.length ? linked.join(", ") : "—"}
                </div>

                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => setActiveKp(kp.id)}
                    className="text-indigo-600 text-xs"
                  >
                    Focus
                  </button>
                  <button
                    onClick={() => deleteKeypoint(kp.id)}
                    className="text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white py-2 rounded"
        >
          Save (YOLOv8)
        </button>
      </aside>

      {/* ===== CANVAS ===== */}
      <main className="flex-1 flex items-center justify-center">
        {!imageObj ? (
          <div className="text-slate-400">Upload an image</div>
        ) : (
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            onMouseDown={handleStageClick}
          >
            <Layer>
              <KonvaImage
                image={imageObj}
                width={stageSize.w}
                height={stageSize.h}
              />
            </Layer>

            <Layer>
              {connections.map((c, i) => {
                const a = keypoints.find((k) => k.id === c.from);
                const b = keypoints.find((k) => k.id === c.to);
                if (!a || !b) return null;
                return (
                  <Line
                    key={i}
                    points={[a.x, a.y, b.x, b.y]}
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                );
              })}

              {keypoints.map((kp) => (
                <Group
                  key={kp.id}
                  x={kp.x}
                  y={kp.y}
                  draggable
                  onDragMove={(e) => handleDrag(kp.id, e)}
                  onClick={(e) => handleKeypointClick(kp.id, e)}
                  // ADD THIS BLOCK:
                  dragBoundFunc={(pos) => {
                    return {
                      x: Math.max(0, Math.min(stageSize.w, pos.x)),
                      y: Math.max(0, Math.min(stageSize.h, pos.y)),
                    };
                  }}
                >
                  <Circle
                    radius={6}
                    fill={
                      kp.id === connectionSource
                        ? "#22c55e"
                        : "#ffffff"
                    }
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                  <Text text={kp.name} x={8} y={-6} fontSize={12} />
                </Group>
              ))}
            </Layer>
          </Stage>
        )}
      </main>
    </div>
  );
}
