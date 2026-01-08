import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text, Group } from "react-konva";

/* ===================== HELPERS ===================== */
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

const downloadURI = (uri, name) => {
  const a = document.createElement("A");
  a.href = uri;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const downloadText = (text, name) => {
  const blob = new Blob([text], { type: "text/plain" });
  downloadURI(URL.createObjectURL(blob), name);
};

/* ===================== MAIN ===================== */
export default function KeypointAnnotatorAdmin() {
  const stageRef = useRef(null);

  const [imageObj, setImageObj] = useState(null);
  const [fileName, setFileName] = useState("");
  const [stageSize, setStageSize] = useState({ w: 900, h: 600 });

  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);

  const [connectMode, setConnectMode] = useState(false);
  const [activeKp, setActiveKp] = useState(null);
  const [connectionSource, setConnectionSource] = useState(null);
  const [hoverKp, setHoverKp] = useState(null);

  /* ---------------- HISTORY (UNDO / REDO) ---------------- */
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const snapshot = () => {
    setHistory((h) => [...h, { keypoints, connections }]);
    setFuture([]);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture((f) => [{ keypoints, connections }, ...f]);
    setKeypoints(prev.keypoints);
    setConnections(prev.connections);
    setHistory((h) => h.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((h) => [...h, { keypoints, connections }]);
    setKeypoints(next.keypoints);
    setConnections(next.connections);
    setFuture((f) => f.slice(1));
  };

  /* ---------------- UPLOAD ---------------- */
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
      setHistory([]);
      setFuture([]);
    };
    img.src = URL.createObjectURL(file);
  };

  /* ---------------- ADD KEYPOINT ---------------- */
  const addKeypoint = (x, y) => {
    snapshot();
    setKeypoints((prev) => [
      ...prev,
      { id: crypto.randomUUID(), x, y, name: toAlphabetic(prev.length), visibility: 2 },
    ]);
  };

  const handleStageClick = (e) => {
    if (!imageObj) return;
    const stage = e.target.getStage();
    if (e.target !== stage && e.target.className !== "Image") return;
    const p = stage.getPointerPosition();
    addKeypoint(p.x, p.y);
  };

  /* ---------------- DRAG ---------------- */
  const handleDrag = (id, e) => {
    snapshot();
    const { x, y } = e.target.position();
    setKeypoints((prev) => prev.map((k) => (k.id === id ? { ...k, x, y } : k)));
  };

  /* ---------------- CONNECTION LOGIC ---------------- */
  const handleKeypointClick = (id, e) => {
    e.cancelBubble = true;

    if (!connectMode) {
      setActiveKp(id);
      return;
    }

    if (!connectionSource) {
      setConnectionSource(id);
      setActiveKp(id);
      return;
    }

    if (id === connectionSource) return;

    snapshot();
    setConnections((prev) => {
      const exists = prev.some(
        (c) =>
          (c.from === connectionSource && c.to === id) ||
          (c.from === id && c.to === connectionSource)
      );
      if (exists) return prev;
      return [...prev, { from: connectionSource, to: id }];
    });
  };

  const removeConnection = (from, to) => {
    snapshot();
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

  const deleteKeypoint = (id) => {
    snapshot();
    setKeypoints((prev) => prev.filter((k) => k.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (connectionSource === id) setConnectionSource(null);
    if (activeKp === id) setActiveKp(null);
  };

  useEffect(() => {
    if (!connectMode) setConnectionSource(null);
  }, [connectMode]);

  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (!keypoints.length) return;

    const ordered = [...keypoints].sort((a, b) => a.name.localeCompare(b.name));

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
    downloadURI(stageRef.current.toDataURL({ pixelRatio: 2 }), fileName.replace(/\..+$/, "") + "_annotated.png");
  };

  /* ===================== UI ===================== */
  return (
    <div className="flex h-screen bg-slate-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-96 bg-white border-r p-4 flex flex-col gap-3">
        <h2 className="font-bold text-lg">Keypoint Annotation</h2>

        <label className="bg-indigo-600 text-white text-sm py-2 text-center rounded cursor-pointer">
          Upload Image
          <input hidden type="file" accept="image/*" onChange={handleUpload} />
        </label>

        <div className="flex gap-2">
          <button onClick={undo} className="flex-1 bg-slate-200 py-2 rounded text-sm">Undo</button>
          <button onClick={redo} className="flex-1 bg-slate-200 py-2 rounded text-sm">Redo</button>
        </div>

        <button
          onClick={() => setConnectMode((v) => !v)}
          className={`py-2 rounded text-sm ${
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
                  Connected to: {linked.length ? linked.join(", ") : "—"}
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
          className="bg-indigo-600 text-white py-2 rounded text-sm"
        >
          Save (YOLOv8)
        </button>
      </aside>

      {/* ================= CANVAS ================= */}
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
              <KonvaImage image={imageObj} width={stageSize.w} height={stageSize.h} />
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
                >
                  <Circle
                    radius={6}
                    fill={kp.id === connectionSource ? "#22c55e" : "#fff"}
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
