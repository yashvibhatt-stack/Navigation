import { cameras as allCameras, nvrs, type Camera } from "../../data";
import { Button } from "../atoms";
import { useDrag } from "../drag";
import { AccordionTrigger, CameraListItem } from "../molecules";

type CameraTreeProps = {
  query: string;
  onlineOnly: boolean;
  open: Record<string, boolean>;
  onToggle: (nvrId: string) => void;
  highlightedId: string | null;
  onHighlight: (cameraId: string) => void;
  onOpen: (cameraId: string) => void;
  onClearSearch: () => void;
};

const matches = (c: Camera, q: string) => {
  const s = q.trim().toLowerCase();
  return !s || c.name.toLowerCase().includes(s) || c.channel === s || c.ip.includes(s);
};

/** Device tree: NVR groups → cameras. While searching, groups with hits auto-expand and show "N found". */
export function CameraTree({ query, onlineOnly, open, onToggle, highlightedId, onHighlight, onOpen, onClearSearch }: CameraTreeProps) {
  const { begin, drag, wasJustDragged } = useDrag();
  const searching = query.trim().length > 0;

  const groups = nvrs
    .map((nvr) => ({ nvr, list: allCameras.filter((c) => c.nvrId === nvr.id && matches(c, query) && (!onlineOnly || c.online)) }))
    .filter((g) => !searching && !onlineOnly ? true : g.list.length > 0);

  if (searching && groups.length === 0) {
    return (
      <div className="tree-empty">
        <p className="t-label-md">No cameras match “{query.trim()}”</p>
        <p className="t-body-sm tree-empty__description">Check the spelling, or search by channel number or IP.</p>
        <Button variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <div className="live-view__camera-tree">
      {groups.map(({ nvr, list }) => {
        const isOpen = searching ? true : !!open[nvr.id];
        return (
          <div key={nvr.id} className="live-view__nvr">
            <AccordionTrigger
              label={nvr.name}
              count={searching ? `${list.length} found` : nvr.count}
              status={nvr.status}
              isOpen={isOpen}
              controls={`nvr-${nvr.id}`}
              onToggle={() => onToggle(nvr.id)}
            />
            {isOpen && (
              <div id={`nvr-${nvr.id}`} className="live-view__nvr-cameras">
                {list.map((c) => (
                  <CameraListItem
                    key={c.id}
                    channel={c.channel}
                    name={c.name}
                    isOnline={c.online}
                    statusText={c.online ? undefined : "Offline"}
                    hideStatus={c.noIndicator}
                    query={query}
                    selected={highlightedId === c.id || drag?.source.cameraId === c.id}
                    isDragging={drag?.source.cameraId === c.id}
                    onSelect={() => !wasJustDragged() && onHighlight(c.id)}
                    onOpen={() => onOpen(c.id)}
                    onPointerDown={(e) => begin({ kind: "camera", cameraId: c.id }, e)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
