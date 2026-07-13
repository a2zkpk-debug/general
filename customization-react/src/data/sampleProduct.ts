import type { ProductData } from "../types/product";

/** Sample product — Classic Cotton Tee (Pakistan PKR pricing) */
export const SAMPLE_PRODUCT: ProductData = {
  id: 1001,
  name: "Classic Cotton Tee",
  slug: "classic-cotton-tee",
  basePrice: 1499,
  currency: "PKR",
  currencySymbol: "Rs ",
  material: "100% Combed Cotton · 180 GSM",
  description:
    "Soft, breathable everyday tee — perfect for screenprint or embroidery.",
  images: {
    front:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop",
    back:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&h=1100&fit=crop",
  },
  colors: [
    { id: "white", name: "White", hex: "#F5F5F4", group: "core" },
    { id: "black", name: "Black", hex: "#111827", group: "core" },
    { id: "navy", name: "Deep Navy", hex: "#0B3D4A", group: "core" },
    { id: "heather-grey", name: "Heather Grey", hex: "#9CA3AF", group: "core" },
    { id: "forest", name: "Forest", hex: "#166534", group: "core" },
    { id: "maroon", name: "Maroon", hex: "#7F1D1D", group: "core" },
    {
      id: "ocean",
      name: "Ocean Teal",
      hex: "#0E7490",
      group: "limited",
      surcharge: 100,
    },
    {
      id: "sunset",
      name: "Sunset Coral",
      hex: "#EA580C",
      group: "limited",
      surcharge: 100,
    },
    {
      id: "royal",
      name: "Royal Blue",
      hex: "#1D4ED8",
      group: "limited",
      surcharge: 150,
    },
    {
      id: "sand",
      name: "Desert Sand",
      hex: "#D6B88D",
      group: "limited",
      surcharge: 100,
    },
  ],
  sizes: [
    { id: "xxs", label: "XXS", stock: 8 },
    { id: "xs", label: "XS", stock: 14 },
    { id: "s", label: "S", stock: 42 },
    { id: "m", label: "M", stock: 56 },
    { id: "l", label: "L", stock: 48 },
    { id: "xl", label: "XL", stock: 31 },
    { id: "2xl", label: "2XL", stock: 18 },
    { id: "3xl", label: "3XL", stock: 9 },
    { id: "4xl", label: "4XL", stock: 4 },
    { id: "5xl", label: "5XL", stock: 2 },
    { id: "6xl", label: "6XL", stock: 1 },
    { id: "kids-s", label: "Kids S", stock: 12, kids: true },
    { id: "kids-m", label: "Kids M", stock: 15, kids: true },
    { id: "kids-l", label: "Kids L", stock: 10, kids: true },
  ],
  sizeChart: {
    title: "Regular Fit Size Chart (inches)",
    columns: ["S", "M", "L", "XL", "2XL", "3XL"],
    rows: [
      { label: "Length", values: { S: 27, M: 28, L: 29, XL: 30, "2XL": 31, "3XL": 32 } },
      { label: "Shoulder", values: { S: 18, M: 19, L: 20, XL: 21, "2XL": 22, "3XL": 23 } },
      { label: "Chest", values: { S: 19.5, M: 20.5, L: 21.5, XL: 22.5, "2XL": 23.5, "3XL": 24.5 } },
      { label: "Sleeves", values: { S: 8, M: 8.5, L: 9, XL: 9.5, "2XL": 10, "3XL": 10.5 } },
    ],
  },
  pricing: {
    extraLocationFee: 200,
    doubleSideFee: 300,
    embroideryFee: 250,
    digitizationFee: 500,
    rushDeliveryFee: 400,
  },
  supportsKidsSizes: true,
  textOnlyMode: false,
};

export const ARTWORK_SIZES = {
  front: { L: '12"', M: '8"', S: '4"' },
  back: { L: '12"', M: '8"', S: '4"' },
  left_chest: { L: '4.5"', M: '3.75"', S: '3"' },
  right_chest: { L: '4.5"', M: '3.75"', S: '3"' },
  left_sleeve: { L: '3.5"', M: '3"', S: '2.5"' },
  right_sleeve: { L: '3.5"', M: '3"', S: '2.5"' },
} as const;

export const LOCATION_META = [
  { id: "front", label: "Front", icon: "front" },
  { id: "back", label: "Back", icon: "back" },
  { id: "left_chest", label: "Left Chest", icon: "chest" },
  { id: "right_chest", label: "Right Chest", icon: "chest" },
  { id: "left_sleeve", label: "Left Sleeve", icon: "sleeve" },
  { id: "right_sleeve", label: "Right Sleeve", icon: "sleeve" },
] as const;

export const PRINT_POSITION_OPTIONS = [
  { id: "full_front_back", label: "Full Front/Back", surcharge: 0 },
  { id: "full_front", label: "Full Front Only", surcharge: 0 },
  { id: "left_chest", label: "Left Chest Only", surcharge: 0 },
  { id: "back_only", label: "Back Only", surcharge: 0 },
  { id: "left_chest_back", label: "Left Chest/Back", surcharge: 0 },
  { id: "double_side", label: "Double Side", surcharge: 300 },
] as const;

export const TEXT_COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#111827" },
  { name: "Navy", hex: "#0B3D4A" },
  { name: "Red", hex: "#DC2626" },
  { name: "Gold", hex: "#D97706" },
  { name: "Sky", hex: "#0284C7" },
] as const;
