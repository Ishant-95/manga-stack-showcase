import { createFileRoute, Link } from "@tanstack/react-router";

import { DrawerStack } from "@/components/DrawerStack";
import { SAMPLE_CATEGORIES } from "@/data/browse";

export const Route = createFileRoute("/theme")({
  head: () => ({
    meta: [
      { title: "Theme Preview — mangashelf" },
      {
        name: "description",
        content:
          "Palette, typography, spacing and drawer component states used across the mangashelf browse demo.",
      },
      { property: "og:title", content: "Theme Preview — mangashelf" },
      {
        property: "og:description",
        content: "The paper-warm palette, type scale and drawer states behind the mangashelf browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThemePage,
});

const COLORS: { token: string; label: string }[] = [
  { token: "--bg", label: "Page" },
  { token: "--bg-raised", label: "Raised" },
  { token: "--card", label: "Card" },
  { token: "--card-hover", label: "Card hover" },
  { token: "--border", label: "Border" },
  { token: "--text", label: "Text" },
  { token: "--text-soft", label: "Text soft" },
  { token: "--text-faint", label: "Text faint" },
  { token: "--sidebar-bg", label: "Sidebar" },
  { token: "--accent", label: "Accent" },
  { token: "--accent-strong", label: "Accent strong" },
];

const SPACING = [4, 8, 12, 16, 22, 28, 40];

const sampleEntry = SAMPLE_CATEGORIES[0]!.entries[0]!;

function ThemePage() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          manga<span>shelf</span>
        </a>
        <nav className="topnav" aria-label="Sections">
          <Link to="/" className="topnav-link">
            Browse
          </Link>
        </nav>
      </header>

      <main className="page">
        <div className="shelf-header">
          <div className="shelf-heading">
            <p className="eyebrow">Design</p>
            <h1>Theme preview</h1>
            <p className="muted">
              The palette, type scale, spacing rhythm and drawer states used by the browse demo.
            </p>
          </div>
        </div>

        <section aria-labelledby="palette-heading" className="theme-section">
          <h2 id="palette-heading">Palette</h2>
          <ul className="swatch-grid">
            {COLORS.map((c) => (
              <li key={c.token} className="swatch">
                <span className="swatch__chip" style={{ background: `var(${c.token})` }} aria-hidden="true" />
                <span className="swatch__label">{c.label}</span>
                <code className="swatch__token">{c.token}</code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type-heading" className="theme-section">
          <h2 id="type-heading">Typography</h2>
          <div className="type-samples">
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>
              Fraunces 26/700 — page heading
            </p>
            <p style={{ fontSize: 15 }}>DM Sans 15 — body copy for blurbs and descriptions.</p>
            <p className="muted">DM Sans 13 muted — secondary notes.</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
              DM Mono 12 — counts, tokens and metadata
            </p>
          </div>
        </section>

        <section aria-labelledby="spacing-heading" className="theme-section">
          <h2 id="spacing-heading">Spacing</h2>
          <ul className="spacing-scale">
            {SPACING.map((s) => (
              <li key={s}>
                <span className="spacing-bar" style={{ width: s }} aria-hidden="true" />
                <code>{s}px</code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="drawer-heading" className="theme-section">
          <h2 id="drawer-heading">Drawer states</h2>
          <p className="muted">
            Closed, and mid-leaf. Hover, focus or tap either drawer to run the full sequence.
          </p>
          <ul className="drawer-grid" aria-label="Drawer component states">
            <DrawerStack entry={sampleEntry} index={0} />
            <DrawerStack entry={SAMPLE_CATEGORIES[0]!.entries[1] ?? sampleEntry} index={2} />
          </ul>
        </section>
      </main>

      <footer className="shelf-footer">
        <span>Theme reference — mangashelf browse demo</span>
      </footer>
    </div>
  );
}
