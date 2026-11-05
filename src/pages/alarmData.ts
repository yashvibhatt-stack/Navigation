export type Camera = { channel: string; name: string; isOnline: boolean; feed: number };
export type Nvr = { id: string; name: string; status: "positive" | "negative"; count: string; cameras: Camera[] };

const head = [
  "Lobby Reception",
  "Lobby Elevators",
  "Lobby Entrance",
  "Parking Basement Level 2",
  "Loading Bay",
  "Warehouse Aisle 1",
  "Lobby West",
  "Corridor East",
  "Warehouse Aisle 2",
  "Rooftop",
];

export const nvrs: Nvr[] = [
  {
    id: "head-office",
    name: "NVR Head Office",
    status: "positive",
    count: "7/10",
    cameras: head.map((name, i) => ({
      channel: String(i + 1).padStart(2, "0"),
      name,
      isOnline: name !== "Warehouse Aisle 1",
      feed: i,
    })),
  },
  { id: "warehouse", name: "NVR Warehouse", status: "positive", count: "16/16", cameras: [] },
  { id: "parking", name: "NVR Parking", status: "negative", count: "0/8", cameras: [] },
];

export const TILES_PER_PAGE = 9; // 3×3 layout
export const TOTAL_PAGES = 4;
