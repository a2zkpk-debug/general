import type { FontOption, PrintPosition, ProductData } from "../types/designer";

export const PRINT_POSITIONS: PrintPosition[] = [
  { id: "front", label: "Front", previewSide: "front", zone: "front" },
  { id: "back", label: "Back", previewSide: "back", zone: "back" },
  { id: "pocket", label: "Pocket", previewSide: "front", zone: "pocket" },
  { id: "sleeve", label: "Sleeve", previewSide: "front", zone: "sleeve" },
  { id: "left_chest", label: "Left Chest", previewSide: "front", zone: "left_chest" },
  { id: "right_chest", label: "Right Chest", previewSide: "front", zone: "right_chest" },
  { id: "front_back", label: "Front + Back", previewSide: "front", zone: "front" },
  { id: "pocket_back", label: "Pocket + Back", previewSide: "front", zone: "pocket" },
];

export const FONTS: FontOption[] = [
  { id: "manrope", family: "Manrope", label: "Manrope", preview: "Aa Bb Cc", category: "sans" },
  { id: "jakarta", family: "Plus Jakarta Sans", label: "Jakarta", preview: "Aa Bb Cc", category: "sans" },
  { id: "bebas", family: "Bebas Neue", label: "Bebas Neue", preview: "AA BB CC", category: "display" },
  { id: "playfair", family: "Playfair Display", label: "Playfair", preview: "Aa Bb Cc", category: "serif" },
  { id: "pacifico", family: "Pacifico", label: "Pacifico", preview: "Aa Bb Cc", category: "script" },
  { id: "oswald", family: "Oswald", label: "Oswald", preview: "Aa Bb Cc", category: "display" },
  { id: "lora", family: "Lora", label: "Lora", preview: "Aa Bb Cc", category: "serif" },
  { id: "space", family: "Space Grotesk", label: "Space Grotesk", preview: "Aa Bb Cc", category: "sans" },
];

export const PRESET_COLORS = [
  "#FFFFFF",
  "#111827",
  "#0B3D4A",
  "#0E7490",
  "#F97316",
  "#DC2626",
  "#D97706",
  "#16A34A",
  "#1D4ED8",
  "#7C3AED",
  "#DB2777",
  "#EAB308",
];

export const SAMPLE_PRODUCT: ProductData = {
  id: 1001,
  name: "Classic Cotton Tee",
  slug: "classic-cotton-tee",
  basePrice: 1499,
  currencySymbol: "Rs ",
  material: "100% Combed Cotton · 180 GSM",
  images: {
    front:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop",
    back:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&h=1100&fit=crop",
  },
  colors: [
    { id: "white", name: "White", hex: "#F5F5F4", inStock: true },
    { id: "black", name: "Black", hex: "#111827", inStock: true },
    { id: "navy", name: "Deep Navy", hex: "#0B3D4A", inStock: true },
    { id: "heather", name: "Heather Grey", hex: "#9CA3AF", inStock: true },
    { id: "forest", name: "Forest", hex: "#166534", inStock: true },
    { id: "maroon", name: "Maroon", hex: "#7F1D1D", inStock: false },
    { id: "ocean", name: "Ocean Teal", hex: "#0E7490", inStock: true },
    { id: "coral", name: "Sunset Coral", hex: "#EA580C", inStock: true },
    { id: "royal", name: "Royal Blue", hex: "#1D4ED8", inStock: true },
    { id: "sand", name: "Desert Sand", hex: "#D6B88D", inStock: false },
  ],
  sizes: [
    { id: "xs", label: "XS", inStock: true },
    { id: "s", label: "S", inStock: true },
    { id: "m", label: "M", inStock: true },
    { id: "l", label: "L", inStock: true },
    { id: "xl", label: "XL", inStock: true },
    { id: "xxl", label: "XXL", inStock: false },
  ],
  printPositions: PRINT_POSITIONS,
  sizeChart: {
    title: "Regular Fit Size Chart (inches)",
    columns: ["XS", "S", "M", "L", "XL", "XXL"],
    rows: [
      { label: "Length", values: { XS: 26, S: 27, M: 28, L: 29, XL: 30, XXL: 31 } },
      { label: "Chest", values: { XS: 18.5, S: 19.5, M: 20.5, L: 21.5, XL: 22.5, XXL: 23.5 } },
      { label: "Shoulder", values: { XS: 17, S: 18, M: 19, L: 20, XL: 21, XXL: 22 } },
      { label: "Sleeve", values: { XS: 7.5, S: 8, M: 8.5, L: 9, XL: 9.5, XXL: 10 } },
    ],
  },
  maxUploadMb: 15,
};

export const DEFAULT_TEXT_STYLE = {
  content: "",
  fontId: "manrope",
  fontSize: 36,
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1.2,
  rotation: 0,
  opacity: 1,
  align: "center" as const,
  bold: false,
  italic: false,
  underline: false,
  textCase: "none" as const,
  color: "#111827",
  effect: "none" as const,
  strokeWidth: 0,
  strokeColor: "#FFFFFF",
  shadowBlur: 0,
  shadowColor: "rgba(0,0,0,0.35)",
  curveAmount: 0,
  gradientEnabled: false,
  gradientFrom: "#0B3D4A",
  gradientTo: "#0E7490",
  patternFill: false,
};
