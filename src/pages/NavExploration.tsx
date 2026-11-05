import { useCallback, useEffect, useState } from "react";
import { cameraFeeds } from "../assets";
import { NavRail } from "../components/organisms";
import { TopbarV2 } from "../components/search/TopbarV2";
import { ToastProvider, useToast } from "../components/toast";
import { cameraById, cameras, nvrs } from "../data";
import { personById, type Entry } from "../people";

function Screen() {
  const { push } = useToast();
  const [nav, setNav] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [tiles, setTiles] = useState<string[]>(() => cameras.filter((c) => c.nvrId === "ho" && c.online).slice(0, 9).map((c) => c.id));
  const [selected, setSelected] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [flash]);

  const onPick = useCallback(
    (entry: Entry) => {
      if (entry.kind === "camera") {
        const cam = cameraById(entry.id);
        const nvr = nvrs.find((n) => n.id === cam.nvrId)!.name;
        setTiles((t) => (t.includes(cam.id) ? t : [cam.id, ...t.slice(0, 8)]));
        setSelected(cam.id);
        setFlash(cam.id);
        push(`Showing ${cam.name} from ${nvr}`);
      } else {
        const p = personById(entry.id);
        push(`Opening profile: ${p.name} · ${p.role}`);
      }
    },
    [push],
  );

  return (
    <div className="app nav-explore">
      <TopbarV2 notificationCount={12} account={{ name: "Yashvi Bhatt", initials: "YB", role: "Admin" }} onPick={onPick} onSearchOpenChange={setSearchOpen} />
      {searchOpen && <div className="gsearch-scrim" aria-hidden="true" />}
      <div className="live-view__body">
        <NavRail active={nav} onChange={setNav} />
        <main className="live-view__main">
          <div className="live-view__grid">
            {tiles.map((id) => {
              const cam = cameraById(id);
              return (
                <div key={id} className="video-tile" data-state={cam.online ? "live" : "offline"} data-selected={selected === id} data-flash={flash === id} onClick={() => setSelected(id)}>
                  {cam.online ? <img className="video-tile__feed" src={cameraFeeds[cam.feed]} alt="" /> : (
                    <div className="video-tile__message">
                      <p className="t-label-md">Camera offline</p>
                    </div>
                  )}
                  <div className="video-tile__header">
                    <p className="t-label-sm truncate">
                      {cam.channel} · {cam.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NavExploration() {
  return (
    <ToastProvider>
      <Screen />
    </ToastProvider>
  );
}
