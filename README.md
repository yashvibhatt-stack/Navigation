# Navigation exploration

Copy of the Live View experiment, used to explore the top navigation: logo, a centred global search for cameras and users, and the existing events / account controls. The left nav rail is unchanged.

## Global search (what to try)
- Click the search (or press `/` or `Ctrl/Cmd+K`): it widens and shows **Recent searches**. `Del` removes the highlighted one, **Clear all** empties the list.
- Type `yashvi`: two users, **Yashvi Bhatt (Admin)** and **Yashvi Desai (Operator)**.
- Type `gate`: cameras, each with the **NVR** it records on (Gate 1 and Gate 2 on NVR Head Office, Gate Exit on NVR Parking).
- Use the All / Cameras / Users chips, `↑ ↓` + `Enter`, `Esc` to clear then close. Try `gat3` for the no-results state.
- Picking a camera opens it in the grid (replacing a tile if it is not already shown); picking a user shows a confirmation toast.

The earlier flows are still available at `/#build` and `/#alarm`.

---

# Original Live View experiment

React + TypeScript + Vite prototypes of the Matrix SATATYA **Live View** flows from the Figma file
*Live View – Playback Exploration*. Styling is plain CSS driven by design tokens
(`src/styles/tokens.css`, mirrored from the Figma variables); components follow the design-system
names and props (Badge, IconButton, Toggle, Tabs, NavRail, Topbar, VideoTile, Toast, Dialog, StyleListItem…).

```
npm install
npm run dev
```

## Flows
| URL | Flow | Figma |
| --- | --- | --- |
| `/` | **Building a view** – search, drag & drop, replace / move, layout, save as style, Styles tab | J3-1 … J3-12 |
| `/#alarm` | **Critical alarm arrives** | J6-1 |

### Building a view – what to try
- **Search** the camera tree (try `gate`, then `gat3`). Matches are highlighted, groups show "N found".
- **Drag** a camera onto the grid. Empty tiles say *Drop to show here*; an occupied tile says *Drop to replace*. `Esc` cancels.
- Drag a camera that is **already on a tile** → it moves (no duplicates). Drag a tile by its header → swap.
- **Double-click** a camera → opens in the next free tile. Double-click a tile → 1×1, `Esc` goes back.
- **Layout** menu (toolbar) re-flows cameras across pages; every change has **Undo** in a toast.
- **Save as style** (toolbar) → duplicate-name error → "5 styles" limit → pick one to replace.
- **Styles** tab → click a style to apply it (the *Perimeter* style has a camera you have no access to).
- `PageUp` / `PageDown` change page.

## Assets
Icons and camera feeds are exported from Figma into `public/assets/icons` and `public/assets/images`
(names are listed in `src/assets.ts`).
