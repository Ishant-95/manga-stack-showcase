import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { DrawerStack } from "@/components/DrawerStack";
import { getBrowseSource } from "@/lib/browse-source";
import type { BrowseCategory, BrowseCategoryKey, SortKey } from "@/lib/manga-manager";

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

type ViewKey = "drawer" | "chips";

const source = getBrowseSource();

function BrowsePage() {
  const [categoryKey, setCategoryKey] = useState<BrowseCategoryKey>("tags");
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<ViewKey>("drawer");
  const [query, setQuery] = useState("");

  const { data, isPending, error } = useQuery({
    queryKey: ["browse", source.info.kind, sort],
    queryFn: () => source.load(sort),
  });

  const categories: BrowseCategory[] = data ?? [];
  const category = categories.find((c) => c.key === categoryKey) ?? categories[0];

  const entries = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    return q ? category.entries.filter((e) => e.value.toLowerCase().includes(q)) : category.entries;
  }, [category, query]);

  const label = category?.label ?? "Shelf";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          manga<span>shelf</span>
        </a>
        <form className="search-form" onSubmit={(e) => e.preventDefault()} role="search">
          <label className="sr-only" htmlFor="browse-filter">
            Filter {label.toLowerCase()}
          </label>
          <input
            id="browse-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${label.toLowerCase()}...`}
          />
        </form>
        <nav className="topnav" aria-label="Browse categories">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={c.key === category?.key ? "active" : ""}
              aria-current={c.key === category?.key ? "page" : undefined}
              onClick={() => setCategoryKey(c.key)}
            >
              {c.label}
            </button>
          ))}
          <Link to="/theme" className="topnav-link">
            Theme
          </Link>
        </nav>
      </header>

      <main className="page">
        <div className="shelf-header">
          <div className="shelf-heading">
            <p className="eyebrow">Browse</p>
            <h1>{label}</h1>
            <p className="muted">{category?.blurb ?? "Loading the shelf…"}</p>
          </div>
          <div className="shelf-controls">
            <div className="sort-group" role="group" aria-label="Sort entries">
              <button
                type="button"
                className={`tag-chip ${sort === "popular" ? "tag-chip--on" : ""}`}
                aria-pressed={sort === "popular"}
                onClick={() => setSort("popular")}
              >
                Popular
              </button>
              <button
                type="button"
                className={`tag-chip ${sort === "az" ? "tag-chip--on" : ""}`}
                aria-pressed={sort === "az"}
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
                aria-label="Chip view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                  <rect x="2.5" y="6" width="19" height="5" rx="2.5" />
                  <rect x="2.5" y="14" width="13" height="5" rx="2.5" />
                </svg>
              </button>
              <button
                type="button"
                className={`view-btn ${view === "drawer" ? "active" : ""}`}
                onClick={() => setView("drawer")}
                aria-pressed={view === "drawer"}
                aria-label="Drawer view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <rect x="5" y="3" width="14" height="10" rx="2" opacity=".5" />
                  <path d="M3 13h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 17h6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="drawer-hint">
          Move your cursor up over a drawer to pull the sheets out one at a time — on touch,
          tap to leaf through, and with a keyboard use the arrow keys.
        </p>

        <div aria-live="polite">
          {error ? (
            <p className="muted empty-note" role="alert">
              Couldn’t reach the shelf: {(error as Error).message}
            </p>
          ) : isPending ? (
            <p className="muted empty-note">Loading the shelf…</p>
          ) : entries.length === 0 ? (
            <p className="muted empty-note">
              No {label.toLowerCase()} match “{query}”.
            </p>
          ) : view === "drawer" ? (
            <ul className="drawer-grid" aria-label={`${label} drawers`}>
              {entries.map((entry, i) => (
                <DrawerStack key={entry.value} entry={entry} index={i} />
              ))}
            </ul>
          ) : (
            <ul className="browse-grid" aria-label={`${label} chips`}>
              {entries.map((entry) => (
                <li key={entry.value}>
                  <button type="button" className="browse-entry">
                    {entry.value} <span className="browse-entry-count">{entry.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="shelf-footer">
        <span>
          {entries.length} {label.toLowerCase()} shown · {source.info.label} — {source.info.detail}
        </span>
      </footer>
    </div>
  );
}
