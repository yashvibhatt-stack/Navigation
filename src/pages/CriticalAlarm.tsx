import { useMemo, useState } from "react";
import { cameraFeeds, icons } from "../assets";
import { Input, Tabs } from "../components/atoms";
import { AccordionTrigger, CameraListItem, SwitchField } from "../components/molecules";
import { EventToast, LiveViewToolbar, NavRail, Topbar, VideoTile } from "../components/organisms";
import { nvrs, TILES_PER_PAGE, TOTAL_PAGES, type Camera } from "./alarmData";

export default function CriticalAlarm() {
  const [nav, setNav] = useState("home");
  const [panelTab, setPanelTab] = useState<"cameras" | "styles">("cameras");
  const [query, setQuery] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ "head-office": true });
  const [selected, setSelected] = useState("02");
  const [activeTile, setActiveTile] = useState<string | null>(null); // tile border only after an explicit pick
  const select = (channel: string) => {
    setSelected(channel);
    setActiveTile(channel);
  };
  const [mode, setMode] = useState<"live" | "playback">("live");
  const [page, setPage] = useState(1);
  const [slideshow, setSlideshow] = useState(false);
  const [tilesCleared, setTilesCleared] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);
  const [alarmCount, setAlarmCount] = useState(3);

  const headOffice = nvrs[0];
  const tiles: Camera[] = tilesCleared ? [] : headOffice.cameras.slice(0, TILES_PER_PAGE);

  const visible = useMemo(
    (): Record<string, Camera[]> =>
      Object.fromEntries(
        nvrs.map((n) => [
          n.id,
          n.cameras.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()) && (!onlineOnly || c.isOnline)),
        ]),
      ),
    [query, onlineOnly],
  );

  const alarmCamera = headOffice.cameras[4]; // 05 Loading Bay

  const viewAlarmCamera = () => {
    setTilesCleared(false);
    setPage(1);
    select(alarmCamera.channel);
  };
  const dismissToast = () => {
    setToastVisible(false);
    setAlarmCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="app">
      <Topbar deviceName="NVR Head Office" notificationCount={alarmCount} />
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
          <Input iconLeft={icons.search} placeholder="Search cameras" ariaLabel="Search cameras" value={query} onChange={setQuery} />
          <SwitchField label="Show online only" checked={onlineOnly} onCheckedChange={setOnlineOnly} />
          <div className="live-view__camera-tree">
            {nvrs.map((nvr) => {
              const isOpen = !!open[nvr.id];
              return (
                <div key={nvr.id} className="live-view__nvr">
                  <AccordionTrigger
                    label={nvr.name}
                    count={nvr.count}
                    status={nvr.status}
                    isOpen={isOpen}
                    controls={`nvr-${nvr.id}`}
                    onToggle={() => setOpen((o) => ({ ...o, [nvr.id]: !o[nvr.id] }))}
                  />
                  {isOpen && (
                    <div id={`nvr-${nvr.id}`} className="live-view__nvr-cameras">
                      {visible[nvr.id].map((c) => (
                        <CameraListItem
                          key={c.channel}
                          channel={c.channel}
                          name={c.name}
                          isOnline={c.isOnline}
                          selected={selected === c.channel}
                          onSelect={() => select(c.channel)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="live-view__main">
          <LiveViewToolbar
            mode={mode}
            onModeChange={setMode}
            page={page}
            pages={TOTAL_PAGES}
            onPageChange={setPage}
            slideshow={slideshow}
            onSlideshowChange={setSlideshow}
            onCloseAll={() => setTilesCleared(true)}
            onFullscreen={() => document.documentElement.requestFullscreen?.().catch(() => {})}
          />
          <div className="live-view__grid">
            {tiles.map((c) => (
              <VideoTile
                key={c.channel}
                channel={c.channel}
                name={c.name}
                src={cameraFeeds[c.feed]}
                isSelected={activeTile === c.channel}
                onSelect={() => select(c.channel)}
              />
            ))}
            {tilesCleared && (
              <p className="live-view__empty t-body-md">
                All windows closed.{" "}
                <button type="button" className="link" onClick={() => setTilesCleared(false)}>
                  Undo
                </button>
              </p>
            )}
          </div>
        </main>
      </div>

      {toastVisible && (
        <EventToast
          thumbnail={cameraFeeds[alarmCamera.feed]}
          title={'Motion in zone "Dock 3"'}
          meta={`${alarmCamera.channel} ${alarmCamera.name} · 10:42:08`}
          onView={viewAlarmCamera}
          onAcknowledge={dismissToast}
          onClose={() => setToastVisible(false)}
        />
      )}
    </div>
  );
}
