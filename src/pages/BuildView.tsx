import { useCallback, useEffect, useMemo, useState } from "react";
import { icons } from "../assets";
import { Input, Tabs } from "../components/atoms";
import { DragProvider, useDrag } from "../components/drag";
import { CameraTree } from "../components/liveview/CameraTree";
import { SaveStyleDialog, type SaveResult } from "../components/liveview/SaveStyleDialog";
import { Toolbar } from "../components/liveview/Toolbar";
import { VideoTile, type DropState } from "../components/liveview/VideoTile";
import { StyleListItem, SwitchField } from "../components/molecules";
import { NavRail, Topbar } from "../components/organisms";
import { ToastProvider, useToast } from "../components/toast";
import {
  applyDrop,
  clonePages,
  cloneStyleView,
  countCameras,
  initialStyles,
  layoutById,
  openCamera,
  reflow,
  type DragSource,
  type LayoutId,
  type Style,
  type View,
} from "../state/view";

/** "Building a view" flow (J3-1 … J3-12): search → drag → replace/move → layout → save as style → styles tab. */
export default function BuildView() {
  return (
    <ToastProvider>
      <Workspace />
    </ToastProvider>
  );
}

function Workspace() {
  const toast = useToast();

  const [nav, setNav] = useState("home");
  const [mode, setMode] = useState<"live" | "playback">("live");
  const [panelTab, setPanelTab] = useState<"cameras" | "styles">("cameras");
  const [query, setQuery] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ ho: true });
  const [highlighted, setHighlighted] = useState<string | null>("ho-02"); // row highlight in the tree

  const [styles, setStyles] = useState<Style[]>(initialStyles);
  const [view, setView] = useState<View>(() => cloneStyleView(initialStyles[0]));
  const [page, setPage] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const [interval, setIntervalSec] = useState("10");
  const [saving, setSaving] = useState(false);

  const pages = view.pages.length;
  const currentStyle = styles.find((s) => s.id === view.styleId);

  // keep the current page valid when the page count shrinks (re-flow, undo, style switch)
  useEffect(() => {
    if (page > pages - 1) setPage(pages - 1);
  }, [page, pages]);

  /** Change the view and offer Undo. */
  const commit = useCallback(
    (next: View, message: string, after?: () => void) => {
      const prev = view;
      setView(next);
      after?.();
      toast.push(message, { label: "Undo", onClick: () => setView(prev) });
    },
    [view, toast],
  );

  const handleDrop = useCallback(
    (source: DragSource, tileIndex: number) => {
      const r = applyDrop(view, source, page, tileIndex);
      if (!r) return;
      commit(r.view, r.message, () => {
        setSelectedTile(tileIndex);
        setHighlighted(source.cameraId);
        setZoomed(null);
      });
    },
    [view, page, commit],
  );

  const handleOpen = (cameraId: string) => {
    const r = openCamera(view, cameraId, page, selectedTile);
    setHighlighted(cameraId);
    setPage(r.page);
    setSelectedTile(r.index);
    setZoomed(null);
    if (r.view === view) toast.push(r.message);
    else commit(r.view, r.message);
  };

  const closeTile = (index: number) => {
    const pagesNext = clonePages(view.pages);
    pagesNext[page][index] = null;
    setView({ ...view, pages: pagesNext });
    setZoomed(null);
  };

  const closeAll = () => {
    if (countCameras(view) === 0) return toast.push("There are no open windows");
    commit({ ...view, pages: view.pages.map((p) => p.map(() => null)) }, "All windows closed", () => {
      setSelectedTile(null);
      setZoomed(null);
    });
  };

  const changeLayout = (id: LayoutId) => {
    if (id === view.layout) return;
    const next = reflow(view, id);
    const n = countCameras(next);
    const msg = n === 0 ? `Layout changed to ${layoutById(id).label}` : `${n} ${n === 1 ? "camera" : "cameras"} now ${next.pages.length === 1 ? "fit on 1 page" : `span ${next.pages.length} pages`}`;
    commit(next, msg, () => {
      setPage(0);
      setSelectedTile(null);
      setZoomed(null);
    });
  };

  const applyStyle = (id: string) => {
    const s = styles.find((x) => x.id === id);
    if (!s) return;
    setView(cloneStyleView(s));
    setPage(0);
    setSelectedTile(null);
    setZoomed(null);
  };

  const saveStyle = ({ name, openAtLogin, replaceId }: SaveResult) => {
    const prevStyles = styles;
    const prevStyleId = view.styleId;
    const replaced = replaceId ? styles.find((s) => s.id === replaceId) : undefined;
    const created: Style = { id: `style-${Date.now()}`, name, layout: view.layout, isDefault: openAtLogin, pages: clonePages(view.pages) };
    const rest = prevStyles.filter((s) => s.id !== replaceId).map((s) => (openAtLogin ? { ...s, isDefault: false } : s));
    setStyles([created, ...rest]);
    setView((v) => ({ ...v, styleId: created.id }));
    setPanelTab("styles");
    setSaving(false);
    toast.push(`Saved as “${name}”${replaced ? ` (replaced ${replaced.name})` : ""}`, {
      label: "Undo",
      onClick: () => {
        setStyles(prevStyles);
        setView((v) => ({ ...v, styleId: prevStyleId }));
      },
    });
  };

  // slideshow: auto-advance pages
  useEffect(() => {
    if (!slideshow || pages < 2) return;
    const t = window.setInterval(() => setPage((p) => (p + 1) % pages), Number(interval) * 1000);
    return () => window.clearInterval(t);
  }, [slideshow, interval, pages]);

  // keyboard: PageUp / PageDown, Esc leaves 1×1
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, [role=dialog]")) return;
      if (e.key === "PageDown") setPage((p) => Math.min(pages - 1, p + 1));
      if (e.key === "PageUp") setPage((p) => Math.max(0, p - 1));
      if (e.key === "Escape") setZoomed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages]);

  const goToPage = (p: number) => {
    setPage(p);
    setSelectedTile(null);
    setZoomed(null);
  };

  return (
    <DragProvider onDrop={handleDrop}>
      <div className="app">
        <Topbar deviceName="NVR Head Office" notificationCount={12} notificationStatus="unread" account={{ name: "Yashvi Bhatt", initials: "YB", role: "Admin" }} />
        <div className="live-view__body">
          <NavRail active={nav} onChange={setNav} />

          <aside className="live-view__camera-panel" aria-label="Camera panel">
            <Tabs
              fill
              ariaLabel="Camera panel"
              tabs={[
                { id: "cameras", label: "Cameras" },
                { id: "styles", label: "Styles" },
              ]}
              value={panelTab}
              onValueChange={setPanelTab}
            />
            {panelTab === "cameras" ? (
              <>
                <Input iconLeft={icons.search} placeholder="Search cameras" ariaLabel="Search cameras" value={query} onChange={setQuery} onClear={() => setQuery("")} />
                <SwitchField label="Show online only" checked={onlineOnly} onCheckedChange={setOnlineOnly} />
                <CameraTree
                  query={query}
                  onlineOnly={onlineOnly}
                  open={open}
                  onToggle={(id) => setOpen((o) => ({ ...o, [id]: !o[id] }))}
                  highlightedId={highlighted}
                  onHighlight={(id) => setHighlighted(id)}
                  onOpen={handleOpen}
                  onClearSearch={() => setQuery("")}
                />
              </>
            ) : (
              <div className="live-view__styles-list" role="list">
                {styles.map((s) => (
                  <StyleListItem key={s.id} name={s.name} layout={layoutById(s.layout).label} isDefault={s.isDefault} selected={s.id === view.styleId} onSelect={() => applyStyle(s.id)} />
                ))}
              </div>
            )}
          </aside>

          <main className="live-view__main">
            <Toolbar
              styles={styles}
              currentStyleId={view.styleId}
              styleName={currentStyle?.name ?? "Unsaved view"}
              onStyleSelect={applyStyle}
              onSave={() => setSaving(true)}
              mode={mode}
              onModeChange={setMode}
              page={page}
              pages={pages}
              onPageChange={goToPage}
              slideshow={slideshow}
              onSlideshowChange={setSlideshow}
              interval={interval}
              onIntervalChange={setIntervalSec}
              layout={view.layout}
              onLayoutChange={changeLayout}
              onCloseAll={closeAll}
              onFullscreen={() => document.documentElement.requestFullscreen?.().catch(() => {})}
            />
            <Grid view={view} page={page} selectedTile={selectedTile} zoomed={zoomed} onSelect={(i, id) => { setSelectedTile(i); if (id) setHighlighted(id); }} onClose={closeTile} onZoom={(i) => setZoomed((z) => (z === i ? null : i))} />
          </main>
        </div>

        {saving && <SaveStyleDialog styles={styles} initialName={currentStyle?.name ?? ""} onCancel={() => setSaving(false)} onSave={saveStyle} />}
      </div>
    </DragProvider>
  );
}

type GridProps = {
  view: View;
  page: number;
  selectedTile: number | null;
  zoomed: number | null;
  onSelect: (index: number, cameraId?: string) => void;
  onClose: (index: number) => void;
  onZoom: (index: number) => void;
};

function Grid({ view, page, selectedTile, zoomed, onSelect, onClose, onZoom }: GridProps) {
  const { drag, begin } = useDrag();
  const layout = layoutById(view.layout);
  const slots = view.pages[Math.min(page, view.pages.length - 1)];
  const single = zoomed !== null;

  const gridStyle = useMemo(
    () =>
      single
        ? { gridTemplateColumns: "minmax(0,1fr)", gridTemplateRows: "minmax(0,1fr)" }
        : {
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
            gridTemplateAreas: layout.areas?.map((a) => `"${a}"`).join(" "),
          },
    [single, layout],
  );

  return (
    <div className="live-view__grid" style={gridStyle} data-dragging={!!drag || undefined}>
      {slots.map((slot, i) => {
        if (single && i !== zoomed) return null;
        const isSource = drag?.source.kind === "tile" && drag.source.page === page && drag.source.index === i;
        let dropState: DropState = "none";
        if (drag) {
          if (!slot) dropState = "dropTarget";
          else if (drag.overTile === i && !isSource) dropState = "dropReplace";
        }
        return (
          <VideoTile
            key={i}
            index={i}
            slot={slot}
            selected={selectedTile === i}
            dropState={dropState}
            isDragSource={isSource}
            area={!single && layout.areas ? String.fromCharCode(97 + i) : undefined}
            onSelect={() => onSelect(i, slot ? slot.cameraId : undefined)}
            onClose={() => onClose(i)}
            onZoom={() => onZoom(i)}
            onHeaderPointerDown={(e) => slot && begin({ kind: "tile", page, index: i, cameraId: slot.cameraId }, e)}
          />
        );
      })}
    </div>
  );
}
