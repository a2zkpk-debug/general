export { default as CustomizationPage } from "./components/CustomizationPage";
export { useCustomizationStore } from "./store/customizationStore";
export { SAMPLE_PRODUCT, ARTWORK_SIZES, LOCATION_META } from "./data/sampleProduct";
export { calculatePrice, formatMoney, hasPrintContent, hydrateFromProduct } from "./lib/pricing";
export type * from "./types/product";
