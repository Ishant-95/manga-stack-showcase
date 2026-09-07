/**
 * Schema + browse logic ported from the original Manga Manager module
 * (manga_manager/models.py `Manga.get_manga_info`, manga_manager/web.py
 * `BROWSE_FIELDS`, `_field_counts` and the `/browse/<category>` route).
 *
 * Keeping the field names and the counting/sorting rules identical means a
 * real shelf payload from that module can be dropped straight into this UI.
 */

/** One record exactly as `Manga.to_dict()` serialises it. */
export type MangaRecord = {
  id: number;
  /** The work's title. Named `type` in the Python model. */
  type: string;
  author: string[];
  link: string;
  series: string | null;
  thumbnail: string | null;
  tags: string[];
  characters: string[];
  groups: string[];
  favorites: number | null;
  date_added: string;
  gallery_id: string | null;
  uploaded_at: string | null;
  last_checked_at: string | null;
  status: string;
  rating: number | null;
};

export type BrowseCategoryKey = "tags" | "artists" | "characters" | "parodies" | "groups";

/** web.py BROWSE_FIELDS: category -> (Manga field, display label). */
export const BROWSE_FIELDS: Record<
  BrowseCategoryKey,
  { field: keyof MangaRecord; label: string; blurb: string }
> = {
  tags: { field: "tags", label: "Tags", blurb: "Every theme filed across the shelf, drawer by drawer." },
  artists: { field: "author", label: "Artists", blurb: "Pens and studios behind the collection." },
  characters: {
    field: "characters",
    label: "Characters",
    blurb: "Recurring faces, sorted by how often they show up.",
  },
  parodies: { field: "series", label: "Parodies", blurb: "Fan works grouped by the series they riff on." },
  groups: { field: "groups", label: "Groups", blurb: "Circles and scanlation teams on the shelf." },
};

export const BROWSE_CATEGORY_KEYS = Object.keys(BROWSE_FIELDS) as BrowseCategoryKey[];

export type SortKey = "popular" | "az";

export type BrowseEntry = {
  value: string;
  count: number;
  /** Up to three sample titles filed under this value, for the drawer sheets. */
  titles: string[];
};

export type BrowseCategory = {
  key: BrowseCategoryKey;
  label: string;
  blurb: string;
  entries: BrowseEntry[];
};

function valuesOf(record: MangaRecord, field: keyof MangaRecord): string[] {
  const raw = record[field];
  if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
  return raw ? [String(raw)] : [];
}

/**
 * Port of web.py `_field_counts`, extended to also collect a few sample
 * titles per value (the drawer sheets show them).
 */
export function fieldCounts(records: MangaRecord[], field: keyof MangaRecord): BrowseEntry[] {
  const byValue = new Map<string, BrowseEntry>();
  for (const record of records) {
    for (const value of valuesOf(record, field)) {
      const entry = byValue.get(value) ?? { value, count: 0, titles: [] };
      entry.count += 1;
      if (entry.titles.length < 3 && record.type) entry.titles.push(record.type);
      byValue.set(value, entry);
    }
  }
  return [...byValue.values()];
}

/** Port of the sort branch in web.py `browse()`. */
export function sortEntries(entries: BrowseEntry[], sort: SortKey): BrowseEntry[] {
  const sorted = [...entries];
  if (sort === "az") {
    sorted.sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));
  } else {
    sorted.sort(
      (a, b) => b.count - a.count || a.value.toLowerCase().localeCompare(b.value.toLowerCase()),
    );
  }
  return sorted;
}

/** Build every browse category from a raw shelf payload. */
export function categoriesFromShelf(records: MangaRecord[]): BrowseCategory[] {
  return BROWSE_CATEGORY_KEYS.map((key) => {
    const { field, label, blurb } = BROWSE_FIELDS[key];
    return { key, label, blurb, entries: fieldCounts(records, field) };
  });
}
