import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { cameraById } from "../data";
import type { DragSource } from "../state/view";
import { StatusDot } from "./atoms";

type ActiveDrag = { source: DragSource; overTile: number | null };

type DragApi = {
  drag: ActiveDrag | null;
  /** Start a (threshold-based) drag from a pointerdown. Plain clicks are left alone. */
  begin: (source: DragSource, e: ReactPointerEvent) => void;
  /** True for the click event that immediately follows a completed drag. */
  wasJustDragged: () => boolean;
};

const DragContext = createContext<DragApi>({ drag: null, begin: () => {}, wasJustDragged: () => false });
export const useDrag = () => useContext(DragContext);

const THRESHOLD = 5;
const OFFSET = 12; // DragPreview sits 12px right/below the cursor

/**
 * Pointer-based drag and drop. Hit-testing reads `data-tile-index` from the element under the cursor,
 * so any tile in the grid is a drop zone. Esc cancels. The preview follows the cursor via a ref (no re-render per move).
 */
export function DragProvider({ children, onDrop }: { children: ReactNode; onDrop: (source: DragSource, tileIndex: number) => void }) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const justDragged = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const place = () => {
    const el = previewRef.current;
    if (el) el.style.transform = `translate(${pointer.current.x + OFFSET}px, ${pointer.current.y + OFFSET}px)`;
  };
  useLayoutEffect(place, [drag?.source]);

  const begin = useCallback((source: DragSource, e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const start = { x: e.clientX, y: e.clientY };
    let active = false;
    let over: number | null = null;

    const hit = (x: number, y: number) => {
      const tile = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>("[data-tile-index]");
      return tile ? Number(tile.dataset.tileIndex) : null;
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", key, true);
      document.body.classList.remove("is-dragging");
    };
    const move = (ev: PointerEvent) => {
      pointer.current = { x: ev.clientX, y: ev.clientY };
      if (!active) {
        if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < THRESHOLD) return;
        active = true;
        document.body.classList.add("is-dragging");
      }
      const next = hit(ev.clientX, ev.clientY);
      if (next !== over || !previewRef.current) {
        over = next;
        setDrag({ source, overTile: next });
      }
      place();
    };
    const up = (ev: PointerEvent) => {
      const wasActive = active;
      const target = wasActive ? hit(ev.clientX, ev.clientY) : null;
      cleanup();
      setDrag(null);
      if (wasActive) {
        justDragged.current = true;
        setTimeout(() => (justDragged.current = false), 0);
        if (target !== null) onDropRef.current(source, target);
      }
    };
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && active) {
        ev.stopPropagation();
        cleanup();
        setDrag(null);
        justDragged.current = true;
        setTimeout(() => (justDragged.current = false), 0);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", key, true);
  }, []);

  useEffect(() => () => document.body.classList.remove("is-dragging"), []);

  const api = useMemo<DragApi>(() => ({ drag, begin, wasJustDragged: () => justDragged.current }), [drag, begin]);

  return (
    <DragContext.Provider value={api}>
      {children}
      {drag && (
        <div ref={previewRef} className="drag-preview" aria-hidden="true">
          <StatusDot variant={cameraById(drag.source.cameraId).online ? "positive" : "negative"} />
          <span className="t-label-sm">
            {cameraById(drag.source.cameraId).channel} · {cameraById(drag.source.cameraId).name}
          </span>
        </div>
      )}
    </DragContext.Provider>
  );
}
