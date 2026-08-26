import React, { useState, useRef, useCallback, useEffect } from "react";
import { Type, ImagePlus, Trash2, RotateCw, X } from "lucide-react";

const INK = {
  paper: "#F7F4EC",
  ink: "#17181C",
  red: "#C23B33",
  teal: "#1F6F68",
  mustard: "#D9A441",
  line: "#D9D4C4",
};

const GARMENTS = [
  { name: "White", hex: "#FBFAF6" },
  { name: "Black", hex: "#1B1C20" },
  { name: "Navy", hex: "#232E45" },
  { name: "Poster Red", hex: "#B23A32" },
  { name: "Mustard", hex: "#D9A441" },
  { name: "Teal", hex: "#20635E" },
  { name: "Ash", hex: "#B7B4AC" },
];

const INKS = ["#17181C", "#FBFAF6", "#C23B33", "#1F6F68", "#D9A441", "#232E45"];

const FONTS = [
  { name: "Poster", family: "'Anton', sans-serif" },
  { name: "Marker", family: "'Permanent Marker', cursive" },
  { name: "Condensed", family: "'Oswald', sans-serif" },
  { name: "Grotesk", family: "'Space Grotesk', sans-serif" },
];

const DX = 130, DY = 150, DW = 140, DH = 250;
const TEE_PATH =
  "M150,28 Q200,58 250,28 L300,15 L365,85 L305,145 L295,445 L105,445 L95,145 L35,85 L100,15 Z";

function RegMark({ size = 10, color = INK.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: "inline-block" }}>
      <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="1.2" />
      <line x1="10" y1="1" x2="10" y2="19" stroke={color} strokeWidth="1.2" />
      <line x1="1" y1="10" x2="19" y2="10" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

let uid = 1;

export default function TshirtDesigner() {
  const [garment, setGarment] = useState(GARMENTS[0]);
  const [layers, setLayers] = useState([
    {
      id: 0,
      type: "text",
      text: "YOUR TEXT",
      font: FONTS[0].family,
      size: 30,
      color: INK.ink,
      bold: true,
      x: 50,
      y: 30,
      rotation: 0,
    },
  ]);
  const [selectedId, setSelectedId] = useState(0);

  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);

  const selected = layers.find((l) => l.id === selectedId) || null;

  // cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLayer = (id, patch) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addText = () => {
    const id = uid++;
    setLayers((ls) => [
      ...ls,
      {
        id,
        type: "text",
        text: "NEW LINE",
        font: FONTS[0].family,
        size: 26,
        color: INK.ink,
        bold: true,
        x: 50,
        y: 50,
        rotation: 0,
      },
    ]);
    setSelectedId(id);
  };

  const addImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const id = uid++;
      setLayers((ls) => [
        ...ls,
        {
          id,
          type: "image",
          src: String(reader.result),
          w: 90,
          h: 90,
          x: 50,
          y: 55,
          rotation: 0,
        },
      ]);
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  };

  const removeLayer = (id) => {
    setLayers((ls) => ls.filter((l) => l.id !== id));
    if (selectedId === id) {
      const remaining = layers.filter((l) => l.id !== id);
      setSelectedId(remaining.length ? remaining[remaining.length - 1].id : null);
    }
  };

  const toSVGPoint = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }, []);

  const onPointerDownLayer = (e, layer) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(layer.id);

    const p = toSVGPoint(e);
    dragRef.current = {
      id: layer.id,
      startX: p.x,
      startY: p.y,
      origX: layer.x,
      origY: layer.y,
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();

    const p = toSVGPoint(e);
    const { id, startX, startY, origX, origY } = dragRef.current;

    const dxPct = ((p.x - startX) / DW) * 100;
    const dyPct = ((p.y - startY) / DH) * 100;

    let nx = origX + dxPct;
    let ny = origY + dyPct;

    nx = Math.max(0, Math.min(100, nx));
    ny = Math.max(0, Math.min(100, ny));

    updateLayer(id, { x: nx, y: ny });
  };

  const onPointerUp = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const px = (l) => DX + (l.x / 100) * DW;
  const py = (l) => DY + (l.y / 100) * DH;

  return (
    <div
      style={{
        minHeight: "100%",
        background: INK.paper,
        fontFamily: "'Space Grotesk', sans-serif",
        color: INK.ink,
        padding: "28px 18px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Oswald:wght@400;600&family=Space+Grotesk:wght@400;500;700&display=swap');

        .pr-swatch { transition: transform .12s ease; cursor: pointer; }
        .pr-swatch:hover { transform: translateY(-2px); }

        .pr-btn { transition: opacity .12s ease; cursor: pointer; }
        .pr-btn:hover { opacity: .75; }

        input[type="range"] { accent-color: ${INK.ink}; }
        .pr-layer-row:hover { background: rgba(0,0,0,0.04); }

        .pr-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
        }

        @media (max-width: 980px) {
          .pr-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <RegMark size={16} />
          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 34,
              letterSpacing: 1,
              margin: 0,
            }}
          >
            PRESSROOM
          </h1>
        </div>

        <p style={{ margin: "0 0 26px 26px", fontSize: 13, opacity: 0.65 }}>
          design your tee — drag anything on the shirt
        </p>

        <div className="pr-grid">
          {/* PREVIEW */}
          <div>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${INK.line}`,
                borderRadius: 4,
                padding: "20px 10px",
              }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 400 460"
                style={{ width: "100%", height: "auto", touchAction: "none", userSelect: "none" }}
                onPointerDown={() => setSelectedId(null)}
              >
                <defs>
                  <linearGradient id="fabricShade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#000000" stopOpacity="0.12" />
                    <stop offset="0.15" stopColor="#000000" stopOpacity="0" />
                    <stop offset="0.85" stopColor="#000000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
                  </linearGradient>
                </defs>

                <path d={TEE_PATH} fill={garment.hex} stroke="#00000022" strokeWidth="1.5" />
                <path d={TEE_PATH} fill="url(#fabricShade)" opacity="0.5" />

                <rect
                  x={DX}
                  y={DY}
                  width={DW}
                  height={DH}
                  fill="none"
                  stroke="#00000018"
                  strokeDasharray="3 4"
                />

                {layers.map((l) => {
                  const x = px(l);
                  const y = py(l);

                  if (l.type === "text") {
                    const lines = l.text.split("\n");
                    const longest = Math.max(...lines.map((s) => s.length), 1);

                    return (
                      <g
                        key={l.id}
                        transform={`rotate(${l.rotation} ${x} ${y})`}
                        onPointerDown={(e) => onPointerDownLayer(e, l)}
                        style={{ cursor: "move" }}
                      >
                        <text
                          x={x}
                          y={y}
                          fontFamily={l.font}
                          fontSize={l.size}
                          fontWeight={l.bold ? 700 : 400}
                          fill={l.color}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {lines.map((ln, i) => (
                            <tspan
                              key={i}
                              x={x}
                              dy={i === 0 ? -((lines.length - 1) * l.size * 0.55) : l.size * 1.1}
                            >
                              {ln}
                            </tspan>
                          ))}
                        </text>

                        {selectedId === l.id && (
                          <rect
                            x={x - longest * l.size * 0.3}
                            y={y - lines.length * l.size * 0.6}
                            width={longest * l.size * 0.6}
                            height={lines.length * l.size * 1.2}
                            fill="none"
                            stroke={INK.red}
                            strokeDasharray="4 3"
                          />
                        )}
                      </g>
                    );
                  }

                  return (
                    <g
                      key={l.id}
                      transform={`rotate(${l.rotation} ${x} ${y})`}
                      onPointerDown={(e) => onPointerDownLayer(e, l)}
                      style={{ cursor: "move" }}
                    >
                      <image
                        href={l.src}
                        x={x - l.w / 2}
                        y={y - l.h / 2}
                        width={l.w}
                        height={l.h}
                        preserveAspectRatio="xMidYMid slice"
                      />
                      {selectedId === l.id && (
                        <rect
                          x={x - l.w / 2}
                          y={y - l.h / 2}
                          width={l.w}
                          height={l.h}
                          fill="none"
                          stroke={INK.red}
                          strokeDasharray="4 3"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {GARMENTS.map((g) => (
                <div
                  key={g.name}
                  className="pr-swatch"
                  onClick={() => setGarment(g)}
                  title={g.name}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: g.hex,
                    border: garment.name === g.name ? `2px solid ${INK.ink}` : `1px solid ${INK.line}`,
                    boxShadow: garment.name === g.name ? "0 0 0 2px #fff inset" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* PANEL */}
          <div
            style={{
              background: "#fff",
              border: `1px dashed ${INK.line}`,
              borderRadius: 4,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${INK.line}`,
                paddingBottom: 10,
                marginBottom: 14,
              }}
            >
              <span style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: 2, fontSize: 13 }}>
                ORDER TICKET
              </span>
              <RegMark size={14} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <button className="pr-btn" onClick={addText} style={btnStyle()}>
                <Type size={14} /> Add text
              </button>

              <button className="pr-btn" onClick={() => fileInputRef.current?.click()} style={btnStyle()}>
                <ImagePlus size={14} /> Add image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addImage(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 6 }}>LAYERS</div>

            <div style={{ marginBottom: 16 }}>
              {layers.length === 0 && <div style={{ fontSize: 13, opacity: 0.5 }}>Nothing on the shirt yet.</div>}

              {layers.map((l) => (
                <div
                  key={l.id}
                  className="pr-layer-row"
                  onClick={() => setSelectedId(l.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 8px",
                    borderRadius: 3,
                    cursor: "pointer",
                    background: selectedId === l.id ? "rgba(0,0,0,0.06)" : "transparent",
                    fontSize: 13,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {l.type === "text" ? <Type size={13} /> : <ImagePlus size={13} />}
                    {l.type === "text" ? (l.text || "(empty)").slice(0, 18) : "Image"}
                  </span>

                  <Trash2
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(l.id);
                    }}
                    style={{ opacity: 0.5, cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>

            {selected && (
              <div style={{ borderTop: `1px solid ${INK.line}`, paddingTop: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 10 }}>
                  {selected.type === "text" ? "TEXT SETTINGS" : "IMAGE SETTINGS"}
                </div>

                {selected.type === "text" && (
                  <>
                    <textarea
                      value={selected.text}
                      onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                      rows={2}
                      style={inputStyle()}
                    />

                    <div style={{ display: "flex", gap: 6, margin: "10px 0", flexWrap: "wrap" }}>
                      {FONTS.map((f) => (
                        <button
                          key={f.name}
                          className="pr-btn"
                          onClick={() => updateLayer(selected.id, { font: f.family })}
                          style={{
                            ...btnStyle(),
                            fontFamily: f.family,
                            background: selected.font === f.family ? INK.ink : "#fff",
                            color: selected.font === f.family ? "#fff" : INK.ink,
                          }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>

                    <label style={labelStyle}>Size {selected.size}px</label>
                    <input
                      type="range"
                      min="12"
                      max="70"
                      value={selected.size}
                      onChange={(e) => updateLayer(selected.id, { size: +e.target.value })}
                      style={{ width: "100%" }}
                    />

                    <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={selected.bold}
                        onChange={(e) => updateLayer(selected.id, { bold: e.target.checked })}
                      />
                      Bold
                    </label>
                  </>
                )}

                {selected.type === "image" && (
                  <>
                    <label style={labelStyle}>Size {selected.w}px</label>
                    <input
                      type="range"
                      min="30"
                      max="220"
                      value={selected.w}
                      onChange={(e) => {
                        const next = +e.target.value;
                        updateLayer(selected.id, { w: next, h: next });
                      }}
                      style={{ width: "100%" }}
                    />
                  </>
                )}

                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
                  <RotateCw size={12} /> Rotation {selected.rotation}°
                </label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={selected.rotation}
                  onChange={(e) => updateLayer(selected.id, { rotation: +e.target.value })}
                  style={{ width: "100%" }}
                />

                {selected.type === "text" && (
                  <>
                    <label style={labelStyle}>Ink color</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {INKS.map((c) => (
                        <div
                          key={c}
                          className="pr-swatch"
                          onClick={() => updateLayer(selected.id, { color: c })}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: c,
                            border: selected.color === c ? `2px solid ${INK.red}` : `1px solid ${INK.line}`,
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={selected.color}
                        onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                        style={{ width: 22, height: 22, padding: 0, border: "none", background: "none" }}
                      />
                    </div>
                  </>
                )}

                <button
                  className="pr-btn"
                  onClick={() => removeLayer(selected.id)}
                  style={{ ...btnStyle(), marginTop: 16, color: INK.red, borderColor: INK.red }}
                >
                  <X size={13} /> Remove layer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function btnStyle() {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    padding: "7px 10px",
    background: "#fff",
    border: `1px solid ${INK.ink}`,
    borderRadius: 3,
    color: INK.ink,
  };
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    padding: 8,
    border: `1px solid ${INK.line}`,
    borderRadius: 3,
    resize: "vertical",
  };
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  opacity: 0.7,
  margin: "10px 0 4px",
};
