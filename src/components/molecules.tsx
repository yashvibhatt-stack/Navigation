import { useId, useState } from "react";
import { icons, logoMark } from "../assets";
import { Avatar, Badge, IconButton, StatusDot, Switch, Toggle } from "./atoms";

/* ---------- Logo ---------- */
export function Logo() {
  return (
    <div className="logo">
      <div className="logo__mark">
        <img src={logoMark} alt="" />
      </div>
      <div className="logo__wordmark">
        <p>Matrix</p>
        <p>SATATYA</p>
      </div>
    </div>
  );
}

/* ---------- DateTime ---------- */
export function DateTime({ time, date }: { time: string; date: string }) {
  return (
    <div className="date-time">
      <p className="date-time__time t-label-md">{time}</p>
      <p className="date-time__date t-label-xs">{date}</p>
    </div>
  );
}

/* ---------- DeviceSwitcher ---------- */
export function DeviceSwitcher({ deviceName, status }: { deviceName: string; status: "Connected" }) {
  const [open, setOpen] = useState(false);
  return (
    <button type="button" className="device-switcher" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      <img className="icon" src={icons.server} alt="" />
      <span className="device-switcher__name t-label-lg truncate">{deviceName}</span>
      <Badge label={status} variant="positive" hasDot />
      <img className="icon" src={icons.chevronsUpDown} alt="" />
    </button>
  );
}

/* ---------- SpeakToDevice (idle ⇄ speaking) ---------- */
export function SpeakToDevice({ deviceName }: { deviceName: string }) {
  const [speaking, setSpeaking] = useState(false);
  return (
    <div className="speak-to-device">
      <Toggle pressed={speaking} onPressedChange={setSpeaking} icon={icons.mic} label="Speak" />
      <span className="sr-only" role="status" aria-live="polite">
        {speaking ? `Speaking to ${deviceName}` : "Stopped speaking"}
      </span>
    </div>
  );
}

/* ---------- NotificationTrigger ---------- */
export function NotificationTrigger({ count, status }: { count: number; status: "unread" | "critical" }) {
  return (
    <div className="notification-trigger">
      <IconButton icon={status === "critical" ? icons.bellRing : icons.bell} size="default" label={`Events, ${count} ${status === "critical" ? "critical" : "unread"}`} />
      <span className={`notification-trigger__count notification-trigger__count--${status} t-label-xs`}>{count > 99 ? "99+" : count}</span>
    </div>
  );
}

/* ---------- AccountTrigger ---------- */
export function AccountTrigger({ name, initials, role }: { name: string; initials: string; role?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button type="button" className="account-trigger" aria-label={`Account, ${name}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      <Avatar initials={initials} />
      {role && (
        <span className="account-trigger__details">
          <span className="t-label-sm">{name}</span>
          <span className="t-label-xs account-trigger__role">{role}</span>
        </span>
      )}
      {role ? <img className="icon" src={icons.accountChevron16} alt="" /> : <img className="icon icon--sm" src={icons.accountChevron} alt="" />}
    </button>
  );
}

/* ---------- SwitchField ---------- */
export function SwitchField({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="switch-field" onClick={() => onCheckedChange(!checked)}>
      <label htmlFor={id} className="switch-field__label t-label-md" onClick={(e) => e.stopPropagation()}>
        {label}
      </label>
      <div className="switch-field__control" onClick={(e) => e.stopPropagation()}>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

/* ---------- AccordionTrigger ---------- */
type AccordionTriggerProps = {
  label: string;
  count: string;
  status: "positive" | "negative";
  isOpen: boolean;
  onToggle: () => void;
  controls: string;
};

export function AccordionTrigger({ label, count, status, isOpen, onToggle, controls }: AccordionTriggerProps) {
  return (
    <button type="button" className="accordion-trigger" aria-expanded={isOpen} aria-controls={controls} data-state={isOpen ? "open" : "closed"} onClick={onToggle}>
      <img className="icon" src={isOpen ? icons.chevronDown : icons.chevronRightMuted} alt="" />
      <StatusDot variant={status} label={status === "positive" ? "Device connected" : "Device disconnected"} />
      <span className="accordion-trigger__label t-label-md truncate">{label}</span>
      <span className="accordion-trigger__count t-label-xs">{count}</span>
    </button>
  );
}

/* ---------- CameraListItem ---------- */
type CameraListItemProps = {
  channel: string;
  name: string;
  isOnline: boolean;
  selected: boolean;
  statusText?: string; // anything other than Online shows dot + text
  query?: string; // highlights the matched part of the name
  isDragging?: boolean;
  hideStatus?: boolean; // live camera with no status dot
  onSelect: () => void;
  onOpen?: () => void; // double-click / Enter
  onPointerDown?: (e: React.PointerEvent) => void; // drag start
};

const Highlight = ({ text, query }: { text: string; query?: string }) => {
  const q = query?.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i === -1 || !q) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong className="match">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </>
  );
};

export function CameraListItem({ channel, name, isOnline, selected, statusText, query, isDragging, hideStatus, onSelect, onOpen, onPointerDown }: CameraListItemProps) {
  return (
    <button
      type="button"
      className="camera-list-item"
      data-state={selected ? "selected" : "default"}
      data-dragging={isDragging || undefined}
      aria-current={selected ? "true" : undefined}
      title={name}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.()}
      onPointerDown={onPointerDown}
    >
      <span className="camera-list-item__channel t-label-xs">{channel}</span>
      {isOnline && !hideStatus && <StatusDot variant="positive" label="Online" />}
      {!isOnline && statusText && <StatusDot variant="negative" label={statusText} />}
      <span className="camera-list-item__name t-body-md truncate">
        <Highlight text={name} query={query} />
      </span>
      {statusText && <Badge label={statusText} variant="negative" hasDot />}
    </button>
  );
}

/* ---------- StyleListItem ---------- */
export function StyleListItem({ name, layout, isDefault, selected, onSelect }: { name: string; layout: string; isDefault?: boolean; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" className="style-list-item" data-state={selected ? "selected" : "default"} aria-current={selected ? "true" : undefined} onClick={onSelect}>
      <img className="icon" src={icons.styleLayout} alt="" />
      <span className="style-list-item__name t-body-md truncate">{name}</span>
      <span className="style-list-item__layout t-label-xs">{layout}</span>
      {isDefault && <img className="icon icon--sm" src={icons.star} alt="Opens at login" />}
    </button>
  );
}

/* ---------- PageNavigator ---------- */
export function PageNavigator({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="page-navigator" aria-label={`Page ${page} of ${pages}`}>
      <IconButton icon={icons.chevronLeft} label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} />
      <span className="page-navigator__label t-label-sm">
        {page} / {pages}
      </span>
      <IconButton icon={icons.chevronRight} label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)} />
    </div>
  );
}
