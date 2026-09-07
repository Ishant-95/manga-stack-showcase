import { useCallback, useEffect, useRef, useState } from "react";

import { COVER_CLASSES, type BrowseEntry } from "@/data/browse";

/**
 * Physical drawer / card stack.
 *
 * When the pointer enters, the drawer slides outward and the cards sit stacked
 * one behind another inside the shelf. The drawer's width is split into as many
 * horizontal zones as there are cards — moving across the zones selects a card.
 * The selected card slides up out of the shelf (staying within its border) while
 * every card in front of it fades to transparent so the chosen one is the only
 * cover you see. Nothing pops out above the shelf. Zones use hysteresis so a
 * pointer resting near a boundary doesn't flicker.
 */

const SHEETS = 4; // front cover + 3 sample titles
const HYSTERESIS = 0.06;

type Props = {
  entry: BrowseEntry;
  index: number;
};

export function DrawerStack({ entry, index }: Props) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const activeRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isTouch = useRef(false);

  const setZone = useCallback((next: number) => {
    const clamped = Math.min(SHEETS - 1, Math.max(0, next));
    activeRef.current = clamped;
    setActive(clamped);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch" || isTouch.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      // Split the drawer's width into one zone per card.
      const raw = ((event.clientX - rect.left) / rect.width) * SHEETS;
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setZone(activeRef.current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = activeRef.current - 1;
      if (next < 0) close();
      else setZone(next);
    } else if (event.key === "Escape") {
      close();
    }
  };

  // Touch: tap cycles through the cards, tap outside closes the drawer.
  const handleTouchTap = () => {
    isTouch.current = true;
    const next = activeRef.current + 1;
    if (!open) {
      setOpen(true);
      setZone(0);
    } else if (next >= SHEETS) {
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

  return (
    <div
      ref={rootRef}
      className="drawer-item"
      data-open={open ? "true" : "false"}
      data-active={active}
    >
      <div
        className="drawer-hit"
        role="button"
        tabIndex={0}
        aria-label={`${entry.value}, ${entry.count} titles. Move across the drawer or use arrow keys to leaf through the cards.`}
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
        <div className="drawer-stage">
          {/* The shelf box the cards live in. */}
          <div className="shelf-frame" aria-hidden="true" />

          {sheets.map((depth) => {
            const isBlank = depth === SHEETS - 1;
            const cover = COVER_CLASSES[(index + depth * 2) % COVER_CLASSES.length]!;
            // Front cards (lower depth) sit above the active one; fade them out.
            const state = !open
              ? "stored"
              : depth === active
                ? "selected"
                : depth < active
                  ? "front"
                  : "behind";
            return (
              <div
                key={depth}
                className={`shelf-card ${isBlank ? "shelf-card--blank cover-peacock" : cover}`}
                data-index={depth}
                data-state={state}
                aria-hidden="true"
              >
                <span className="shelf-card__spine" />
                {isBlank ? (
                  <span className="shelf-card__blank-note">+{entry.count - 3} more</span>
                ) : depth === 0 ? (
                  <span className="shelf-card__letter">{entry.value.charAt(0).toUpperCase()}</span>
                ) : (
                  <span className="shelf-card__title">{entry.titles[depth]}</span>
                )}
              </div>
            );
          })}

          {/* Drawer front that slides outward when the shelf opens. */}
          <div className="drawer-front" aria-hidden="true">
            <span className="drawer-front__face" />
            <span className="drawer-peg drawer-peg--left" />
            <span className="drawer-peg drawer-peg--right" />
          </div>
        </div>

        <div className="drawer-meta">
          <h3>{entry.value}</h3>
          <span className="drawer-tag">
            {entry.count} {entry.count === 1 ? "title" : "titles"}
          </span>
        </div>
      </div>
    </div>
  );
}
