import { icons } from "../assets";
import { Badge, Button, IconButton, SelectTrigger, Separator, Tabs, Toggle } from "./atoms";
import { AccountTrigger, DateTime, DeviceSwitcher, Logo, NotificationTrigger, PageNavigator, SpeakToDevice } from "./molecules";

/* ---------- Topbar ---------- */
export function Topbar({ deviceName, notificationCount, notificationStatus = "critical", account }: { deviceName: string; notificationCount: number; notificationStatus?: "unread" | "critical"; account?: { name: string; initials: string; role?: string } }) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar__start">
        <Logo />
        <Separator />
        <DeviceSwitcher deviceName={deviceName} status="Connected" />
        <Separator />
        <SpeakToDevice deviceName={deviceName} />
      </div>
      <div className="topbar__end">
        <DateTime time="09:56:45 AM" date="Jul 15, 2025 · UTC+05:30" />
        <Separator />
        <NotificationTrigger count={notificationCount} status={notificationStatus} />
        <Separator />
        <AccountTrigger name={account?.name ?? "Yashvi Bhatt"} initials={account?.initials ?? "YB"} role={account?.role} />
      </div>
    </header>
  );
}

/* ---------- NavRail ---------- */
const navItems = [
  { id: "home", label: "Home", icon: icons.navHome },
  { id: "events", label: "Events", icon: icons.navEvents },
  { id: "device-status", label: "Device Status", icon: icons.navDeviceStatus },
  { id: "device-config", label: "Device Config", icon: icons.navDeviceConfig },
  { id: "settings", label: "Settings", icon: icons.navSettings },
];

export function NavRail({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav className="nav-rail" aria-label="Primary">
      {navItems.map((item) => (
        <button key={item.id} type="button" className="nav-rail-item" data-active={item.id === active} aria-current={item.id === active ? "page" : undefined} onClick={() => onChange(item.id)}>
          <img className="icon icon--lg" src={item.icon} alt="" />
          <span className="t-label-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------- LiveViewToolbar ---------- */
type LiveViewToolbarProps = {
  mode: "live" | "playback";
  onModeChange: (m: "live" | "playback") => void;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  slideshow: boolean;
  onSlideshowChange: (v: boolean) => void;
  onCloseAll: () => void;
  onFullscreen: () => void;
};

export function LiveViewToolbar(p: LiveViewToolbarProps) {
  return (
    <div className="live-view-toolbar">
      <div className="live-view-toolbar__start">
        <SelectTrigger value="Main entrance" ariaLabel="Style" />
        <IconButton icon={icons.save} label="Save as style" />
      </div>
      <Tabs
        ariaLabel="View mode"
        tabs={[
          { id: "live", label: "Live View" },
          { id: "playback", label: "Playback" },
        ]}
        value={p.mode}
        onValueChange={p.onModeChange}
      />
      <div className="live-view-toolbar__end">
        <PageNavigator page={p.page} pages={p.pages} onChange={p.onPageChange} />
        <Separator />
        <Toggle pressed={p.slideshow} onPressedChange={p.onSlideshowChange} icon={icons.presentation} ariaLabel="Slideshow" />
        <Separator />
        <IconButton icon={icons.copyX} label="Close all windows" onClick={p.onCloseAll} />
        <IconButton icon={icons.layoutGrid} label="Layout" />
        <IconButton icon={icons.maximize} label="Full screen (F)" onClick={p.onFullscreen} />
      </div>
    </div>
  );
}

/* ---------- VideoTile (live state) ---------- */
type VideoTileProps = { channel: string; name: string; src: string; isSelected: boolean; onSelect: () => void };

export function VideoTile({ channel, name, src, isSelected, onSelect }: VideoTileProps) {
  return (
    <div className="video-tile" data-selected={isSelected} onClick={onSelect}>
      <img className="video-tile__feed" src={src} alt="" />
      <div className="video-tile__header">
        <p className="t-label-sm truncate">
          {channel} · {name}
        </p>
      </div>
      {isSelected && <div className="video-tile__selection" />}
    </div>
  );
}

/* ---------- EventToast (critical) ---------- */
type EventToastProps = {
  thumbnail: string;
  title: string;
  meta: string;
  onView: () => void;
  onAcknowledge: () => void;
  onClose: () => void;
};

export function EventToast({ thumbnail, title, meta, onView, onAcknowledge, onClose }: EventToastProps) {
  return (
    <div className="event-toast event-toast--critical" role="alert">
      <img className="event-toast__thumbnail" src={thumbnail} alt="" />
      <div className="event-toast__content">
        <Badge label="Alarm" variant="negative" appearance="solid" />
        <p className="t-label-md truncate" style={{ width: "100%" }}>
          {title}
        </p>
        <p className="t-body-sm event-toast__meta">{meta}</p>
        <div className="event-toast__actions">
          <Button onClick={onView}>View camera</Button>
          <Button variant="ghost" onClick={onAcknowledge}>
            Acknowledge
          </Button>
        </div>
      </div>
      <IconButton icon={icons.x} label="Dismiss" onClick={onClose} />
    </div>
  );
}
