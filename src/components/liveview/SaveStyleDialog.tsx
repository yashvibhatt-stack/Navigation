import { useEffect, useRef, useState } from "react";
import { layoutById, MAX_STYLES, type Style } from "../../state/view";
import { Button, CheckboxField, Field, Input, RadioField } from "../atoms";
import { Dialog } from "../overlays";

export type SaveResult = { name: string; openAtLogin: boolean; replaceId?: string };

type Props = {
  styles: Style[];
  initialName: string;
  onCancel: () => void;
  onSave: (r: SaveResult) => void;
};

/**
 * "Save as style" → (name taken? inline error) → (5 styles already? pick one to replace).
 * Enter submits, Esc / × / Cancel close.
 */
export function SaveStyleDialog({ styles, initialName, onCancel, onSave }: Props) {
  const [stage, setStage] = useState<"name" | "replace">("name");
  const [name, setName] = useState(initialName);
  const [openAtLogin, setOpenAtLogin] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => nameRef.current?.select(), []); // prefilled name starts selected

  const submitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a name for this style.");
    if (styles.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return setError(`A style named “${trimmed}” already exists. Choose another name.`);
    if (styles.length >= MAX_STYLES) return setStage("replace");
    onSave({ name: trimmed, openAtLogin });
  };

  if (stage === "replace") {
    return (
      <Dialog
        title={`You’ve reached ${MAX_STYLES} saved styles`}
        description={`Choose a style to replace with “${name.trim()}”. This can’t be undone.`}
        onClose={onCancel}
        footer={
          <>
            <Button variant="outline" size="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="default" disabled={!replaceId} onClick={() => replaceId && onSave({ name: name.trim(), openAtLogin, replaceId })}>
              Replace style
            </Button>
          </>
        }
      >
        <div className="radio-group" role="radiogroup" aria-label="Style to replace">
          {styles.map((s) => (
            <RadioField
              key={s.id}
              name="replace-style"
              label={s.name}
              description={`${layoutById(s.layout).label}${s.isDefault ? " · Opens at login" : ""}`}
              checked={replaceId === s.id}
              onChange={() => setReplaceId(s.id)}
            />
          ))}
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      title="Save as style"
      description="Name this view so you can open it again from the Style menu."
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" size="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="default" onClick={submitName}>
            Save style
          </Button>
        </>
      }
    >
      <Field label="Style name" helper="Saves the current layout and the camera on each tile." error={error}>
        <Input
          type="text"
          autoFocus
          ariaLabel="Style name"
          value={name}
          error={!!error}
          inputRef={nameRef}
          onChange={(v) => {
            setName(v);
            setError(undefined);
          }}
          onKeyDown={(e) => e.key === "Enter" && submitName()}
        />
      </Field>
      <CheckboxField label="Open this view when I log in" checked={openAtLogin} onCheckedChange={setOpenAtLogin} />
    </Dialog>
  );
}
