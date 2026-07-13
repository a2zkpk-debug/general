import { create } from "zustand";
import type {
  ArtworkSizeKey,
  CustomizationState,
  DecorationStyle,
  DeliverySpeed,
  FontType,
  PrintLocationId,
  PrintPositionMode,
  ProductData,
  TextPosition,
} from "../types/product";
import { createDefaultLocationConfig, hydrateFromProduct } from "../lib/pricing";
import { SAMPLE_PRODUCT } from "../data/sampleProduct";

interface CustomizationActions {
  loadProduct: (product?: ProductData) => void;
  setColor: (colorId: string) => void;
  setSize: (sizeId: string) => void;
  setMultiSizeMode: (on: boolean) => void;
  setSizeQty: (sizeId: string, qty: number) => void;
  setDecorationStyle: (style: DecorationStyle) => void;
  toggleLocation: (id: PrintLocationId) => void;
  setArtworkSize: (id: PrintLocationId, size: ArtworkSizeKey) => void;
  setArtwork: (
    id: PrintLocationId,
    artwork: { fileName: string; previewUrl: string } | null
  ) => void;
  setUseText: (id: PrintLocationId, enabled: boolean) => void;
  setTextField: (
    id: PrintLocationId,
    patch: Partial<{
      line1: string;
      line2: string;
      position: TextPosition;
      color: string;
      font: FontType;
    }>
  ) => void;
  setPrintPositionMode: (mode: PrintPositionMode) => void;
  setDeliverySpeed: (speed: DeliverySpeed) => void;
  setQuantity: (qty: number) => void;
  setPreviewSide: (side: "front" | "back" | "360") => void;
  togglePriceBreakdown: () => void;
}

const initial = hydrateFromProduct(SAMPLE_PRODUCT);

export const useCustomizationStore = create<CustomizationState & CustomizationActions>(
  (set, get) => ({
    product: SAMPLE_PRODUCT,
    loading: false,
    error: null,
    selectedColorId: initial.selectedColorId || "",
    selectedSizeId: initial.selectedSizeId || "",
    multiSizeMode: false,
    sizeQuantities: {},
    decorationStyle: "screenprint",
    activeLocations: [],
    locationConfigs: {},
    printPositionMode: null,
    deliverySpeed: "standard_5",
    quantity: 1,
    previewSide: "front",
    priceBreakdownOpen: false,

    loadProduct: (product = SAMPLE_PRODUCT) => {
      set({ ...hydrateFromProduct(product) } as Partial<CustomizationState>);
    },

    setColor: (colorId) => set({ selectedColorId: colorId }),

    setSize: (sizeId) => set({ selectedSizeId: sizeId }),

    setMultiSizeMode: (on) =>
      set({
        multiSizeMode: on,
        sizeQuantities: on
          ? { [get().selectedSizeId]: Math.max(1, get().quantity) }
          : {},
      }),

    setSizeQty: (sizeId, qty) =>
      set((state) => ({
        sizeQuantities: {
          ...state.sizeQuantities,
          [sizeId]: Math.max(0, qty),
        },
      })),

    setDecorationStyle: (style) => set({ decorationStyle: style }),

    toggleLocation: (id) => {
      const { activeLocations, locationConfigs, previewSide } = get();
      const isActive = activeLocations.includes(id);
      if (isActive) {
        const next = { ...locationConfigs };
        delete next[id];
        set({
          activeLocations: activeLocations.filter((x) => x !== id),
          locationConfigs: next,
        });
        return;
      }
      set({
        activeLocations: [...activeLocations, id],
        locationConfigs: {
          ...locationConfigs,
          [id]: createDefaultLocationConfig(id),
        },
        previewSide: id === "back" ? "back" : previewSide === "360" ? "360" : "front",
      });
    },

    setArtworkSize: (id, size) =>
      set((state) => {
        const cfg = state.locationConfigs[id];
        if (!cfg) return state;
        return {
          locationConfigs: {
            ...state.locationConfigs,
            [id]: {
              ...cfg,
              artwork: cfg.artwork
                ? { ...cfg.artwork, size }
                : { size, digitized: false },
            },
          },
        };
      }),

    setArtwork: (id, artwork) =>
      set((state) => {
        const cfg = state.locationConfigs[id] || createDefaultLocationConfig(id);
        return {
          locationConfigs: {
            ...state.locationConfigs,
            [id]: {
              ...cfg,
              artwork: artwork
                ? {
                    fileName: artwork.fileName,
                    previewUrl: artwork.previewUrl,
                    size: cfg.artwork?.size || "M",
                    digitized: false,
                  }
                : null,
            },
          },
        };
      }),

    setUseText: (id, enabled) =>
      set((state) => {
        const cfg = state.locationConfigs[id] || createDefaultLocationConfig(id);
        return {
          locationConfigs: {
            ...state.locationConfigs,
            [id]: {
              ...cfg,
              text: { ...cfg.text, enabled },
            },
          },
        };
      }),

    setTextField: (id, patch) =>
      set((state) => {
        const cfg = state.locationConfigs[id];
        if (!cfg) return state;
        return {
          locationConfigs: {
            ...state.locationConfigs,
            [id]: { ...cfg, text: { ...cfg.text, ...patch } },
          },
        };
      }),

    setPrintPositionMode: (mode) => set({ printPositionMode: mode }),

    setDeliverySpeed: (speed) => set({ deliverySpeed: speed }),

    setQuantity: (qty) => set({ quantity: Math.max(1, qty) }),

    setPreviewSide: (side) => set({ previewSide: side }),

    togglePriceBreakdown: () =>
      set((state) => ({ priceBreakdownOpen: !state.priceBreakdownOpen })),
  })
);
