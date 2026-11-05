import { cameraById } from "../data";

export type LayoutId = "1x1" | "2x2" | "3x3" | "1+5";
export type Layout = { id: LayoutId; label: string; hint: string; cols: number; rows: number; count: number; areas?: string[] };

export const layouts: Layout[] = [
  { id: "1x1", label: "1×1", hint: "1 camera", cols: 1, rows: 1, count: 1 },
  { id: "2x2", label: "2×2", hint: "4 cameras", cols: 2, rows: 2, count: 4 },
  { id: "3x3", label: "3×3", hint: "9 cameras", cols: 3, rows: 3, count: 9 },
  { id: "1+5", label: "1+5", hint: "1 large, 5 small", cols: 3, rows: 3, count: 6, areas: ["a a b", "a a c", "d e f"] },
];
export const layoutById = (id: LayoutId) => layouts.find((l) => l.id === id)!;

/** A tile's content. `noAccess` = the style references a camera this user can't monitor. */
export type Slot = { cameraId: string; noAccess?: boolean } | null;
export type View = { layout: LayoutId; pages: Slot[][]; styleId: string | null };
export type Style = { id: string; name: string; layout: LayoutId; isDefault?: boolean; pages: Slot[][] };

export const MAX_STYLES = 5;

const emptyPage = (count: number): Slot[] => Array(count).fill(null);
const toSlots = (ids: (string | { id: string; noAccess: true })[], count: number, totalPages: number): Slot[][] => {
  const slots: Slot[] = ids.map((i) => (typeof i === "string" ? { cameraId: i } : { cameraId: i.id, noAccess: true }));
  const pages: Slot[][] = [];
  for (let p = 0; p < Math.max(totalPages, Math.ceil(slots.length / count)); p++) {
    const page = slots.slice(p * count, (p + 1) * count);
    pages.push([...page, ...emptyPage(count - page.length)]);
  }
  return pages;
};

export const initialStyles: Style[] = [
  { id: "main", name: "Main entrance", layout: "3x3", isDefault: true, pages: toSlots(["ho-01", "ho-02", "ho-03", "ho-04", "ho-05", "ho-06", "ho-07", "ho-08", "ho-09"], 9, 4) },
  { id: "perimeter", name: "Perimeter", layout: "3x3", pages: toSlots(["ho-12", "ho-13", "ho-03", { id: "ho-05", noAccess: true }, "ho-10", "pk-03", "ho-08", "ho-07", "ho-06"], 9, 4) },
  { id: "parking", name: "Parking", layout: "2x2", pages: toSlots(["ho-04", "ho-12", "ho-13", "pk-03"], 4, 1) },
  { id: "warehouse", name: "Warehouse", layout: "3x3", pages: toSlots(["ho-06", "ho-09", "ho-05", "wh-01", "wh-02", "wh-03", "wh-04", "ho-08", "ho-10"], 9, 1) },
  { id: "weekend", name: "Weekend", layout: "1+5", pages: toSlots(["ho-03", "ho-12", "ho-13", "ho-01", "ho-02", "ho-10"], 6, 1) },
];

export const cloneStyleView = (s: Style): View => ({ layout: s.layout, pages: s.pages.map((p) => p.map((x) => (x ? { ...x } : null))), styleId: s.id });
export const clonePages = (pages: Slot[][]): Slot[][] => pages.map((p) => p.map((x) => (x ? { ...x } : null)));

export const cameraLabel = (cameraId: string) => {
  const c = cameraById(cameraId);
  return `${c.channel} · ${c.name}`;
};

/** Re-flow every assigned camera into pages of the new layout (empty trailing pages are dropped). */
export function reflow(view: View, layout: LayoutId): View {
  const count = layoutById(layout).count;
  const flat = view.pages.flat().filter((s): s is NonNullable<Slot> => s !== null);
  const pages: Slot[][] = [];
  for (let p = 0; p < Math.max(1, Math.ceil(flat.length / count)); p++) {
    const chunk = flat.slice(p * count, (p + 1) * count);
    pages.push([...chunk, ...emptyPage(count - chunk.length)]);
  }
  return { ...view, layout, pages };
}

export const countCameras = (view: View) => view.pages.flat().filter(Boolean).length;

export type DragSource = { kind: "camera"; cameraId: string } | { kind: "tile"; page: number; index: number; cameraId: string };
export type DropResult = { view: View; message: string } | null;

const findCamera = (view: View, cameraId: string): { page: number; index: number } | null => {
  for (let p = 0; p < view.pages.length; p++) {
    const i = view.pages[p].findIndex((s) => s?.cameraId === cameraId);
    if (i !== -1) return { page: p, index: i };
  }
  return null;
};
export { findCamera };

/** Apply a drop. Cameras never appear twice: dropping one that's already on a tile moves it. */
export function applyDrop(view: View, source: DragSource, page: number, index: number): DropResult {
  const pages = clonePages(view.pages);
  const target = pages[page][index];
  const name = cameraById(source.cameraId).name;

  if (source.kind === "tile") {
    if (source.page === page && source.index === index) return null;
    const moving = pages[source.page][source.index];
    pages[source.page][source.index] = target;
    pages[page][index] = moving;
    const message = target ? `${name} and ${cameraById(target.cameraId).name} swapped` : `${name} moved to tile ${index + 1}`;
    return { view: { ...view, pages }, message };
  }

  const existing = findCamera(view, source.cameraId);
  if (existing && existing.page === page && existing.index === index) return null;
  if (existing) pages[existing.page][existing.index] = null;
  pages[page][index] = { cameraId: source.cameraId };
  const message = target
    ? `${name} replaced ${cameraById(target.cameraId).name}`
    : existing
      ? `${name} moved to tile ${index + 1}`
      : `${name} added to tile ${index + 1}`;
  return { view: { ...view, pages }, message };
}

/** "Open" a camera (double-click / Enter): next free tile, else replace the selected tile. */
export function openCamera(view: View, cameraId: string, fromPage: number, selectedTile: number | null): { view: View; page: number; index: number; message: string } {
  const existing = findCamera(view, cameraId);
  const name = cameraById(cameraId).name;
  if (existing) return { view, page: existing.page, index: existing.index, message: `${name} is already on tile ${existing.index + 1}` };
  const n = view.pages.length;
  for (let k = 0; k < n; k++) {
    const p = (fromPage + k) % n;
    const i = view.pages[p].findIndex((s) => s === null);
    if (i !== -1) {
      const pages = clonePages(view.pages);
      pages[p][i] = { cameraId };
      return { view: { ...view, pages }, page: p, index: i, message: `${name} added to tile ${i + 1}` };
    }
  }
  const i = selectedTile ?? 0;
  const pages = clonePages(view.pages);
  const old = pages[fromPage][i];
  pages[fromPage][i] = { cameraId };
  return { view: { ...view, pages }, page: fromPage, index: i, message: old ? `${name} replaced ${cameraById(old.cameraId).name}` : `${name} added to tile ${i + 1}` };
}
