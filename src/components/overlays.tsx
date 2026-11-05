import { useEffect, useRef, type ReactNode } from "react";
import { icons } from "../assets";
import { IconButton } from "./atoms";

/* ---------- Dialog ---------- */
type DialogProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

/** Esc / × / Cancel close. Focus moves to the first field and returns to the trigger on close. */
export function Dialog({ title, description, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // read during the first render, before autofocus moves focus into the dialog
  const triggerRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const root = ref.current!;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('input, button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    (root.querySelector<HTMLElement>("[data-autofocus]") ?? focusables().find((el) => !el.matches("[data-dialog-close]")))?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      trigger?.focus?.();
    };
  }, []);

  return (
    <div className="dialog-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog__header">
          <h2 className="dialog__title">{title}</h2>
          {description && <p className="t-body-md dialog__description">{description}</p>}
        </div>
        <div className="dialog__content">{children}</div>
        <div className="dialog__footer">{footer}</div>
        <span className="dialog__close" data-dialog-close>
          <IconButton icon={icons.x} label="Close" onClick={onClose} />
        </span>
      </div>
    </div>
  );
}

/* ---------- Menu (popover list) ---------- */
export type MenuItem = { id: string; label: string; meta?: string; starred?: boolean; selected?: boolean };

type MenuProps = {
  items: MenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  align?: "start" | "end";
  ariaLabel: string;
};

/** Popover list anchored to its (position:relative) parent. Closes on outside press and Esc; arrows move focus. */
export function Menu({ items, onSelect, onClose, align = "start", ariaLabel }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const root = ref.current!;
    (root.querySelector<HTMLElement>('[aria-checked="true"]') ?? root.querySelector<HTMLElement>("button"))?.focus();
    const onDown = (e: MouseEvent) => {
      if (!root.parentElement?.contains(e.target as Node)) closeRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        (root.parentElement?.querySelector("button") as HTMLElement | null)?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const els = Array.from(root.querySelectorAll<HTMLElement>("button"));
        const i = els.indexOf(document.activeElement as HTMLElement);
        els[(i + (e.key === "ArrowDown" ? 1 : -1) + els.length) % els.length]?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  return (
    <div ref={ref} className={`menu menu--${align}`} role="menu" aria-label={ariaLabel}>
      {items.map((item) => (
        <button key={item.id} type="button" role="menuitemradio" aria-checked={!!item.selected} className="menu__item" data-selected={!!item.selected} onClick={() => onSelect(item.id)}>
          <span className="t-body-md truncate menu__label">{item.label}</span>
          {item.meta && <span className="t-label-xs menu__meta">{item.meta}</span>}
          {item.starred && <img className="icon icon--sm" src={icons.star} alt="Opens at login" />}
        </button>
      ))}
    </div>
  );
}
