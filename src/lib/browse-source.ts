/**
 * Browse data service.
 *
 * The original Manga Manager is a local Flask app: every browse page is
 * server-rendered HTML behind a login session and an encrypted local vault,
 * so this web app cannot read it over the network as shipped. Rather than
 * fake a live connection, this module defines one adapter interface with two
 * implementations:
 *
 *   - `snapshotSource`  — bundled counts snapshot (default, used by the demo)
 *   - `httpSource(url)` — talks to a JSON endpoint that serves the shelf in
 *                         the module's own schema (see
 *                         docs/manga-manager-integration.md for the exact
 *                         endpoint you need to add to web.py)
 *
 * Configure the live one with `VITE_MANGA_MANAGER_URL` (and optionally
 * `VITE_MANGA_MANAGER_TOKEN`).
 */

import { SAMPLE_CATEGORIES } from "@/data/browse";
import {
  categoriesFromShelf,
  sortEntries,
  type BrowseCategory,
  type BrowseCategoryKey,
  type MangaRecord,
  type SortKey,
} from "@/lib/manga-manager";

export type BrowseSourceInfo = {
  kind: "snapshot" | "http";
  label: string;
  detail: string;
};

export type BrowseSource = {
  info: BrowseSourceInfo;
  /** All categories, entries already sorted the way web.py sorts them. */
  load(sort: SortKey): Promise<BrowseCategory[]>;
};

function sortAll(categories: BrowseCategory[], sort: SortKey): BrowseCategory[] {
  return categories.map((c) => ({ ...c, entries: sortEntries(c.entries, sort) }));
}

export const snapshotSource: BrowseSource = {
  info: {
    kind: "snapshot",
    label: "Bundled snapshot",
    detail:
      "No Manga Manager instance configured — showing a counts snapshot in the module's own browse schema.",
  },
  load: async (sort) => sortAll(SAMPLE_CATEGORIES, sort),
};

/** Shape the JSON endpoint must return: `{ "manga": [ Manga.to_dict(), ... ] }`. */
type ShelfPayload = { manga: MangaRecord[] };

export function httpSource(baseUrl: string, token?: string): BrowseSource {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/shelf`;
  return {
    info: {
      kind: "http",
      label: "Live Manga Manager",
      detail: `Reading ${endpoint}`,
    },
    load: async (sort) => {
      const response = await fetch(endpoint, {
        headers: token ? { "X-API-Token": token } : undefined,
        credentials: "omit",
      });
      if (!response.ok) {
        throw new Error(`Manga Manager returned ${response.status} for ${endpoint}`);
      }
      const payload = (await response.json()) as ShelfPayload;
      return sortAll(categoriesFromShelf(payload.manga ?? []), sort);
    },
  };
}

export function getBrowseSource(): BrowseSource {
  const baseUrl = import.meta.env["VITE_MANGA_MANAGER_URL"] as string | undefined;
  if (!baseUrl) return snapshotSource;
  return httpSource(baseUrl, import.meta.env["VITE_MANGA_MANAGER_TOKEN"] as string | undefined);
}

export type { BrowseCategory, BrowseCategoryKey, SortKey };
