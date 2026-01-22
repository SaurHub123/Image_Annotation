// import React, { useEffect, useState } from "react";
// import { Stage, Layer, Circle, Line, Text, Group, Rect } from "react-konva";
// import { loadSkeletons, saveSkeletons } from "../utils/skeletonStorage";

// const SIZE = 600;

// export default function SkeletonEditor() {
//   /* ===== STATE ===== */
//   const [skeletons, setSkeletons] = useState([]);
//   const [activeId, setActiveId] = useState(null);

//   const [name, setName] = useState("");
//   const [keypoints, setKeypoints] = useState([]);
//   const [connections, setConnections] = useState([]);

//   const [connectMode, setConnectMode] = useState(false);
//   const [source, setSource] = useState(null);

//   /* ===== LOAD STORAGE ===== */
//   useEffect(() => {
//     setSkeletons(loadSkeletons());
//   }, []);

//   /* ===== HELPERS ===== */
//   const clamp = (v) => Math.max(0, Math.min(1, v));

//   /* ===== CANVAS CLICK ===== */
//   const handleStageClick = (e) => {
//     if (connectMode) return;

//     const pos = e.target.getStage().getPointerPosition();
//     if (
//       pos.x < 0 || pos.y < 0 ||
//       pos.x > SIZE || pos.y > SIZE
//     ) return;

//     setKeypoints((prev) => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         name: `KP${prev.length}`,
//         x: clamp(pos.x / SIZE),
//         y: clamp(pos.y / SIZE),
//       },
//     ]);
//   };

//   /* ===== CONNECT ===== */
//   const handlePointClick = (id, e) => {
//     e.cancelBubble = true;

//     if (!connectMode) return;

//     if (!source) {
//       setSource(id);
//       return;
//     }

//     if (source === id) return;

//     setConnections((prev) => [
//       ...prev,
//       { from: source, to: id },
//     ]);

//     setSource(null);
//   };

//   /* ===== SAVE ===== */
//   const saveSkeleton = () => {
//     if (!name) return;

//     const updated = [...skeletons.filter(s => s.id !== activeId), {
//       id: activeId || crypto.randomUUID(),
//       name,
//       keypoints,
//       connections,
//     }];

//     saveSkeletons(updated);
//     setSkeletons(updated);
//     alert("Skeleton saved");
//   };

//   /* ===== LOAD ===== */
//   const loadSkeleton = (sk) => {
//     setActiveId(sk.id);
//     setName(sk.name);
//     setKeypoints(sk.keypoints);
//     setConnections(sk.connections);
//   };

//   /* ===== DELETE KEYPOINT ===== */
//   const deleteKeypoint = (id) => {
//     setKeypoints(k => k.filter(p => p.id !== id));
//     setConnections(c =>
//       c.filter(x => x.from !== id && x.to !== id)
//     );
//   };

//   return (
//     <div className="flex h-screen bg-slate-100">

//       {/* ===== LEFT: KEYPOINT LIST ===== */}
//       <aside className="w-72 bg-white p-4 border-r space-y-2">
//         <h3 className="font-bold">Keypoints</h3>

//         {keypoints.map((kp) => (
//           <div key={kp.id} className="border p-2 rounded text-sm">
//             <input
//               value={kp.name}
//               onChange={(e) =>
//                 setKeypoints(prev =>
//                   prev.map(p =>
//                     p.id === kp.id ? { ...p, name: e.target.value } : p
//                   )
//                 )
//               }
//               className="font-semibold w-full"
//             />
//             <button
//               onClick={() => deleteKeypoint(kp.id)}
//               className="text-red-500 text-xs mt-1"
//             >
//               Delete
//             </button>
//           </div>
//         ))}
//       </aside>

//       {/* ===== CENTER: DRAW AREA ===== */}
//       <main className="flex-1 flex flex-col items-center justify-center">

//         <div className="mb-2 flex gap-2">
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Skeleton name"
//             className="border p-2"
//           />

//           <button
//             onClick={() => setConnectMode(v => !v)}
//             className={`px-4 ${
//               connectMode ? "bg-green-600 text-white" : "bg-gray-300"
//             }`}
//           >
//             Connect
//           </button>

//           <button
//             onClick={saveSkeleton}
//             className="bg-indigo-600 text-white px-4"
//           >
//             Save
//           </button>
//         </div>

//         <Stage
//           width={SIZE}
//           height={SIZE}
//           onMouseDown={handleStageClick}
//         >
//           <Layer>
//             {/* Visible boundary */}
//             <Rect
//               width={SIZE}
//               height={SIZE}
//               stroke="#334155"
//               strokeWidth={3}
//             />
//           </Layer>

//           <Layer>
//             {connections.map((c, i) => {
//               const a = keypoints.find(k => k.id === c.from);
//               const b = keypoints.find(k => k.id === c.to);
//               if (!a || !b) return null;
//               return (
//                 <Line
//                   key={i}
//                   points={[
//                     a.x * SIZE, a.y * SIZE,
//                     b.x * SIZE, b.y * SIZE
//                   ]}
//                   stroke="#10b981"
//                   strokeWidth={3}
//                 />
//               );
//             })}

//             {keypoints.map((kp) => (
//               <Group
//                 key={kp.id}
//                 x={kp.x * SIZE}
//                 y={kp.y * SIZE}
//                 draggable
//                 dragBoundFunc={(pos) => ({
//                   x: Math.max(0, Math.min(SIZE, pos.x)),
//                   y: Math.max(0, Math.min(SIZE, pos.y)),
//                 })}
//                 onDragMove={(e) => {
//                   const p = e.target.position();
//                   setKeypoints(prev =>
//                     prev.map(k =>
//                       k.id === kp.id
//                         ? {
//                             ...k,
//                             x: clamp(p.x / SIZE),
//                             y: clamp(p.y / SIZE),
//                           }
//                         : k
//                     )
//                   );
//                 }}
//                 onClick={(e) => handlePointClick(kp.id, e)}
//               >
//                 <Circle radius={6} fill="#fff" stroke="#6366f1" />
//                 <Text text={kp.name} x={8} y={-6} />
//               </Group>
//             ))}
//           </Layer>
//         </Stage>
//       </main>

//       {/* ===== RIGHT: SAVED SKELETONS ===== */}
//       <aside className="w-72 bg-white p-4 border-l space-y-2">
//         <h3 className="font-bold">Saved Skeletons</h3>

//         {skeletons.map((sk) => (
//           <button
//             key={sk.id}
//             onClick={() => loadSkeleton(sk)}
//             className="w-full border p-2 text-left hover:bg-slate-100"
//           >
//             {sk.name}
//           </button>
//         ))}
//       </aside>
//     </div>
//   );
// }











import React, { useEffect, useState } from "react";
import { Stage, Layer, Circle, Line, Text, Group, Rect } from "react-konva";
import { loadSkeletons, saveSkeletons } from "../utils/skeletonStorage";
import { Trash2, Save, Link, Move, ChevronRight, Hash } from "lucide-react";

const SIZE = 600;

export default function SkeletonEditor() {
  const [skeletons, setSkeletons] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [name, setName] = useState("");
  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectMode, setConnectMode] = useState(false);
  const [source, setSource] = useState(null);

  useEffect(() => {
    setSkeletons(loadSkeletons());
  }, []);

  const clamp = (v) => Math.max(0, Math.min(1, v));

  const handleStageClick = (e) => {
    // FIX: Only create a point if clicking the actual stage background
    // This prevents "ghost" points when clicking/dragging existing ones
    if (connectMode || e.target !== e.target.getStage()) return;

    const pos = e.target.getStage().getPointerPosition();
    
    setKeypoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `KP ${prev.length + 1}`,
        x: clamp(pos.x / SIZE),
        y: clamp(pos.y / SIZE),
      },
    ]);
  };

  const handlePointClick = (id, e) => {
    // Prevent the click from reaching the stage
    e.cancelBubble = true;
    
    if (!connectMode) return;
    if (!source) {
      setSource(id);
      return;
    }
    if (source === id) {
      setSource(null);
      return;
    };
    
    // Check if connection already exists
    const exists = connections.some(c => 
      (c.from === source && c.to === id) || (c.from === id && c.to === source)
    );

    if (!exists) {
      setConnections((prev) => [...prev, { from: source, to: id }]);
    }
    setSource(null);
  };

  const saveSkeleton = () => {
    if (!name) return alert("Please enter a name");
    const updated = [...skeletons.filter(s => s.id !== activeId), {
      id: activeId || crypto.randomUUID(),
      name,
      keypoints,
      connections,
    }];
    saveSkeletons(updated);
    setSkeletons(updated);
    alert("Skeleton saved successfully!");
  };

  const loadSkeleton = (sk) => {
    setActiveId(sk.id);
    setName(sk.name);
    setKeypoints(sk.keypoints);
    setConnections(sk.connections);
  };

  const deleteKeypoint = (id) => {
    setKeypoints(k => k.filter(p => p.id !== id));
    setConnections(c => c.filter(x => x.from !== id && x.to !== id));
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-80 bg-[#1e293b] border-r border-slate-700 flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-2 border-b border-slate-700">
          <Hash size={18} className="text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Keypoints</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {keypoints.map((kp) => (
            <div key={kp.id} className="group bg-[#334155]/30 border border-slate-700 p-2 pl-3 rounded-lg flex items-center gap-3 hover:bg-[#334155]/60 transition-all">
              <input
                value={kp.name}
                onChange={(e) => setKeypoints(prev => prev.map(p => p.id === kp.id ? { ...p, name: e.target.value } : p))}
                className="bg-transparent text-sm focus:outline-none w-full font-medium text-slate-300 focus:text-white"
              />
              <button onClick={() => deleteKeypoint(kp.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {keypoints.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <Move className="mx-auto mb-2" size={32} />
              <p className="text-xs">Click canvas to add points</p>
            </div>
          )}
        </div>
      </aside>

      {/* CENTER VIEWPORT */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        
        {/* Floating Controls */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-[#1e293b] p-2 px-4 rounded-2xl border border-slate-600 shadow-2xl">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skeleton Name"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-all w-40"
          />
          <div className="h-6 w-px bg-slate-700 mx-1" />
          <button
            onClick={() => { setConnectMode(!connectMode); setSource(null); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              connectMode ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {connectMode ? <Link size={16} /> : <Move size={16} />}
            {connectMode ? "Connect Mode" : "Select Mode"}
          </button>
          <button
            onClick={saveSkeleton}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95"
          >
            <Save size={16} /> Save
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-black rounded-xl border-4 border-[#1e293b] shadow-2xl overflow-hidden">
            <Stage
              width={SIZE}
              height={SIZE}
              onMouseDown={handleStageClick}
              style={{ cursor: connectMode ? 'crosshair' : 'default' }}
            >
              <Layer>
                {connections.map((c, i) => {
                  const a = keypoints.find(k => k.id === c.from);
                  const b = keypoints.find(k => k.id === c.to);
                  if (!a || !b) return null;
                  return (
                    <Line
                      key={i}
                      points={[a.x * SIZE, a.y * SIZE, b.x * SIZE, b.y * SIZE]}
                      stroke="#10b981"
                      strokeWidth={3}
                      opacity={0.5}
                      lineCap="round"
                    />
                  );
                })}

                {keypoints.map((kp) => (
                  <Group
                    key={kp.id}
                    x={kp.x * SIZE}
                    y={kp.y * SIZE}
                    draggable={!connectMode}
                    dragBoundFunc={(pos) => ({
                      x: Math.max(0, Math.min(SIZE, pos.x)),
                      y: Math.max(0, Math.min(SIZE, pos.y)),
                    })}
                    onDragMove={(e) => {
                      const p = e.target.position();
                      setKeypoints(prev => prev.map(k => k.id === kp.id ? { ...k, x: clamp(p.x / SIZE), y: clamp(p.y / SIZE) } : k));
                    }}
                    onClick={(e) => handlePointClick(kp.id, e)}
                  >
                    <Circle 
                      radius={source === kp.id ? 10 : 7} 
                      fill={source === kp.id ? "#fbbf24" : "#6366f1"} 
                      stroke="#fff" 
                      strokeWidth={2}
                      className="cursor-pointer"
                    />
                    <Text 
                      text={kp.name} 
                      x={12} 
                      y={-6} 
                      fill="white" 
                      fontSize={11} 
                      fontStyle="bold"
                    />
                  </Group>
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-72 bg-[#1e293b] border-l border-slate-700 p-6 flex flex-col shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 italic underline decoration-indigo-500 underline-offset-8">Saved Skeletons</h3>
        <div className="space-y-3">
          {skeletons.map((sk) => (
            <button
              onClick={() => loadSkeleton(sk)}
              className={`w-full group flex items-center justify-between p-4 rounded-xl border transition-all ${
                activeId === sk.id 
                ? "bg-indigo-600/20 border-indigo-500" 
                : "bg-slate-800/40 border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-bold text-slate-200">{sk.name}</p>
                <p className="text-[10px] text-slate-500">{sk.keypoints.length} Nodes</p>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}