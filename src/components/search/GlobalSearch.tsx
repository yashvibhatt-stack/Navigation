import { useEffect, useId, useMemo, useRef, useState } from "react";
import { icons } from "../../assets";
import { cameraById, cameras, nvrs } from "../../data";
import { initialRecents, people, personById, type Entry } from "../../people";

type Filter = "all" | "cameras" | "users";
type Props = { onPick: (entry: Entry) => void; onOpenChange?: (open: boolean) => void };

const MAX_RECENTS = 5;
const nvrName = (id: string) => nvrs.find((n) => n.id === id)?.name ?? "";
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tokensOf = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const sameEntry = (a: Entry, b: Entry) => a.kind === b.kind && a.id === b.id;

function search(q: string) {
  const tokens = tokensOf(q);
  if (!tokens.length) return { cams: [], users: [] };
  const rank = (name: string) => (name.toLowerCase().startsWith(tokens[0]) ? 0 : 1);
  const cams = cameras
    .filter((c) => tokens.every((t) => `${c.name} ${c.ip}`.toLowerCase().includes(t)))
    .sort((a, b) => rank(a.name) - rank(b.name));
  const users = people
    .filter((p) => tokens.every((t) => `${p.name} ${p.username}`.toLowerCase().includes(t)))
    .sort((a, b) => rank(a.name) - rank(b.name));
  return { cams, users };
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map(escapeRe).join("|")})`, "ig");
  return <>{text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}</>;
}

function Row({ id, entry, tokens, active, recent, onChoose, onHover, onRemove }: { id: string; entry: Entry; tokens: string[]; active: boolean; recent?: boolean; onChoose: () => void; onHover: () => void; onRemove?: () => void }) {
  const cam = entry.kind === "camera" ? cameraById(entry.id) : null;
  const person = entry.kind === "user" ? personById(entry.id) : null;
  return (
    <div id={id} role="option" aria-selected={active} className="gsearch__row" data-active={active} onMouseMove={() => !active && onHover()} onClick={onChoose}>
      {cam && (
        <>
          <span className="gsearch__lead">
            <img className="icon" src={icons.camera} alt="" />
            <span className={`gsearch__status gsearch__status--${cam.online ? "on" : "off"}`} />
          </span>
          <span className="gsearch__text">
            <span className="t-label-md truncate">
              <Highlight text={cam.name} tokens={tokens} />
            </span>
            <span className="t-body-sm gsearch__sub truncate">
              Channel {cam.channel} · {cam.online ? "Online" : "Offline"}
            </span>
          </span>
          <span className="gsearch__nvr" title="Recording on">
            <img className="icon icon--sm" src={icons.server} alt="" />
            <span className="t-label-sm">{nvrName(cam.nvrId)}</span>
          </span>
        </>
      )}
      {person && (
        <>
          <span className="gsearch__lead gsearch__lead--user">
            <span className="t-label-xs">{person.initials}</span>
          </span>
          <span className="gsearch__text">
            <span className="t-label-md truncate">
              <Highlight text={person.name} tokens={tokens} />
            </span>
            <span className="t-body-sm gsearch__sub truncate">
              @<Highlight text={person.username} tokens={tokens} />
            </span>
          </span>
          <span className={`role-pill role-pill--${person.role.toLowerCase()}`}>{person.role}</span>
        </>
      )}
      {recent && onRemove && (
        <button type="button" tabIndex={-1} className="gsearch__remove" aria-label="Remove from recent searches" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <img className="icon icon--sm" src={icons.x} alt="" />
        </button>
      )}
    </div>
  );
}

export function GlobalSearch({ onPick, onOpenChange }: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(-1);
  const [recents, setRecents] = useState<Entry[]>(initialRecents);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // 160 ms debounce; the first query after "recent" shows a skeleton, later ones just dim the old list
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 160);
    return () => clearTimeout(t);
  }, [query]);

  const updateQuery = (v: string) => {
    setQuery(v);
    if (!v.trim()) setDebounced("");
  };

  // "/" or Ctrl/Cmd+K focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mode = query.trim() ? "results" : "recent";
  const tokens = useMemo(() => tokensOf(debounced), [debounced]);
  const results = useMemo(() => search(debounced), [debounced]);
  const searching = mode === "results" && query.trim() !== debounced.trim();
  const firstLoad = searching && !debounced.trim();

  const limitCams = filter === "all" ? 5 : 8;
  const limitUsers = filter === "all" ? 4 : 8;
  const shownCams = filter === "users" || firstLoad ? [] : results.cams.slice(0, limitCams);
  const shownUsers = filter === "cameras" || firstLoad ? [] : results.users.slice(0, limitUsers);

  const flat: Entry[] =
    mode === "recent"
      ? recents
      : [...shownCams.map((c): Entry => ({ kind: "camera", id: c.id })), ...shownUsers.map((u): Entry => ({ kind: "user", id: u.id }))];

  useEffect(() => {
    setActive(mode === "results" && !firstLoad ? 0 : -1);
  }, [debounced, filter, mode, firstLoad]);

  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const choose = (entry: Entry) => {
    setRecents((r) => [entry, ...r.filter((x) => !sameEntry(x, entry))].slice(0, MAX_RECENTS));
    setQuery("");
    setDebounced("");
    setFilter("all");
    inputRef.current?.blur();
    onPick(entry);
  };

  const removeRecent = (entry: Entry) => setRecents((r) => r.filter((x) => !sameEntry(x, entry)));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = flat.length;
    if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? n - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0 && flat[active]) {
      e.preventDefault();
      choose(flat[active]);
    } else if (e.key === "Delete" && mode === "recent" && active >= 0 && flat[active]) {
      e.preventDefault();
      removeRecent(flat[active]);
      setActive((i) => Math.min(i, n - 2));
    } else if (e.key === "Escape") {
      if (query) updateQuery("");
      else inputRef.current?.blur();
    }
  };

  const totalCams = results.cams.length;
  const totalUsers = results.users.length;
  const count = (shown: number, total: number) => (shown < total ? `${shown} of ${total}` : `${total}`);
  const noResults = mode === "results" && !firstLoad && !searching && totalCams + totalUsers === 0;

  return (
    <div className="gsearch" role="search">
      <div className="gsearch__box" data-open={open}>
        <div className="gsearch__field">
          <img className="icon" src={icons.search} alt="" />
          <input
            ref={inputRef}
            className="gsearch__input t-body-md"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-label="Search cameras and users"
            placeholder="Search cameras and users"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
          {query ? (
            <button type="button" className="gsearch__clear" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { updateQuery(""); inputRef.current?.focus(); }}>
              <img className="icon" src={icons.x} alt="" />
            </button>
          ) : (
            <kbd className="gsearch__kbd" aria-hidden="true">/</kbd>
          )}
        </div>

        {open && (
          <div className="gsearch__panel" onMouseDown={(e) => e.preventDefault()}>
            {mode === "results" && (
              <div className="gsearch__chips" role="group" aria-label="Filter results">
                {([["all", "All", totalCams + totalUsers], ["cameras", "Cameras", totalCams], ["users", "Users", totalUsers]] as const).map(([id, label, n]) => (
                  <button key={id} type="button" className="gsearch__chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                    {label}
                    {!firstLoad && <span className="gsearch__chip-count">{n}</span>}
                  </button>
                ))}
              </div>
            )}

            <div id={listId} role="listbox" className="gsearch__list" aria-label={mode === "recent" ? "Recent searches" : "Search results"} data-stale={searching && !firstLoad}>
              {mode === "recent" && (
                <div role="group" aria-label="Recent searches">
                  <div className="gsearch__heading t-label-xs">
                    <span>Recent searches</span>
                    {recents.length > 0 && (
                      <button type="button" className="gsearch__link" onClick={() => setRecents([])}>
                        Clear all
                      </button>
                    )}
                  </div>
                  {recents.length === 0 && <p className="gsearch__empty t-body-md">Cameras and users you open will show up here.</p>}
                  {recents.map((entry, i) => (
                    <Row key={`${entry.kind}-${entry.id}`} id={`${listId}-${i}`} entry={entry} tokens={[]} active={active === i} recent onChoose={() => choose(entry)} onHover={() => setActive(i)} onRemove={() => removeRecent(entry)} />
                  ))}
                </div>
              )}

              {firstLoad && (
                <div className="gsearch__skeletons" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="gsearch__skeleton">
                      <span className="sk sk--tile" />
                      <span className="gsearch__text">
                        <span className="sk sk--line" style={{ width: `${46 + i * 12}%` }} />
                        <span className="sk sk--line sk--short" />
                      </span>
                      <span className="sk sk--pill" />
                    </div>
                  ))}
                </div>
              )}

              {noResults && (
                <div className="gsearch__none">
                  <p className="t-label-md">No cameras or users match “{debounced.trim()}”</p>
                  <p className="t-body-sm gsearch__sub">Check the spelling or try a shorter name.</p>
                </div>
              )}

              {mode === "results" && !firstLoad && shownCams.length > 0 && (
                <div role="group" aria-label="Cameras">
                  <div className="gsearch__heading t-label-xs">
                    <span>Cameras</span>
                    <span>{count(shownCams.length, totalCams)}</span>
                  </div>
                  {shownCams.map((c, i) => (
                    <Row key={c.id} id={`${listId}-${i}`} entry={{ kind: "camera", id: c.id }} tokens={tokens} active={active === i} onChoose={() => choose({ kind: "camera", id: c.id })} onHover={() => setActive(i)} />
                  ))}
                </div>
              )}

              {mode === "results" && !firstLoad && shownUsers.length > 0 && (
                <div role="group" aria-label="Users">
                  <div className="gsearch__heading t-label-xs">
                    <span>Users</span>
                    <span>{count(shownUsers.length, totalUsers)}</span>
                  </div>
                  {shownUsers.map((u, j) => {
                    const i = shownCams.length + j;
                    return <Row key={u.id} id={`${listId}-${i}`} entry={{ kind: "user", id: u.id }} tokens={tokens} active={active === i} onChoose={() => choose({ kind: "user", id: u.id })} onHover={() => setActive(i)} />;
                  })}
                </div>
              )}
            </div>

            <div className="gsearch__footer t-body-sm" aria-hidden="true">
              <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
              <span><kbd>Enter</kbd> open</span>
              {mode === "recent" ? <span><kbd>Del</kbd> remove</span> : <span><kbd>Esc</kbd> clear</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
