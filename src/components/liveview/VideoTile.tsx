import type { CSSProperties, PointerEvent } from "react";
import { cameraFeeds, icons, noPermissionIllustration } from "../../assets";
import { cameraById } from "../../data";
import type { Slot } from "../../state/view";
import { IconButton } from "../atoms";

export type DropState = "none" | "dropTarget" | "dropReplace";

type VideoTileProps = {
  index: number;
  slot: Slot;
  selected: boolean;
  dropState: DropState;
  isDragSource: boolean;
  area?: string; // grid-area for asymmetric layouts (1+5)
  style?: CSSProperties;
  onSelect: () => void;
  onClose: () => void;
  onZoom: () => void; // double-click → 1×1
  onHeaderPointerDown: (e: PointerEvent) => void; // drag the tile to another tile
};

/** VideoTile (always dark). States: live · noCamera · noPermission · offline · dropTarget · dropReplace. */
export function VideoTile({ index, slot, selected, dropState, isDragSource, area, style, onSelect, onClose, onZoom, onHeaderPointerDown }: VideoTileProps) {
  const camera = slot ? cameraById(slot.cameraId) : null;
  const label = camera ? `${camera.channel} · ${camera.name}` : null;
  const state = !slot ? "noCamera" : slot.noAccess ? "noPermission" : !camera!.online ? "offline" : "live";

  return (
    <div
      className="video-tile"
      data-tile-index={index}
      data-state={state}
      data-drop={dropState}
      data-selected={selected}
      data-drag-source={isDragSource || undefined}
      style={{ gridArea: area, ...style }}
      onClick={onSelect}
      onDoubleClick={() => slot && onZoom()}
    >
      {state === "live" && <img className="video-tile__feed" src={cameraFeeds[camera!.feed]} alt="" draggable={false} />}

      {slot && (
        <div className="video-tile__header" onPointerDown={(e) => !(e.target as HTMLElement).closest("button") && onHeaderPointerDown(e)}>
          <p className="t-label-sm truncate">{label}</p>
          <span className="video-tile__close">
            <IconButton icon={icons.x} label={`Close ${camera!.name}`} onClick={(e) => { e.stopPropagation(); onClose(); }} />
          </span>
        </div>
      )}

      {state === "noPermission" && (
        <div className="video-tile__message">
          <div className="video-tile__illustration">
            <img src={noPermissionIllustration} alt="" draggable={false} />
          </div>
          <p className="t-label-md">No access to this camera</p>
          <p className="t-body-sm video-tile__muted video-tile__message-text">Ask your admin for Monitoring rights.</p>
        </div>
      )}

      {state === "offline" && (
        <div className="video-tile__message">
          <p className="t-label-md">Camera offline</p>
          <p className="t-body-sm video-tile__muted">Check the camera’s power and network.</p>
        </div>
      )}

      {state === "noCamera" && dropState !== "dropTarget" && (
        <div className="video-tile__message">
          <img className="icon icon--lg" src={icons.plus} alt="" />
          <p className="t-label-md">No camera</p>
          <p className="t-body-sm video-tile__muted">Drag a camera here</p>
        </div>
      )}

      {dropState === "dropTarget" && (
        <>
          <div className="video-tile__message">
            <img className="icon icon--xl" src={icons.plus} alt="" />
            <p className="t-label-md">Drop to show here</p>
          </div>
          <div className="video-tile__drop-border video-tile__drop-border--dashed" />
        </>
      )}

      {dropState === "dropReplace" && label && (
        <>
          <div className="video-tile__scrim" />
          <div className="video-tile__message">
            <img className="icon icon--xl" src={icons.undo} alt="" />
            <p className="t-label-md">Drop to replace</p>
            <p className="t-body-sm video-tile__muted">{label}</p>
          </div>
          <div className="video-tile__drop-border" />
        </>
      )}

      {selected && dropState === "none" && <div className="video-tile__selection" />}
    </div>
  );
}
