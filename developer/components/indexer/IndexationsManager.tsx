"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Indexation = {
  ordinal: number;
  id: number;
  nombre: string;
  grhIndice: number;
  ancho: number;
  alto: number;
  capa: number;
  bloquear: boolean;
  duplicateCount: number;
};

type IndexationsResponse = {
  items: Indexation[];
  total: number;
  page: number;
  pages: number;
  revision: number;
  duplicates: number;
  error?: string;
};

export function IndexationsManager() {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState(0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IndexationsResponse | null>(null);
  const [selectedOrdinal, setSelectedOrdinal] = useState<number | null>(null);
  const [draft, setDraft] = useState<Indexation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: query, layer: String(layer), page: String(nextPage), limit: "80" });
      const response = await fetch(`/api/indexations?${params}`);
      const body = (await response.json()) as IndexationsResponse;
      if (!response.ok) throw new Error(body.error ?? "No se pudieron cargar las indexaciones.");
      setData(body);
      setPage(body.page);
      const selected = body.items.find((item) => item.ordinal === selectedOrdinal) ?? body.items[0] ?? null;
      setSelectedOrdinal(selected?.ordinal ?? null);
      setDraft(selected ? { ...selected } : null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar las indexaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), 180);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, layer]);

  const dirty = useMemo(() => {
    if (!draft || !data) return false;
    const original = data.items.find((item) => item.ordinal === draft.ordinal);
    if (!original) return false;
    return ["nombre", "grhIndice", "ancho", "alto", "capa", "bloquear"].some(
      (key) => original[key as keyof Indexation] !== draft[key as keyof Indexation],
    );
  }, [data, draft]);

  function select(item: Indexation) {
    if (dirty && !window.confirm("Hay cambios sin guardar. Queres descartarlos?")) return;
    setSelectedOrdinal(item.ordinal);
    setDraft({ ...item });
    setMessage("");
    setError("");
  }

  function update(patch: Partial<Indexation>) {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (next.capa !== 1) {
        next.ancho = 1;
        next.alto = 1;
      }
      return next;
    });
    setMessage("");
  }

  async function save() {
    if (!draft || !data) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/indexations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordinal: draft.ordinal,
          revision: data.revision,
          value: {
            nombre: draft.nombre,
            grhIndice: draft.grhIndice,
            ancho: draft.ancho,
            alto: draft.alto,
            capa: draft.capa,
            bloquear: draft.bloquear,
          },
        }),
      });
      const body = (await response.json()) as { item?: Indexation; revision?: number; error?: string };
      if (!response.ok || !body.item || body.revision == null) throw new Error(body.error ?? "No se pudo guardar.");
      setData((current) => current ? {
        ...current,
        revision: body.revision!,
        items: current.items.map((item) => item.ordinal === body.item!.ordinal ? body.item! : item),
      } : current);
      setDraft({ ...body.item });
      setMessage("Cambios guardados en indices.ini.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = draft
    ? `/api/indexations/preview?grh=${draft.grhIndice}&ancho=${draft.ancho}&alto=${draft.alto}&capa=${draft.capa}&max=760&v=${data?.revision ?? 0}`
    : "";

  return <div className="indexations-page">
    <header className="indexations-header">
      <div>
        <p className="indexer-kicker">CATALOGO DE MAPAS</p>
        <h1>Indexaciones</h1>
        <p>Busca, previsualiza y corrige los stamps disponibles en el editor.</p>
      </div>
      <Link className="indexer-primary" href="/indexer">+ Nueva indexacion</Link>
    </header>

    <div className="indexations-toolbar">
      <label className="indexation-search"><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, referencia o GRH..." /></label>
      <div className="layer-filter" aria-label="Filtrar por capa">
        {[0, 1, 2, 3, 4].map((value) => <button key={value} type="button" className={layer === value ? "selected" : ""} onClick={() => setLayer(value)}>{value === 0 ? "Todas" : `Capa ${value}`}</button>)}
      </div>
      <div className="catalog-stats">
        <span><strong>{data?.total ?? 0}</strong> resultados</span>
        <span title="Entradas cuyo numero de referencia aparece mas de una vez en el archivo legado"><strong>{data?.duplicates ?? 0}</strong> duplicadas</span>
      </div>
    </div>

    <div className="indexations-shell">
      <section className="indexer-panel indexations-list-panel">
        <div className="indexations-list-head"><span>Nombre</span><span>Stamp</span><span>Capa</span></div>
        <div className="indexations-list">
          {loading ? <p className="empty-copy">Cargando indexaciones...</p> : null}
          {!loading && data?.items.length === 0 ? <p className="empty-copy">No hay resultados con esos filtros.</p> : null}
          {data?.items.map((item) => (
            <button key={item.ordinal} type="button" className={selectedOrdinal === item.ordinal ? "selected" : ""} onClick={() => select(item)}>
              <span className="indexation-name"><strong>{item.nombre}</strong><small>Ref {item.id} - GRH {item.grhIndice}{item.duplicateCount > 1 ? ` - ID repetido x${item.duplicateCount}` : ""}</small></span>
              <span>{item.capa === 1 ? `${item.ancho} x ${item.alto}` : "1 tile"}</span>
              <span className={`layer-badge layer-${item.capa || 1}`}>{item.capa ? `C${item.capa}` : "S/C"}</span>
            </button>
          ))}
        </div>
        <div className="pagination">
          <button type="button" disabled={!data || data.page <= 1 || loading} onClick={() => void load(page - 1)}>Anterior</button>
          <span>Pagina {data?.page ?? 1} de {data?.pages ?? 1}</span>
          <button type="button" disabled={!data || data.page >= data.pages || loading} onClick={() => void load(page + 1)}>Siguiente</button>
        </div>
      </section>

      <section className="indexer-panel indexation-preview-panel">
        <div className="indexer-panel-title compact"><div><strong>Vista previa</strong><small>{draft?.capa === 1 ? "Composicion del stamp 32x32" : "GRH unico a tamaño real"}</small></div></div>
        {draft ? <div className="indexation-preview-stage">
          {/* The image comes from the authenticated preview endpoint. */}
          <img key={previewUrl} src={previewUrl} alt={`Vista previa de ${draft.nombre}`} />
        </div> : <p className="empty-copy">Selecciona una indexacion.</p>}
        {draft ? <div className="preview-meta"><span>{draft.capa === 1 ? `${draft.ancho * 32} x ${draft.alto * 32}px` : "Tamaño del GRH"}</span><span>{draft.capa === 1 ? `${draft.ancho * draft.alto} GRHs` : "1 GRH"}</span><span>{draft.bloquear ? "Bloquea" : "No bloquea"}</span></div> : null}
      </section>

      <aside className="indexer-panel indexation-editor">
        <div className="indexer-panel-title compact"><div><strong>Propiedades</strong><small>{dirty ? "Cambios sin guardar" : "Archivo sincronizado"}</small></div></div>
        {draft ? <>
          <div className="readonly-id"><span>Referencia</span><strong>#{draft.id}</strong>{draft.duplicateCount > 1 ? <small>Este ID aparece {draft.duplicateCount} veces; se edita esta entrada exacta.</small> : null}</div>
          <label className="indexer-field wide"><span>Nombre</span><input value={draft.nombre} onChange={(event) => update({ nombre: event.target.value })} /></label>
          <label className="indexer-field wide"><span>GRH inicial</span><input type="number" min={1} value={draft.grhIndice} onChange={(event) => update({ grhIndice: Math.max(1, Number(event.target.value)) })} /></label>
          {draft.capa === 1 ? (
            <div className="field-grid two">
              <EditorNumber label="Ancho" value={draft.ancho} onChange={(value) => update({ ancho: value })} />
              <EditorNumber label="Alto" value={draft.alto} onChange={(value) => update({ alto: value })} />
            </div>
          ) : (
            <p className="empty-copy">Capa {draft.capa}: siempre 1 tile (el GRH conserva su tamaño en px).</p>
          )}
          <div className="indexer-field"><span>Capa predeterminada</span><div className="layer-segments">
            {[1, 2, 3, 4].map((value) => <button key={value} type="button" className={draft.capa === value ? "selected" : ""} onClick={() => update({ capa: value })}>{value}</button>)}
          </div></div>
          <label className="blocking-toggle"><input type="checkbox" checked={draft.bloquear} onChange={(event) => update({ bloquear: event.target.checked })} /><span><strong>Bloquear al colocar</strong><small>Los tiles ocupados se marcan como bloqueados.</small></span></label>
          {message ? <p className="indexer-success-message">{message}</p> : null}
          {error ? <p className="indexer-error">{error}</p> : null}
          <div className="editor-actions">
            <button type="button" className="indexer-button" disabled={!dirty} onClick={() => {
              const original = data?.items.find((item) => item.ordinal === draft.ordinal);
              if (original) setDraft({ ...original });
            }}>Descartar</button>
            <button type="button" className="indexer-primary" disabled={!dirty || saving} onClick={() => void save()}>{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </> : <p className="empty-copy">Selecciona una indexacion para editarla.</p>}
      </aside>
    </div>
  </div>;
}

function EditorNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><span className="number-control"><input type="number" min={1} max={64} value={value} onChange={(event) => onChange(Math.min(64, Math.max(1, Number(event.target.value))))} /><small>tiles</small></span></label>;
}
