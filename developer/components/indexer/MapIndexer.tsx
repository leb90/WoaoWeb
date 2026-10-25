"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SourceBox = { x: number; y: number; width: number; height: number };

type IndexRegion = SourceBox & {
  clientId: string;
  nombre: string;
  capa: number;
  bloquear: boolean;
  ancho: number;
  alto: number;
};

type Analysis = {
  jobId: string;
  imageUrl: string;
  width: number;
  height: number;
  regions: SourceBox[];
};

type CommitResult = {
  graphicFile: number;
  firstGrh: number;
  lastGrh: number;
  created: Array<IndexRegion & { id: number; ordinal: number; grhIndice: number }>;
};

const LAYERS = [
  { id: 1, title: "Capa 1", description: "Pisos y terreno en grilla 32x32" },
  { id: 2, title: "Capa 2", description: "Alfombras y decoracion bajo el personaje" },
  { id: 3, title: "Capa 3", description: "Muros y objetos que tapan al personaje" },
  { id: 4, title: "Capa 4", description: "Techos y cubiertas superiores" },
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function regionName(baseName: string, index: number): string {
  return `${baseName.trim() || "Nueva indexacion"} ${String(index + 1).padStart(2, "0")}`;
}

function makeRegion(box: SourceBox, index: number, layer: number, baseName: string): IndexRegion {
  return {
    ...box,
    clientId: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    nombre: regionName(baseName, index),
    capa: layer,
    bloquear: false,
    ancho: Math.max(1, Math.ceil(box.width / 32)),
    alto: Math.max(1, Math.ceil(box.height / 32)),
  };
}

function gridRegions(
  width: number,
  height: number,
  tilesWide: number,
  tilesHigh: number,
  baseName: string,
): IndexRegion[] {
  const cellWidth = clamp(Math.trunc(tilesWide) || 1, 1, 64) * 32;
  const cellHeight = clamp(Math.trunc(tilesHigh) || 1, 1, 64) * 32;
  const boxes: SourceBox[] = [];
  for (let y = 0; y < height; y += cellHeight) {
    for (let x = 0; x < width; x += cellWidth) {
      boxes.push({
        x,
        y,
        width: Math.min(cellWidth, width - x),
        height: Math.min(cellHeight, height - y),
      });
    }
  }
  if (boxes.length > 300) throw new Error("La grilla genera mas de 300 indices. Usa grupos mas grandes.");
  return boxes.map((box, index) => makeRegion(box, index, 1, baseName));
}

export function MapIndexer() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [layer, setLayer] = useState(1);
  const [baseName, setBaseName] = useState("Nueva indexacion");
  const [groupWidth, setGroupWidth] = useState(2);
  const [groupHeight, setGroupHeight] = useState(2);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [regions, setRegions] = useState<IndexRegion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CommitResult | null>(null);

  const selected = regions.find((region) => region.clientId === selectedId) ?? null;
  const totalTiles = regions.reduce((sum, region) => sum + region.ancho * region.alto, 0);

  function updateRegion(clientId: string, patch: Partial<IndexRegion>) {
    setRegions((current) => current.map((region) => {
      if (region.clientId !== clientId) return region;
      const next = { ...region, ...patch };
      next.x = clamp(Math.trunc(next.x), 0, Math.max(0, (analysis?.width ?? 1) - 1));
      next.y = clamp(Math.trunc(next.y), 0, Math.max(0, (analysis?.height ?? 1) - 1));
      next.width = clamp(Math.trunc(next.width), 1, (analysis?.width ?? 1) - next.x);
      next.height = clamp(Math.trunc(next.height), 1, (analysis?.height ?? 1) - next.y);
      next.ancho = clamp(Math.max(Math.ceil(next.width / 32), Math.trunc(next.ancho)), 1, 64);
      next.alto = clamp(Math.max(Math.ceil(next.height / 32), Math.trunc(next.alto)), 1, 64);
      return next;
    }));
  }

  async function analyze() {
    if (!file) {
      setError("Selecciona un grafico para continuar.");
      return;
    }
    setBusy("Analizando transparencias y separando piezas...");
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("layer", String(layer));
      const response = await fetch("/api/indexer/analyze", { method: "POST", body: form });
      const body = (await response.json()) as Analysis & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "No se pudo analizar la imagen.");
      setAnalysis(body);
      const next = layer === 1
        ? gridRegions(body.width, body.height, groupWidth, groupHeight, baseName)
        : body.regions.map((box, index) => makeRegion(box, index, layer, baseName));
      setRegions(next);
      setSelectedId(next[0]?.clientId ?? null);
      setStep(2);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo analizar la imagen.");
    } finally {
      setBusy("");
    }
  }

  function regenerateFloorGrid() {
    if (!analysis) return;
    try {
      const next = gridRegions(analysis.width, analysis.height, groupWidth, groupHeight, baseName);
      setRegions(next);
      setSelectedId(next[0]?.clientId ?? null);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo generar la grilla.");
    }
  }

  function addRegion(box: SourceBox) {
    if (regions.length >= 300) {
      setError("El lote ya alcanzo el maximo de 300 regiones.");
      return;
    }
    const next = makeRegion(box, regions.length, layer, baseName);
    setRegions((current) => [...current, next]);
    setSelectedId(next.clientId);
  }

  function removeSelected() {
    if (!selectedId) return;
    setRegions((current) => {
      const index = current.findIndex((region) => region.clientId === selectedId);
      const next = current.filter((region) => region.clientId !== selectedId);
      setSelectedId(next[Math.min(index, next.length - 1)]?.clientId ?? null);
      return next;
    });
  }

  function prepareReview() {
    if (regions.length === 0) {
      setError("Agrega al menos una region para continuar.");
      return;
    }
    const renamed = regions.map((region, index) => ({
      ...region,
      nombre: region.nombre.trim() || regionName(baseName, index),
    }));
    setRegions(renamed);
    setSelectedId(renamed[0]?.clientId ?? null);
    setError("");
    setStep(3);
  }

  async function commit() {
    if (!analysis || regions.length === 0) return;
    const emptyName = regions.find((region) => !region.nombre.trim());
    if (emptyName) {
      setSelectedId(emptyName.clientId);
      setError("Todas las indexaciones necesitan un nombre.");
      return;
    }
    setBusy("Creando atlas, GRHs e indices...");
    setError("");
    try {
      const response = await fetch("/api/indexer/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: analysis.jobId, regions }),
      });
      const body = (await response.json()) as { result?: CommitResult; error?: string };
      if (!response.ok || !body.result) throw new Error(body.error ?? "No se pudo publicar la indexacion.");
      setResult(body.result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo publicar la indexacion.");
    } finally {
      setBusy("");
    }
  }

  function resetFlow() {
    setStep(1);
    setFile(null);
    setAnalysis(null);
    setRegions([]);
    setSelectedId(null);
    setResult(null);
    setError("");
  }

  return (
    <div className="map-indexer">
      <header className="indexer-header">
        <div>
          <p className="indexer-kicker">GRAFICOS DE MAPA</p>
          <h1>Indexador</h1>
          <p>Detecta, ajusta y publica piezas listas para usar desde la paleta del editor.</p>
        </div>
        <div className="indexer-steps" aria-label="Progreso">
          {["Origen", "Seleccion", "Revision"].map((label, index) => (
            <div key={label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""}>
              <span>{index + 1}</span>{label}
            </div>
          ))}
        </div>
      </header>

      {step === 1 ? (
        <div className="indexer-onboarding">
          <section className="indexer-panel upload-panel">
            <div className="indexer-panel-title">
              <span className="panel-number">1</span>
              <div><strong>Subir grafico</strong><small>PNG o WebP, hasta 30 MB</small></div>
            </div>
            <label className={`indexer-dropzone ${file ? "has-file" : ""}`}>
              <input
                type="file"
                accept="image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="drop-mark">+</span>
              <strong>{file?.name ?? "Seleccionar una hoja de graficos"}</strong>
              <small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "La imagen se conserva sin escalar"}</small>
            </label>
          </section>

          <section className="indexer-panel setup-panel">
            <div className="indexer-panel-title">
              <span className="panel-number">2</span>
              <div><strong>Tipo de contenido</strong><small>Define como se detectan y ubican las piezas</small></div>
            </div>
            <div className="layer-choice-grid">
              {LAYERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={layer === item.id ? "selected" : ""}
                  onClick={() => setLayer(item.id)}
                >
                  <span>{item.id}</span><strong>{item.title}</strong><small>{item.description}</small>
                </button>
              ))}
            </div>
            <label className="indexer-field wide">
              <span>Nombre base</span>
              <input value={baseName} onChange={(event) => setBaseName(event.target.value)} placeholder="Ej. Templo - Muros" />
            </label>
            {layer === 1 ? (
              <div className="floor-grid-config">
                <div><strong>Agrupar pisos</strong><small>Cada grupo sera una indexacion independiente.</small></div>
                <NumberField label="Ancho" value={groupWidth} min={1} max={64} suffix="tiles" onChange={setGroupWidth} />
                <NumberField label="Alto" value={groupHeight} min={1} max={64} suffix="tiles" onChange={setGroupHeight} />
              </div>
            ) : (
              <div className="indexer-note">
                La app separara automaticamente cada pieza visible. En el paso siguiente podes mover, redimensionar, eliminar o agregar selecciones.
              </div>
            )}
          </section>

          <div className="indexer-footer-actions">
            <span>{error || busy}</span>
            <button className="indexer-primary" type="button" onClick={() => void analyze()} disabled={!file || Boolean(busy)}>
              Analizar grafico
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 && analysis ? (
        <div className="selection-workspace">
          <section className="indexer-panel canvas-panel">
            <div className="canvas-toolbar">
              <div>
                <strong>Areas detectadas</strong>
                <small>{analysis.width} x {analysis.height}px - {regions.length} selecciones</small>
              </div>
              {layer === 1 ? (
                <div className="inline-grid-controls">
                  <NumberField label="Grupo W" value={groupWidth} min={1} max={64} onChange={setGroupWidth} />
                  <NumberField label="Grupo H" value={groupHeight} min={1} max={64} onChange={setGroupHeight} />
                  <button type="button" className="indexer-button" onClick={regenerateFloorGrid}>Regenerar grilla</button>
                </div>
              ) : null}
            </div>
            <SelectionCanvas
              imageUrl={analysis.imageUrl}
              imageWidth={analysis.width}
              imageHeight={analysis.height}
              regions={regions}
              selectedId={selectedId}
              layer={layer}
              onSelect={setSelectedId}
              onChange={updateRegion}
              onCreate={addRegion}
            />
          </section>

          <aside className="indexer-panel selection-sidebar">
            <div className="indexer-panel-title compact">
              <div><strong>Seleccion actual</strong><small>Arrastra el cuadro o sus esquinas</small></div>
            </div>
            {selected ? (
              <>
                <div className="region-index">#{regions.findIndex((region) => region.clientId === selected.clientId) + 1}</div>
                <div className="field-grid two">
                  <NumberField label="X" value={selected.x} min={0} max={analysis.width - 1} onChange={(value) => updateRegion(selected.clientId, { x: value })} />
                  <NumberField label="Y" value={selected.y} min={0} max={analysis.height - 1} onChange={(value) => updateRegion(selected.clientId, { y: value })} />
                  <NumberField label="Ancho px" value={selected.width} min={1} max={analysis.width - selected.x} onChange={(value) => updateRegion(selected.clientId, { width: value, ancho: Math.ceil(value / 32) })} />
                  <NumberField label="Alto px" value={selected.height} min={1} max={analysis.height - selected.y} onChange={(value) => updateRegion(selected.clientId, { height: value, alto: Math.ceil(value / 32) })} />
                  <NumberField label="Tiles W" value={selected.ancho} min={Math.ceil(selected.width / 32)} max={64} onChange={(value) => updateRegion(selected.clientId, { ancho: value })} />
                  <NumberField label="Tiles H" value={selected.alto} min={Math.ceil(selected.height / 32)} max={64} onChange={(value) => updateRegion(selected.clientId, { alto: value })} />
                </div>
                <RegionPreview imageUrl={analysis.imageUrl} region={selected} large />
                <button type="button" className="indexer-button danger" onClick={removeSelected}>Eliminar seleccion</button>
              </>
            ) : <p className="empty-copy">Hace clic sobre un recuadro para editarlo.</p>}
            <div className="selection-summary">
              <span><strong>{regions.length}</strong> indices</span>
              <span><strong>{totalTiles}</strong> GRHs</span>
            </div>
            {error ? <p className="indexer-error">{error}</p> : null}
            <div className="sidebar-actions">
              <button type="button" className="indexer-button" onClick={() => setStep(1)}>Volver</button>
              <button type="button" className="indexer-primary" onClick={prepareReview}>Revisar indices</button>
            </div>
          </aside>
        </div>
      ) : null}

      {step === 3 && analysis ? (
        <div className="review-workspace">
          <section className="indexer-panel review-list-panel">
            <div className="review-heading">
              <div><strong>Indexaciones a crear</strong><small>Confirma nombre, capa y bloqueo de cada pieza.</small></div>
              <div className="review-totals"><span>{regions.length} indices</span><span>{totalTiles} GRHs</span></div>
            </div>
            <div className="review-list">
              {regions.map((region, index) => (
                <button
                  type="button"
                  key={region.clientId}
                  className={`review-row ${selectedId === region.clientId ? "selected" : ""}`}
                  onClick={() => setSelectedId(region.clientId)}
                >
                  <RegionPreview imageUrl={analysis.imageUrl} region={region} />
                  <span className="review-row-copy">
                    <strong>{region.nombre}</strong>
                    <small>#{index + 1} - {region.ancho}x{region.alto} tiles - Capa {region.capa}</small>
                  </span>
                  <span className={`layer-badge layer-${region.capa}`}>C{region.capa}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="indexer-panel review-editor">
            {selected ? (
              <>
                <RegionPreview imageUrl={analysis.imageUrl} region={selected} large />
                <label className="indexer-field wide"><span>Nombre en indices</span><input value={selected.nombre} onChange={(event) => updateRegion(selected.clientId, { nombre: event.target.value })} /></label>
                <div className="indexer-field"><span>Capa</span><div className="layer-segments">
                  {[1, 2, 3, 4].map((value) => <button key={value} type="button" className={selected.capa === value ? "selected" : ""} onClick={() => updateRegion(selected.clientId, { capa: value })}>{value}</button>)}
                </div></div>
                <label className="blocking-toggle"><input type="checkbox" checked={selected.bloquear} onChange={(event) => updateRegion(selected.clientId, { bloquear: event.target.checked })} /><span><strong>Bloquear tiles al colocar</strong><small>Marca la superficie completa como no transitable.</small></span></label>
                <dl className="review-data"><div><dt>Recorte</dt><dd>{selected.width}x{selected.height}px</dd></div><div><dt>Stamp</dt><dd>{selected.ancho}x{selected.alto} tiles</dd></div><div><dt>GRHs</dt><dd>{selected.ancho * selected.alto}</dd></div></dl>
              </>
            ) : null}
            {error ? <p className="indexer-error">{error}</p> : null}
            {result ? (
              <div className="commit-success">
                <strong>Indexacion completada</strong>
                <span>Grafico {result.graphicFile} - GRH {result.firstGrh} a {result.lastGrh}</span>
                <Link href="/indexations">Abrir indexaciones</Link>
                <button type="button" className="indexer-button" onClick={resetFlow}>Indexar otra hoja</button>
              </div>
            ) : (
              <div className="sidebar-actions review-actions">
                <button type="button" className="indexer-button" onClick={() => setStep(2)}>Ajustar areas</button>
                <button type="button" className="indexer-primary" disabled={Boolean(busy)} onClick={() => void commit()}>{busy || "Crear indexaciones"}</button>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function NumberField({ label, value, min, max, suffix, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return <label className="number-field"><span>{label}</span><span className="number-control"><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(clamp(Number(event.target.value), min, max))} />{suffix ? <small>{suffix}</small> : null}</span></label>;
}

function RegionPreview({ imageUrl, region, large = false }: { imageUrl: string; region: IndexRegion; large?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const image = new Image();
    image.onload = () => {
      const width = region.ancho * 32;
      const height = region.alto * 32;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = false;
      context.drawImage(
        image,
        region.x,
        region.y,
        region.width,
        region.height,
        Math.floor((width - region.width) / 2),
        height - region.height,
        region.width,
        region.height,
      );
    };
    image.src = imageUrl;
  }, [imageUrl, region]);
  return <span className={`region-preview ${large ? "large" : ""}`}><canvas ref={ref} /></span>;
}

type DragState = {
  kind: "move" | "resize" | "create";
  clientId?: string;
  handle?: "nw" | "ne" | "se" | "sw";
  startX: number;
  startY: number;
  original?: IndexRegion;
  draft?: SourceBox;
};

function SelectionCanvas(props: {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  regions: IndexRegion[];
  selectedId: string | null;
  layer: number;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<IndexRegion>) => void;
  onCreate: (box: SourceBox) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imageRevision, setImageRevision] = useState(0);
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<SourceBox | null>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      const available = Math.max(320, (wrapRef.current?.clientWidth ?? 900) - 32);
      setZoom(Math.min(1, available / props.imageWidth, 620 / props.imageHeight));
      setImageRevision((value) => value + 1);
    };
    image.src = props.imageUrl;
  }, [props.imageUrl, props.imageHeight, props.imageWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    canvas.width = props.imageWidth;
    canvas.height = props.imageHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0);
    if (props.layer === 1) {
      context.strokeStyle = "rgba(255,255,255,.17)";
      context.lineWidth = 1 / Math.max(zoom, 0.1);
      for (let x = 32; x < props.imageWidth; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, props.imageHeight); context.stroke(); }
      for (let y = 32; y < props.imageHeight; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(props.imageWidth, y); context.stroke(); }
    }
    const drawBox = (box: SourceBox, index: number, selected: boolean, dashed = false) => {
      context.save();
      context.fillStyle = selected ? "rgba(250, 204, 21, .12)" : "rgba(34, 211, 238, .08)";
      context.strokeStyle = selected ? "#facc15" : "#22d3ee";
      context.lineWidth = (selected ? 3 : 2) / Math.max(zoom, 0.1);
      if (dashed) context.setLineDash([8 / zoom, 5 / zoom]);
      context.fillRect(box.x, box.y, box.width, box.height);
      context.strokeRect(box.x, box.y, box.width, box.height);
      if (!dashed) {
        const fontSize = 13 / Math.max(zoom, 0.35);
        context.font = `600 ${fontSize}px ui-sans-serif`;
        context.fillStyle = selected ? "#171717" : "#06151a";
        const badgeWidth = Math.max(24 / zoom, context.measureText(String(index + 1)).width + 10 / zoom);
        context.fillStyle = selected ? "#facc15" : "#22d3ee";
        context.fillRect(box.x, box.y, badgeWidth, 21 / zoom);
        context.fillStyle = "#061014";
        context.fillText(String(index + 1), box.x + 5 / zoom, box.y + 15 / zoom);
      }
      if (selected) {
        const size = 9 / zoom;
        context.fillStyle = "#facc15";
        for (const [x, y] of [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]]) {
          context.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
      context.restore();
    };
    props.regions.forEach((region, index) => drawBox(region, index, region.clientId === props.selectedId));
    if (draft) drawBox(draft, props.regions.length, true, true);
  }, [props, draft, zoom, imageRevision]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) * props.imageWidth / rect.width, 0, props.imageWidth),
      y: clamp((event.clientY - rect.top) * props.imageHeight / rect.height, 0, props.imageHeight),
    };
  }

  function snap(value: number) {
    return props.layer === 1 ? Math.round(value / 32) * 32 : Math.round(value);
  }

  function normalized(box: SourceBox): SourceBox {
    const x1 = clamp(snap(Math.min(box.x, box.x + box.width)), 0, props.imageWidth - 1);
    const y1 = clamp(snap(Math.min(box.y, box.y + box.height)), 0, props.imageHeight - 1);
    const x2 = clamp(snap(Math.max(box.x, box.x + box.width)), x1 + 1, props.imageWidth);
    const y2 = clamp(snap(Math.max(box.y, box.y + box.height)), y1 + 1, props.imageHeight);
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  function handleAt(region: IndexRegion, x: number, y: number): DragState["handle"] | null {
    const threshold = 11 / Math.max(zoom, 0.2);
    const handles: Array<[DragState["handle"], number, number]> = [
      ["nw", region.x, region.y], ["ne", region.x + region.width, region.y],
      ["se", region.x + region.width, region.y + region.height], ["sw", region.x, region.y + region.height],
    ];
    return handles.find(([, hx, hy]) => Math.hypot(hx - x, hy - y) <= threshold)?.[0] ?? null;
  }

  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = point(event);
    if (addMode) {
      dragRef.current = { kind: "create", startX: current.x, startY: current.y };
      setDraft({ x: current.x, y: current.y, width: 0, height: 0 });
      return;
    }
    const selected = props.regions.find((region) => region.clientId === props.selectedId);
    if (selected) {
      const handle = handleAt(selected, current.x, current.y);
      if (handle) {
        dragRef.current = { kind: "resize", clientId: selected.clientId, handle, startX: current.x, startY: current.y, original: { ...selected } };
        return;
      }
    }
    const hit = [...props.regions].reverse().find((region) => current.x >= region.x && current.x <= region.x + region.width && current.y >= region.y && current.y <= region.y + region.height);
    if (!hit) { props.onSelect(null); return; }
    props.onSelect(hit.clientId);
    dragRef.current = { kind: "move", clientId: hit.clientId, startX: current.x, startY: current.y, original: { ...hit } };
  }

  function pointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const current = point(event);
    if (drag.kind === "create") {
      setDraft({ x: drag.startX, y: drag.startY, width: current.x - drag.startX, height: current.y - drag.startY });
      return;
    }
    if (!drag.clientId || !drag.original) return;
    const dx = current.x - drag.startX;
    const dy = current.y - drag.startY;
    if (drag.kind === "move") {
      props.onChange(drag.clientId, {
        x: clamp(snap(drag.original.x + dx), 0, props.imageWidth - drag.original.width),
        y: clamp(snap(drag.original.y + dy), 0, props.imageHeight - drag.original.height),
      });
      return;
    }
    let left = drag.original.x;
    let top = drag.original.y;
    let right = drag.original.x + drag.original.width;
    let bottom = drag.original.y + drag.original.height;
    if (drag.handle?.includes("w")) left += dx;
    if (drag.handle?.includes("e")) right += dx;
    if (drag.handle?.includes("n")) top += dy;
    if (drag.handle?.includes("s")) bottom += dy;
    const box = normalized({ x: left, y: top, width: right - left, height: bottom - top });
    props.onChange(drag.clientId, { ...box, ancho: Math.ceil(box.width / 32), alto: Math.ceil(box.height / 32) });
  }

  function pointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.kind === "create" && draft) {
      const box = normalized(draft);
      if (box.width >= 8 && box.height >= 8) props.onCreate(box);
      setDraft(null);
      setAddMode(false);
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div className="selection-canvas-shell">
    <div className="selection-canvas-actions">
      <button type="button" className={`indexer-button ${addMode ? "active" : ""}`} onClick={() => setAddMode((value) => !value)}>+ Agregar area</button>
      <label>Zoom<input type="range" min={0.15} max={2} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><strong>{Math.round(zoom * 100)}%</strong></label>
    </div>
    <div className={`selection-canvas-scroll ${addMode ? "adding" : ""}`} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        style={{ width: props.imageWidth * zoom, height: props.imageHeight * zoom }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      />
    </div>
  </div>;
}
