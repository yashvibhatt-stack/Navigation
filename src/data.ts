export type Camera = { id: string; channel: string; name: string; nvrId: string; online: boolean; feed: number; ip: string; noIndicator?: boolean };
export type Nvr = { id: string; name: string; status: "positive" | "negative"; count: string };

export const nvrs: Nvr[] = [
  { id: "ho", name: "NVR Head Office", status: "positive", count: "7/10" },
  { id: "wh", name: "NVR Warehouse", status: "positive", count: "16/16" },
  { id: "pk", name: "NVR Parking", status: "negative", count: "0/8" },
];

// feed = index into the exported camera images (camera-01 … camera-09)
const cam = (nvrId: string, channel: string, name: string, feed: number, online = true): Camera => ({
  id: `${nvrId}-${channel}`,
  channel,
  name,
  nvrId,
  online,
  feed,
  ip: `192.168.${nvrId === "ho" ? 1 : nvrId === "wh" ? 2 : 3}.${20 + Number(channel)}`,
});

export const cameras: Camera[] = [
  cam("ho", "01", "Lobby Reception", 0),
  cam("ho", "02", "Lobby Elevators", 1),
  cam("ho", "03", "Lobby Entrance", 2),
  cam("ho", "04", "Parking Basement Level 2", 3),
  cam("ho", "05", "Loading Bay", 4),
  { ...cam("ho", "06", "Warehouse Aisle 1", 5), noIndicator: true }, // live, but the tree shows no status dot (per Figma)
  cam("ho", "07", "Lobby West", 6),
  cam("ho", "08", "Corridor East", 7),
  cam("ho", "09", "Warehouse Aisle 2", 8),
  cam("ho", "10", "Rooftop", 7),
  cam("ho", "12", "Gate 1", 2),
  cam("ho", "13", "Gate 2", 5),
  cam("wh", "01", "Dock 1", 4),
  cam("wh", "02", "Dock 2", 5),
  cam("wh", "03", "Dock 3", 8),
  cam("wh", "04", "Cold Storage", 8),
  cam("pk", "01", "Entry Ramp", 3, false),
  cam("pk", "02", "Exit Ramp", 3, false),
  cam("pk", "03", "Gate Exit", 3, false),
];

export const cameraById = (id: string) => cameras.find((c) => c.id === id)!;
