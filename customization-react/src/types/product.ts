/** Vibecano Customization — Product & design state types */

export type PrintLocationId =
  | "front"
  | "back"
  | "left_chest"
  | "right_chest"
  | "left_sleeve"
  | "right_sleeve";

export type ArtworkSizeKey = "L" | "M" | "S";
export type DecorationStyle = "screenprint" | "embroidery";
export type DeliverySpeed = "express_3" | "standard_5" | "economy_10";
export type FontType = "block" | "script" | "modern";
export type TextPosition =
  | "left_chest"
  | "right_chest"
  | "center_chest"
  | "center_front"
  | "center_back";

export type PrintPositionMode =
  | "full_front_back"
  | "full_front"
  | "left_chest"
  | "back_only"
  | "left_chest_back"
  | "double_side";

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  group: "core" | "limited";
  surcharge?: number;
  imageFront?: string;
  imageBack?: string;
  stock?: number;
}

export interface ProductSize {
  id: string;
  label: string;
  stock?: number;
  kids?: boolean;
}

export interface SizeChartRow {
  label: string;
  values: Record<string, string | number>;
}

export interface ProductData {
  id: string | number;
  name: string;
  slug: string;
  basePrice: number;
  currency: string;
  currencySymbol: string;
  material: string;
  description?: string;
  images: {
    front: string;
    back: string;
  };
  colors: ProductColor[];
  sizes: ProductSize[];
  sizeChart: {
    title: string;
    columns: string[];
    rows: SizeChartRow[];
  };
  pricing: {
    extraLocationFee: number;
    doubleSideFee: number;
    embroideryFee: number;
    digitizationFee: number;
    rushDeliveryFee: number;
  };
  supportsKidsSizes?: boolean;
  textOnlyMode?: boolean;
}

export interface LocationArtwork {
  fileName?: string;
  previewUrl?: string;
  size: ArtworkSizeKey;
  digitized: boolean;
}

export interface LocationText {
  enabled: boolean;
  line1: string;
  line2: string;
  position: TextPosition;
  color: string;
  font: FontType;
}

export interface LocationConfig {
  locationId: PrintLocationId;
  artwork: LocationArtwork | null;
  text: LocationText;
}

export interface CustomizationState {
  product: ProductData | null;
  loading: boolean;
  error: string | null;
  selectedColorId: string;
  selectedSizeId: string;
  multiSizeMode: boolean;
  sizeQuantities: Record<string, number>;
  decorationStyle: DecorationStyle;
  activeLocations: PrintLocationId[];
  locationConfigs: Record<string, LocationConfig>;
  printPositionMode: PrintPositionMode | null;
  deliverySpeed: DeliverySpeed;
  quantity: number;
  previewSide: "front" | "back" | "360";
  priceBreakdownOpen: boolean;
}

export interface PriceBreakdown {
  base: number;
  colorSurcharge: number;
  locationFees: number;
  doubleSideFee: number;
  embroideryFee: number;
  digitizationFee: number;
  rushFee: number;
  unitTotal: number;
  quantity: number;
  grandTotal: number;
  lines: { label: string; amount: number }[];
}
