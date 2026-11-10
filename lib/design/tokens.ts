/**
 * Colour tokens confirmed against the owner-supplied brand board
 * at public/brand/goodmiles-brand-board.jpeg.
 *
 * Hex values printed on that board are the source of truth.
 * The page background is darker than the Midnight Blue swatch because
 * the board's outer field is darker than #142C45. That darker navy is
 * the master plan's midnight navy and is used only for page chrome.
 */
export const palette = [
  {
    name: "Midnight navy",
    token: "ink",
    hex: "#071824",
    role: "Page background and darkest chrome",
  },
  {
    name: "Midnight blue",
    token: "navy",
    hex: "#142C45",
    role: "Primary brand colour from the board",
  },
  {
    name: "Elevated surface",
    token: "elevated",
    hex: "#203C53",
    role: "Cards and raised panels on navy",
  },
  {
    name: "Ice blue",
    token: "ice",
    hex: "#8DC9E8",
    role: "Accent, wordmark period, and focus",
  },
  {
    name: "Pearl white",
    token: "pearl",
    hex: "#F5FBFA",
    role: "Primary text on dark surfaces and light panels",
  },
  {
    name: "Silver",
    token: "silver",
    hex: "#B7C5D0",
    role: "Muted text on dark surfaces",
  },
  {
    name: "Slate",
    token: "slate",
    hex: "#303A45",
    role: "Body text on light surfaces",
  },
  {
    name: "Light grey",
    token: "mist",
    hex: "#E6EBF0",
    role: "Light panel background",
  },
] as const;

export type PaletteToken = (typeof palette)[number]["token"];

export const colours = Object.fromEntries(
  palette.map((colour) => [colour.token, colour.hex]),
) as Record<PaletteToken, string>;
