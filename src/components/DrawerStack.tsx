import { useCallback, useEffect, useId, useRef, useState } from "react";

import { COVER_CLASSES } from "@/data/browse";
import type { BrowseEntry } from "@/lib/manga-manager";

/**
 * Physical drawer / file-folder card stack.
 *
 * Four sheets live inside a shallow drawer. The pointer's vertical position
 * inside the item picks which sheet is "active" — moving upward pulls deeper
 * sheets out one at a time while the previous one settles back. Zones use
 * hysteresis so tiny movements near a boundary don't flicker.
 *
 * Interaction parity:
 *  - mouse/pen: vertical position drives the stack, leaving closes it
 *  - touch: tap cycles sheets, tapping outside closes
 *  - keyboard: Arrow Up/Down leaf through, Home/End jump, Escape closes
 *  - reduced motion: sheets snap instead of sliding (handled in CSS)
 */

const ZONES = 4; // sheets: 0 = front cover, 3 = blurred backing sheet
const HYSTERESIS = 0.05;

type Props = {
  entry: BrowseEntry;
  index: number;
};

export function DrawerStack({ entry, index }: Props) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const activeRef = useRef(0);
  const rootRef = useRef<HTMLLIElement>(null);
  const isTouch = useRef(false);
  const descriptionId = useId();

  const setZone = useCallback((next: number) => {
    const clamped = Math.min(ZONES - 1, Math.max(0, next));
    activeRef.current = clamped;
    setActive(clamped);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "touch" || isTouch.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      // 0 at the bottom of the drawer, 1 at the top of the stack.
      const fromBottom = 1 - (event.clientY - rect.top) / rect.height;
      const raw = fromBottom * ZONES;
      const current = activeRef.current;
      // Hysteresis: only cross a boundary once the pointer clears it a little.
      let next = Math.floor(raw);
      if (next > current && raw < next + HYSTERESIS) next = current;
      if (next < current && raw > next + 1 - HYSTERESIS) next = current;
      setOpen(true);
      setZone(next);
    },
    [setZone],
  );

  const close = useCallback(() => {
    setOpen(false);
    setZone(0);
  }, [setZone]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        event.preventDefault();
        setOpen(true);
        setZone(activeRef.current + 1);
        break;
      case "ArrowDown":
      case "ArrowLeft": {
        event.preventDefault();
        const next = activeRef.current - 1;
        if (next < 0) close();
        else setZone(next);
        break;
      }
      case "Home":
        event.preventDefault();
        setZone(0);
        break;
      case "End":
        event.preventDefault();
        setOpen(true);
        setZone(ZONES - 1);
        break;
      case "Escape":
        close();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open && activeRef.current >= ZONES - 1) close();
        else {
          setOpen(true);
          setZone(activeRef.current + 1);
        }
        break;
      default:
        break;
    }
  };

  // Touch: tap cycles through the sheets, tap outside closes the drawer.
  const handleTouchTap = () => {
    isTouch.current = true;
    const next = activeRef.current + 1;
    if (!open) {
      setOpen(true);
      setZone(1);
    } else if (next >= ZONES) {
      close();
    } else {
      setZone(next);
    }
  };

  useEffect(() => {
    if (!isTouch.current || !open) return;
    const onDocPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [open, close]);

  const sheets = [0, 1, 2, 3];
  const sheetLabel = (depth: number) =>
    depth === ZONES - 1 ? `${Math.max(entry.count - 3, 0)} more titles` : (entry.titles[depth] ?? entry.value);

  return (
    <li
      ref={rootRef}
      className="drawer-item"
      data-open={open ? "true" : "false"}
      data-active={active}
    >
      <button
        type="button"
        className="drawer-hit"
        aria-expanded={open}
        aria-describedby={descriptionId}
        aria-label={`${entry.value}, ${entry.count} ${entry.count === 1 ? "title" : "titles"}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={(event) => {
          if (event.pointerType === "touch") return;
          close();
        }}
        onFocus={() => setOpen(true)}
        onBlur={close}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          // Only treat as a tap-cycle on coarse pointers.
          if (window.matchMedia("(hover: hover)").matches) return;
          event.preventDefault();
          handleTouchTap();
        }}
      >
        <span className="drawer-stage">
          <span className="drawer-well" aria-hidden="true" />

          {sheets.map((depth) => {
            const isBlank = depth === ZONES - 1;
            const cover = COVER_CLASSES[(index + depth * 2) % COVER_CLASSES.length]!;
            return (
              <span
                key={depth}
                className={`drawer-sheet ${isBlank ? "drawer-sheet--blank cover-peacock" : cover}`}
                data-depth={depth}
                data-state={active === depth ? "active" : "stored"}
                aria-hidden="true"
              >
                <span className="drawer-sheet__spine" />
                {isBlank ? (
                  <span className="drawer-sheet__blank-note">+{Math.max(entry.count - 3, 0)} more</span>
                ) : depth === 0 ? (
                  <span className="drawer-sheet__letter">{entry.value.charAt(0).toUpperCase()}</span>
                ) : (
                  <span className="drawer-sheet__title">{entry.titles[depth]}</span>
                )}
              </span>
            );
          })}

          <span className="drawer-strap" aria-hidden="true">
            <span className="drawer-strap__band" />
            <span className="drawer-strap__knot" />
          </span>

          <span className="drawer-body" aria-hidden="true">
            <span className="drawer-lip" />
            <span className="drawer-peg drawer-peg--left" />
            <span className="drawer-peg drawer-peg--right" />
          </span>
        </span>

        <span className="drawer-meta">
          <span className="drawer-name">{entry.value}</span>
          <span className="drawer-tag">
            {entry.count} {entry.count === 1 ? "title" : "titles"}
          </span>
        </span>

        <span id={descriptionId} className="sr-only">
          Arrow up and down leaf through {ZONES} sheets. Escape closes the drawer.
        </span>
        <span className="sr-only" aria-live="polite">
          {open ? `Sheet ${active + 1} of ${ZONES}: ${sheetLabel(active)}` : ""}
        </span>
      </button>
    </li>
  );
}
