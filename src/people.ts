// Mock people + recent searches for the unified VMS + access-management search
export type Role = "Admin" | "Operator" | "Supervisor" | "Viewer";
export type Person = { id: string; name: string; initials: string; username: string; role: Role };

export const people: Person[] = [
  { id: "u1", name: "Yashvi Bhatt", initials: "YB", username: "yashvi.bhatt", role: "Admin" },
  { id: "u2", name: "Yashvi Desai", initials: "YD", username: "yashvi.desai", role: "Operator" },
  { id: "u3", name: "Rahul Shah", initials: "RS", username: "rahul.shah", role: "Operator" },
  { id: "u4", name: "Priya Nair", initials: "PN", username: "priya.nair", role: "Supervisor" },
  { id: "u5", name: "Karan Joshi", initials: "KJ", username: "karan.joshi", role: "Viewer" },
  { id: "u6", name: "Meera Patel", initials: "MP", username: "meera.patel", role: "Operator" },
];

export const personById = (id: string) => people.find((p) => p.id === id)!;

export type Entry = { kind: "camera"; id: string } | { kind: "user"; id: string };

export const initialRecents: Entry[] = [
  { kind: "camera", id: "ho-12" },
  { kind: "user", id: "u2" },
  { kind: "camera", id: "wh-04" },
  { kind: "user", id: "u3" },
];
