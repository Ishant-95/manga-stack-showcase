export type CoverClass =
  | "cover-moss"
  | "cover-cobalt"
  | "cover-moon"
  | "cover-ember"
  | "cover-coral"
  | "cover-ink"
  | "cover-peacock";

export const COVER_CLASSES: CoverClass[] = [
  "cover-moss",
  "cover-cobalt",
  "cover-moon",
  "cover-ember",
  "cover-coral",
  "cover-ink",
];

export type BrowseEntry = {
  value: string;
  count: number;
  /** Sample titles filed under this entry, shown on the fanned-out sheets. */
  titles: [string, string, string];
};

export type BrowseCategory = {
  key: string;
  label: string;
  blurb: string;
  entries: BrowseEntry[];
};

export const CATEGORIES: BrowseCategory[] = [
  {
    key: "tags",
    label: "Tags",
    blurb: "Every theme filed across the shelf, drawer by drawer.",
    entries: [
      {
        value: "Slice of Life",
        count: 42,
        titles: ["Lantern Street Diaries", "Tea at Half Past Four", "The Quiet Ward"],
      },
      {
        value: "Supernatural",
        count: 37,
        titles: ["Hollow Bell Hour", "Nine-Tailed Debt", "Paper Charms"],
      },
      {
        value: "Historical",
        count: 28,
        titles: ["Edo Rain", "The Cartographer's Wife", "Salt & Silk Road"],
      },
      {
        value: "Coming of Age",
        count: 26,
        titles: ["Fifteen Summers", "Bicycle Weather", "Cram School Blues"],
      },
      {
        value: "Sci-Fi",
        count: 24,
        titles: ["Orbital Bento", "Terminal Bloom", "The Long Signal"],
      },
      {
        value: "Romance",
        count: 21,
        titles: ["Two Stops Early", "Winter Konbini", "Letters to Aoi"],
      },
      {
        value: "Mystery",
        count: 19,
        titles: ["The Locked Bathhouse", "Nightbus 22", "Ash on the Tatami"],
      },
      {
        value: "Sports",
        count: 17,
        titles: ["Third Set Rain", "Kendo Kids", "Two Lanes Over"],
      },
      {
        value: "Horror",
        count: 15,
        titles: ["The Tunnel Below", "Mouths in the Wall", "Grandmother's Doll"],
      },
      {
        value: "Cooking",
        count: 13,
        titles: ["Midnight Ramen Cart", "Sour Plum Season", "Kitchen of Small Gods"],
      },
      {
        value: "Mecha",
        count: 11,
        titles: ["Iron Cicada", "Pilot 04", "Scrapyard Saints"],
      },
      {
        value: "Fantasy",
        count: 9,
        titles: ["Moth Kingdom", "The Borrowed Sword", "Glassbone Forest"],
      },
    ],
  },
  {
    key: "artists",
    label: "Artists",
    blurb: "Pens and studios behind the collection.",
    entries: [
      { value: "Ayano Kuze", count: 18, titles: ["Hollow Bell Hour", "Paper Charms", "Edo Rain"] },
      { value: "Ren Mizuhara", count: 14, titles: ["Orbital Bento", "Terminal Bloom", "Pilot 04"] },
      {
        value: "Sae Todoroki",
        count: 12,
        titles: ["Two Stops Early", "Winter Konbini", "Bicycle Weather"],
      },
      {
        value: "Jun Arakawa",
        count: 11,
        titles: ["The Locked Bathhouse", "Nightbus 22", "Ash on the Tatami"],
      },
      {
        value: "Hina Odagiri",
        count: 9,
        titles: ["Lantern Street Diaries", "The Quiet Ward", "Fifteen Summers"],
      },
      {
        value: "Kaoru Beniya",
        count: 8,
        titles: ["Salt & Silk Road", "Moth Kingdom", "Glassbone Forest"],
      },
      {
        value: "Studio Yomogi",
        count: 7,
        titles: ["Iron Cicada", "Scrapyard Saints", "The Long Signal"],
      },
      {
        value: "Tsuki Nabeshima",
        count: 6,
        titles: ["Midnight Ramen Cart", "Sour Plum Season", "Third Set Rain"],
      },
    ],
  },
  {
    key: "characters",
    label: "Characters",
    blurb: "Recurring faces, sorted by how often they show up.",
    entries: [
      {
        value: "Aoi Sagara",
        count: 16,
        titles: ["Letters to Aoi", "Two Stops Early", "Bicycle Weather"],
      },
      { value: "Detective Fumi", count: 12, titles: ["Nightbus 22", "The Locked Bathhouse", "Ash on the Tatami"] },
      { value: "Kuro the Cat", count: 10, titles: ["Paper Charms", "Tea at Half Past Four", "Moth Kingdom"] },
      { value: "Pilot 04", count: 8, titles: ["Pilot 04", "Iron Cicada", "Scrapyard Saints"] },
      { value: "Grandmother Ise", count: 7, titles: ["Grandmother's Doll", "The Quiet Ward", "Edo Rain"] },
      { value: "Chef Hoshino", count: 5, titles: ["Midnight Ramen Cart", "Kitchen of Small Gods", "Sour Plum Season"] },
    ],
  },
  {
    key: "parodies",
    label: "Parodies",
    blurb: "Fan works grouped by the series they riff on.",
    entries: [
      { value: "Hollow Bell Hour", count: 13, titles: ["Bell Hour: Afterschool", "Nine-Tailed Debt", "Paper Charms"] },
      { value: "Orbital Bento", count: 9, titles: ["Orbital Bento: Recess", "Terminal Bloom", "The Long Signal"] },
      { value: "Third Set Rain", count: 7, titles: ["Third Set Rain: Off Season", "Two Lanes Over", "Kendo Kids"] },
      { value: "Moth Kingdom", count: 6, titles: ["Moth Kingdom: Dusk Court", "Glassbone Forest", "The Borrowed Sword"] },
      { value: "Edo Rain", count: 4, titles: ["Edo Rain: Teahouse", "Salt & Silk Road", "The Cartographer's Wife"] },
    ],
  },
  {
    key: "groups",
    label: "Groups",
    blurb: "Circles and scanlation teams on the shelf.",
    entries: [
      { value: "Nightlamp Circle", count: 15, titles: ["Hollow Bell Hour", "Nightbus 22", "The Tunnel Below"] },
      { value: "Kissa Press", count: 11, titles: ["Tea at Half Past Four", "Winter Konbini", "Sour Plum Season"] },
      { value: "Yomogi Works", count: 9, titles: ["Iron Cicada", "Pilot 04", "Orbital Bento"] },
      { value: "Blue Awning", count: 6, titles: ["Two Stops Early", "Letters to Aoi", "Fifteen Summers"] },
    ],
  },
];
