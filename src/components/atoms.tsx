import type { ButtonHTMLAttributes, ReactNode } from "react";
import { icons } from "../assets";

/* ---------- Badge ---------- */
type BadgeProps = {
  label: string;
  variant?: "neutral" | "positive" | "negative";
  appearance?: "subtle" | "solid";
  hasDot?: boolean;
};

const badgeDot = {
  "solid": icons.badgeDotSolid,
  "negative-subtle": icons.badgeDotNegative,
  "positive-subtle": icons.badgeDotPositive,
};

export function Badge({ label, variant = "neutral", appearance = "subtle", hasDot = false }: BadgeProps) {
  const dot =
    appearance === "solid"
      ? badgeDot.solid
      : variant === "negative"
        ? badgeDot["negative-subtle"]
        : variant === "positive"
          ? badgeDot["positive-subtle"]
          : undefined;
  return (
    <span className={`badge badge--${variant} badge--${appearance}`}>
      {hasDot && dot && <img className="badge__dot" src={dot} alt="" />}
      <span className="badge__label">{label}</span>
    </span>
  );
}

/* ---------- Separator ---------- */
export function Separator() {
  return <div className="separator separator--vertical" role="separator" aria-orientation="vertical" />;
}

/* ---------- StatusDot ---------- */
export function StatusDot({ variant = "positive", label }: { variant?: "positive" | "negative"; label?: string }) {
  return <span className={`status-dot status-dot--${variant}`} role={label ? "img" : undefined} aria-label={label} />;
}

/* ---------- Avatar ---------- */
export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="avatar avatar--sm" aria-hidden="true">
      <span className="t-label-xs">{initials}</span>
    </span>
  );
}

/* ---------- IconButton (ghost) ---------- */
type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: string;
  label: string; // aria-label + tooltip (required by the design system)
  size?: "sm" | "default";
};

export function IconButton({ icon, label, size = "sm", className = "", ...rest }: IconButtonProps) {
  return (
    <button type="button" className={`icon-button icon-button--${size} ${className}`} aria-label={label} title={label} {...rest}>
      <img className="icon" src={icon} alt="" />
    </button>
  );
}

/* ---------- Button ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default"; // sm 28 | default 32
  iconLeft?: string;
  children: ReactNode;
};

export function Button({ variant = "default", size = "sm", iconLeft, className = "", children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`button button--${size} button--${variant} ${className}`} {...rest}>
      {iconLeft && <img className="icon" src={iconLeft} alt="" />}
      {children}
    </button>
  );
}

/* ---------- Toggle ---------- */
type ToggleProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  icon: string;
  label?: string;
  ariaLabel?: string;
};

export function Toggle({ pressed, onPressedChange, icon, label, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      className="toggle"
      aria-pressed={pressed}
      aria-label={label ? undefined : ariaLabel}
      title={label ?? ariaLabel}
      data-state={pressed ? "on" : "off"}
      onClick={() => onPressedChange(!pressed)}
    >
      <img className="icon" src={icon} alt="" />
      {label && <span className="t-label-md">{label}</span>}
    </button>
  );
}

/* ---------- Switch (sm 28×16) ---------- */
export function Switch({ checked, onCheckedChange, id, ariaLabel }: { checked: boolean; onCheckedChange: (v: boolean) => void; id?: string; ariaLabel?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className="switch switch--sm"
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  );
}

/* ---------- Input (sm 28 | default 32) ---------- */
type InputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  iconLeft?: string;
  ariaLabel: string;
  onClear?: () => void; // shows a clear (×) button while the field has a value
  error?: boolean; // aria-invalid + negative border
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: "text" | "search";
  autoFocus?: boolean;
};

export function Input({ value, onChange, placeholder, iconLeft, ariaLabel, onClear, error, inputRef, onKeyDown, type = "search", autoFocus }: InputProps) {
  return (
    <label className={`input ${error ? "input--error" : ""}`}>
      {iconLeft && <img className="icon" src={iconLeft} alt="" />}
      <input
        ref={inputRef}
        className="input__field t-body-md"
        type={type}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        autoFocus={autoFocus}
        data-autofocus={autoFocus ? "" : undefined}
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.target.value)}
      />
      {onClear && value && (
        <button type="button" className="input__clear" aria-label="Clear search" onClick={onClear}>
          <img className="icon" src={icons.x} alt="" />
        </button>
      )}
    </label>
  );
}

/* ---------- Field (label + control + helper / error) ---------- */
export function Field({ label, helper, error, children }: { label: string; helper?: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <p className="t-label-md">{label}</p>
      {children}
      {(error || helper) && (
        <p className={`t-body-sm field__helper ${error ? "field__helper--error" : ""}`} role={error ? "alert" : undefined}>
          {error ?? helper}
        </p>
      )}
    </div>
  );
}

/* ---------- CheckboxField ---------- */
export function CheckboxField({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <label className="choice-field">
      <span className="choice-field__control">
        <input type="checkbox" className="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
      </span>
      <span className="t-label-md choice-field__label">{label}</span>
    </label>
  );
}

/* ---------- RadioField ---------- */
export function RadioField({ name, label, description, checked, onChange }: { name: string; label: string; description?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="choice-field">
      <span className="choice-field__control">
        <input type="radio" className="radio" name={name} checked={checked} onChange={onChange} />
      </span>
      <span className="choice-field__text">
        <span className="t-label-md choice-field__label">{label}</span>
        {description && <span className="t-body-sm choice-field__description">{description}</span>}
      </span>
    </label>
  );
}

/* ---------- SelectTrigger (sm 28) ---------- */
type SelectTriggerProps = { value: string; width?: number; ariaLabel: string; onClick?: () => void; expanded?: boolean };

export function SelectTrigger({ value, width = 180, ariaLabel, onClick, expanded }: SelectTriggerProps) {
  return (
    <button type="button" className="select-trigger" style={{ width }} aria-haspopup="menu" aria-expanded={expanded} aria-label={ariaLabel} data-state={expanded ? "open" : "closed"} onClick={onClick}>
      <span className="select-trigger__value t-body-sm truncate">{value}</span>
      <img className="icon" src={icons.chevronDown} alt="" />
    </button>
  );
}

/* ---------- Tabs ---------- */
type TabsProps<T extends string> = {
  tabs: { id: T; label: string }[];
  value: T;
  onValueChange: (v: T) => void;
  ariaLabel: string;
  fill?: boolean;
};

export function Tabs<T extends string>({ tabs, value, onValueChange, ariaLabel, fill = false }: TabsProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    onValueChange(tabs[(next + tabs.length) % tabs.length].id);
  };
  return (
    <div className={`tabs ${fill ? "tabs--fill" : ""}`} role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            data-state={selected ? "active" : "inactive"}
            className="tabs__trigger"
            onClick={() => onValueChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
