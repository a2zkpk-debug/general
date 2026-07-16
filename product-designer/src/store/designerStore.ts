import { create } from "zustand";
import { DEFAULT_TEXT_STYLE, SAMPLE_PRODUCT } from "../data/catalog";
import type {
  ActivePanel,
  DesignLayer,
  DesignerState,
  PrintPositionId,
  SizeId,
  TextStyle,
} from "../types/designer";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

interface DesignerActions {
  setPrintPosition: (id: PrintPositionId) => void;
  setColor: (id: string) => void;
  setSizeMode: (mode: "single" | "multi") => void;
  setSelectedSize: (id: SizeId) => void;
  setSizeQty: (id: SizeId, qty: number) => void;
  setActivePanel: (panel: ActivePanel) => void;
  openSizeChart: (open: boolean) => void;
  openUploadModal: (open: boolean) => void;
  setUploadProgress: (progress: number | null, fileName?: string | null) => void;
  addTextLayer: (content?: string) => void;
  updateTextStyle: (layerId: string, patch: Partial<TextStyle>) => void;
  addImageLayer: (payload: {
    src: string;
    fileName: string;
    width: number;
    height: number;
    hasTransparency: boolean;
  }) => void;
  selectLayer: (id: string | null) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  rememberFont: (fontId: string) => void;
  rememberColor: (hex: string) => void;
  totalQuantity: () => number;
}

const initialColor =
  SAMPLE_PRODUCT.colors.find((c) => c.inStock)?.id || SAMPLE_PRODUCT.colors[0].id;
const initialSize =
  SAMPLE_PRODUCT.sizes.find((s) => s.inStock && s.id === "m")?.id ||
  SAMPLE_PRODUCT.sizes.find((s) => s.inStock)?.id ||
  SAMPLE_PRODUCT.sizes[0].id;

export const useDesignerStore = create<DesignerState & DesignerActions>((set, get) => ({
  product: SAMPLE_PRODUCT,
  loading: false,
  printPositionId: "front",
  colorId: initialColor,
  sizeMode: "single",
  selectedSizeId: initialSize,
  sizeQuantities: { [initialSize]: 1 },
  layers: [],
  selectedLayerId: null,
  activePanel: "options",
  recentFonts: ["manrope", "bebas", "pacifico"],
  recentColors: ["#111827", "#FFFFFF", "#0B3D4A", "#F97316"],
  sizeChartOpen: false,
  uploadModalOpen: false,
  uploadProgress: null,
  uploadingFileName: null,

  setPrintPosition: (id) => set({ printPositionId: id }),
  setColor: (id) => set({ colorId: id }),
  setSizeMode: (mode) => set({ sizeMode: mode }),
  setSelectedSize: (id) =>
    set({
      selectedSizeId: id,
      sizeQuantities: { ...get().sizeQuantities, [id]: Math.max(1, get().sizeQuantities[id] || 1) },
    }),
  setSizeQty: (id, qty) =>
    set({
      sizeQuantities: {
        ...get().sizeQuantities,
        [id]: Math.max(0, Math.min(99, Math.floor(qty))),
      },
    }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  openSizeChart: (open) => set({ sizeChartOpen: open }),
  openUploadModal: (open) => set({ uploadModalOpen: open }),
  setUploadProgress: (progress, fileName = null) =>
    set({ uploadProgress: progress, uploadingFileName: fileName }),

  addTextLayer: (content = "Your text") => {
    const layer: DesignLayer = {
      id: uid("txt"),
      type: "text",
      name: "Text",
      positionId: get().printPositionId,
      visible: true,
      locked: false,
      x: 50,
      y: 42,
      scale: 1,
      rotation: 0,
      opacity: 1,
      text: { ...DEFAULT_TEXT_STYLE, content },
    };
    set({
      layers: [...get().layers, layer],
      selectedLayerId: layer.id,
      activePanel: "text",
    });
  },

  updateTextStyle: (layerId, patch) =>
    set({
      layers: get().layers.map((layer) =>
        layer.id === layerId && layer.text
          ? { ...layer, text: { ...layer.text, ...patch } }
          : layer
      ),
    }),

  addImageLayer: (payload) => {
    const layer: DesignLayer = {
      id: uid("img"),
      type: "image",
      name: payload.fileName,
      positionId: get().printPositionId,
      visible: true,
      locked: false,
      x: 50,
      y: 45,
      scale: 1,
      rotation: 0,
      opacity: 1,
      image: payload,
    };
    set({
      layers: [...get().layers, layer],
      selectedLayerId: layer.id,
      activePanel: "personalize",
      uploadModalOpen: false,
      uploadProgress: null,
      uploadingFileName: null,
    });
  },

  selectLayer: (id) => set({ selectedLayerId: id }),
  removeLayer: (id) =>
    set({
      layers: get().layers.filter((l) => l.id !== id),
      selectedLayerId: get().selectedLayerId === id ? null : get().selectedLayerId,
    }),
  duplicateLayer: (id) => {
    const source = get().layers.find((l) => l.id === id);
    if (!source) return;
    const copy: DesignLayer = {
      ...structuredClone(source),
      id: uid(source.type === "text" ? "txt" : "img"),
      name: `${source.name} copy`,
      x: Math.min(90, source.x + 4),
      y: Math.min(90, source.y + 4),
    };
    set({ layers: [...get().layers, copy], selectedLayerId: copy.id });
  },
  moveLayer: (id, direction) => {
    const layers = [...get().layers];
    const index = layers.findIndex((l) => l.id === id);
    if (index < 0) return;
    const target = direction === "up" ? index + 1 : index - 1;
    if (target < 0 || target >= layers.length) return;
    [layers[index], layers[target]] = [layers[target], layers[index]];
    set({ layers });
  },
  toggleLayerVisibility: (id) =>
    set({
      layers: get().layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }),
  toggleLayerLock: (id) =>
    set({
      layers: get().layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    }),
  rememberFont: (fontId) =>
    set({
      recentFonts: [fontId, ...get().recentFonts.filter((f) => f !== fontId)].slice(0, 6),
    }),
  rememberColor: (hex) =>
    set({
      recentColors: [hex, ...get().recentColors.filter((c) => c !== hex)].slice(0, 8),
    }),
  totalQuantity: () => {
    const state = get();
    if (state.sizeMode === "single") {
      return Math.max(1, state.sizeQuantities[state.selectedSizeId] || 1);
    }
    return Object.values(state.sizeQuantities).reduce((sum, n) => sum + (n || 0), 0);
  },
}));
