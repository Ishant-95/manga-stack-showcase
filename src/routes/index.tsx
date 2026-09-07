import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DrawerStack } from "@/components/DrawerStack";
import { CATEGORIES } from "@/data/browse";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Browse the Shelf — mangashelf" },
      {
        name: "description",
        content:
          "Browse a manga collection by tag, artist, character, parody and group — each entry is a small drawer of cover sheets you can leaf through.",
      },
      { property: "og:title", content: "Browse the Shelf — mangashelf" },
      {
        property: "og:description",
        content:
          "A paper-warm manga browser where every category sits in a strapped drawer of cover sheets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowsePage,
});

type SortKey = "popular" | "az";
type ViewKey = "drawer" | "chips";

function BrowsePage() {
  const [categoryKey, setCategoryKey] = useState(CATEGORIES[0]!.key);
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<ViewKey>("drawer");
  const [query, setQuery] = useState("");

  const category = CATEGORIES.find((c) => c.key === categoryKey) ?? CATEGORIES[0]!;

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? category.entries.filter((e) => e.value.toLowerCase().includes(q))
      : category.entries;
    return [...filtered].sort((a, b) =>
      sort === "az" ? a.value.localeCompare(b.value) : b.count - a.count,
    );
  }, [category, sort, query]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          manga<span>shelf</span>
        </a>
        <form className="search-form" onSubmit={(e) => e.preventDefault()} role="search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${category.label.toLowerCase()}...`}
            aria-label={`Filter ${category.label.toLowerCase()}`}
          />
        </form>
        <nav className="topnav" aria-label="Browse categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={c.key === categoryKey ? "active" : ""}
              onClick={() => setCategoryKey(c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="page">
        <div className="shelf-header">
          <div className="shelf-heading">
            <p className="eyebrow">Browse</p>
            <h1>{category.label}</h1>
            <p className="muted">{category.blurb}</p>
          </div>
          <div className="shelf-controls">
            <div className="sort-group" role="group" aria-label="Sort entries">
              <button
                type="button"
                className={`tag-chip ${sort === "popular" ? "tag-chip--on" : ""}`}
                onClick={() => setSort("popular")}
              >
                Popular
              </button>
              <button
                type="button"
                className={`tag-chip ${sort === "az" ? "tag-chip--on" : ""}`}
                onClick={() => setSort("az")}
              >
                A–Z
              </button>
            </div>
            <div className="view-toggle" role="group" aria-label="Card style">
              <button
                type="button"
                className={`view-btn ${view === "chips" ? "active" : ""}`}
                onClick={() => setView("chips")}
                aria-pressed={view === "chips"}
                title="Chip view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2.5" y="6" width="19" height="5" rx="2.5" />
                  <rect x="2.5" y="14" width="13" height="5" rx="2.5" />
                </svg>
              </button>
              <button
                type="button"
                className={`view-btn ${view === "drawer" ? "active" : ""}`}
                onClick={() => setView("drawer")}
                aria-pressed={view === "drawer"}
                title="Drawer view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="3" width="14" height="10" rx="2" opacity=".5" />
                  <path d="M3 13h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 17h6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="drawer-hint">
          Move your cursor across a drawer to leaf through its cards — each slides out of the
          shelf in turn. On touch, tap to step through.
        </p>

        {entries.length === 0 ? (
          <p className="muted empty-note">
            No {category.label.toLowerCase()} match “{query}”.
          </p>
        ) : view === "drawer" ? (
          <div className="drawer-grid">
            {entries.map((entry, i) => (
              <DrawerStack key={entry.value} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <div className="browse-grid">
            {entries.map((entry) => (
              <button key={entry.value} type="button" className="browse-entry">
                {entry.value} <span className="browse-entry-count">{entry.count}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="shelf-footer">
        <span>Demo shelf — {entries.length} {category.label.toLowerCase()} shown</span>
      </footer>
    </div>
  );
}
