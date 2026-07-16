/** Vibecano Product Designer — shared contracts */

export type PrintPositionId =
  | "front"
  | "back"
  | "pocket"
  | "sleeve"
  | "left_chest"
  | "right_chest"
  | "front_back"
  | "pocket_back";

export type SizeId = "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextCase = "none" | "uppercase" | "lowercase";
export type TextEffect =
  | "none"
  | "outline"
  | "shadow"
  | "curved"
  | "arc"
  | "vertical";

export type LayerType = "text" | "image" | "clipart" | "logo";
export type PersonalizationAction = "text" | "image" | "clipart" | "logo";
export type ActivePanel =
  | "options"
  | "personalize"
  | "text"
  | "upload"
  | null;

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  imageFront?: string;
  imageBack?: string;
}

export interface ProductSize {
  id: SizeId;
  label: string;
  inStock: boolean;
}

export interface PrintPosition {
  id: PrintPositionId;
  label: string;
  /** Which preview side to show when selected */
  previewSide: "front" | "back";
  /** CSS zone class for the editable area */
  zone: string;
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
  currencySymbol: string;
  material?: string;
  images: { front: string; back: string };
  colors: ProductColor[];
  sizes: ProductSize[];
  printPositions: PrintPosition[];
  sizeChart: {
    title: string;
    columns: string[];
    rows: SizeChartRow[];
  };
  maxUploadMb: number;
}

export interface FontOption {
  id: string;
  family: string;
  label: string;
  preview: string;
  category: "sans" | "serif" | "display" | "script";
}

export interface TextStyle {
  content: string;
  fontId: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  opacity: number;
  align: TextAlign;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: TextCase;
  color: string;
  effect: TextEffect;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
  curveAmount: number;
  gradientEnabled: boolean;
  gradientFrom: string;
  gradientTo: string;
  patternFill: boolean;
}

export interface DesignLayer {
  id: string;
  type: LayerType;
  name: string;
  positionId: PrintPositionId;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  text?: TextStyle;
  image?: {
    src: string;
    fileName: string;
    width: number;
    height: number;
    hasTransparency: boolean;
  };
}

export interface SizeQuantity {
  sizeId: SizeId;
  qty: number;
}

export interface UploadValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  meta?: {
    width: number;
    height: number;
    sizeBytes: number;
    mime: string;
    hasTransparency: boolean;
  };
}

export interface DesignerState {
  product: ProductData;
  loading: boolean;
  printPositionId: PrintPositionId;
  colorId: string;
  sizeMode: "single" | "multi";
  selectedSizeId: SizeId;
  sizeQuantities: Record<string, number>;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  activePanel: ActivePanel;
  recentFonts: string[];
  recentColors: string[];
  sizeChartOpen: boolean;
  uploadModalOpen: boolean;
  uploadProgress: number | null;
  uploadingFileName: string | null;
}
