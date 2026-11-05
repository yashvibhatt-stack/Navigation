import { useState } from "react";
import { icons } from "../../assets";
import { layouts, layoutById, type LayoutId, type Style } from "../../state/view";
import { IconButton, SelectTrigger, Separator, Tabs, Toggle } from "../atoms";
import { PageNavigator } from "../molecules";
import { Menu } from "../overlays";

export const intervals = [
  { id: "10", label: "10 s" },
  { id: "30", label: "30 s" },
  { id: "60", label: "1 min" },
  { id: "120", label: "2 min" },
  { id: "300", label: "5 min" },
];

type ToolbarProps = {
  styles: Style[];
  currentStyleId: string | null;
  styleName: string;
  onStyleSelect: (id: string) => void;
  onSave: () => void;
  mode: "live" | "playback";
  onModeChange: (m: "live" | "playback") => void;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  slideshow: boolean;
  onSlideshowChange: (v: boolean) => void;
  interval: string;
  onIntervalChange: (v: string) => void;
  layout: LayoutId;
  onLayoutChange: (l: LayoutId) => void;
  onCloseAll: () => void;
  onFullscreen: () => void;
};

type OpenMenu = null | "style" | "interval" | "layout";

/** LiveViewToolbar: Style + Save · mode tabs · pages, slideshow, close all, layout, full screen. */
export function Toolbar(p: ToolbarProps) {
  const [menu, setMenu] = useState<OpenMenu>(null);
  const multiple = p.pages > 1; // single page hides PageNavigator + Slideshow
  const toggle = (m: Exclude<OpenMenu, null>) => setMenu((cur) => (cur === m ? null : m));

  return (
    <div className="live-view-toolbar">
      <div className="live-view-toolbar__start">
        <div className="menu-anchor">
          <SelectTrigger value={p.styleName} ariaLabel="Style" expanded={menu === "style"} onClick={() => toggle("style")} />
          {menu === "style" && (
            <Menu
              ariaLabel="Styles"
              items={p.styles.map((s) => ({ id: s.id, label: s.name, meta: layoutById(s.layout).label, starred: s.isDefault, selected: s.id === p.currentStyleId }))}
              onClose={() => setMenu(null)}
              onSelect={(id) => {
                setMenu(null);
                p.onStyleSelect(id);
              }}
            />
          )}
        </div>
        <IconButton icon={icons.save} label="Save as style" onClick={p.onSave} />
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
        {multiple && (
          <>
            <PageNavigator page={p.page + 1} pages={p.pages} onChange={(n) => p.onPageChange(n - 1)} />
            <Separator />
            <Toggle pressed={p.slideshow} onPressedChange={p.onSlideshowChange} icon={icons.presentation} ariaLabel="Slideshow" />
            {p.slideshow && (
              <div className="menu-anchor">
                <SelectTrigger value={intervals.find((i) => i.id === p.interval)!.label} width={80} ariaLabel="Slideshow interval" expanded={menu === "interval"} onClick={() => toggle("interval")} />
                {menu === "interval" && (
                  <Menu
                    align="end"
                    ariaLabel="Slideshow interval"
                    items={intervals.map((i) => ({ ...i, selected: i.id === p.interval }))}
                    onClose={() => setMenu(null)}
                    onSelect={(id) => {
                      setMenu(null);
                      p.onIntervalChange(id);
                    }}
                  />
                )}
              </div>
            )}
            <Separator />
          </>
        )}
        <IconButton icon={icons.copyX} label="Close all windows" onClick={p.onCloseAll} />
        <div className="menu-anchor">
          <IconButton icon={icons.layoutGrid} label="Layout (L)" aria-expanded={menu === "layout"} aria-haspopup="menu" onClick={() => toggle("layout")} />
          {menu === "layout" && (
            <Menu
              align="end"
              ariaLabel="Layout"
              items={layouts.map((l) => ({ id: l.id, label: l.label, meta: l.hint, selected: l.id === p.layout }))}
              onClose={() => setMenu(null)}
              onSelect={(id) => {
                setMenu(null);
                p.onLayoutChange(id as LayoutId);
              }}
            />
          )}
        </div>
        <IconButton icon={icons.maximize} label="Full screen (F)" onClick={p.onFullscreen} />
      </div>
    </div>
  );
}
