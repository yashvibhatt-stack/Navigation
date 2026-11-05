import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { icons } from "../assets";
import { IconButton } from "./atoms";

type ToastAction = { label: string; onClick: () => void };
type ToastItem = { id: number; message: string; action?: ToastAction };

const ToastContext = createContext<{ push: (message: string, action?: ToastAction) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

const MAX_STACK = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const push = useCallback((message: string, action?: ToastAction) => {
    setItems((xs) => [...xs, { id: nextId.current++, message, action }].slice(-MAX_STACK));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {/* Bottom-centre of the video area; the host region must be position:relative */}
      <div className="toast-viewport" role="region" aria-label="Notifications">
        {items.map((t) => (
          <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** 5 s, or 10 s when it carries an action. The timer pauses while hovered or focused. */
function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const duration = item.action ? 10000 : 5000;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);

  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const t = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - started;
    };
  }, [paused, onDismiss]);

  return (
    <div className="toast" role="status" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <p className="toast__message t-body-md">{item.message}</p>
      {item.action && (
        <button
          type="button"
          className="button button--sm button--outline"
          onClick={() => {
            item.action!.onClick();
            onDismiss();
          }}
        >
          <img className="icon" src={icons.toastUndo} alt="" />
          <span>{item.action.label}</span>
        </button>
      )}
      <IconButton icon={icons.x} label="Dismiss" onClick={onDismiss} />
    </div>
  );
}
