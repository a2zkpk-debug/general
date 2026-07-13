import type {
  CustomizationState,
  PriceBreakdown,
  PrintLocationId,
  ProductData,
} from "../types/product";

export function formatMoney(symbol: string, amount: number): string {
  return `${symbol}${Math.round(amount).toLocaleString("en-PK")}`;
}

export function getTotalQuantity(state: CustomizationState): number {
  if (!state.multiSizeMode) return Math.max(1, state.quantity);
  return Object.values(state.sizeQuantities).reduce((sum, q) => sum + (q || 0), 0);
}

export function hasPrintContent(state: CustomizationState): boolean {
  if (state.product?.textOnlyMode && state.printPositionMode) return true;

  return state.activeLocations.some((id) => {
    const cfg = state.locationConfigs[id];
    if (!cfg) return false;
    if (cfg.artwork?.previewUrl) return true;
    if (cfg.text?.enabled && cfg.text.line1.trim()) return true;
    return false;
  });
}

export function calculatePrice(state: CustomizationState): PriceBreakdown {
  const product = state.product;
  const empty: PriceBreakdown = {
    base: 0,
    colorSurcharge: 0,
    locationFees: 0,
    doubleSideFee: 0,
    embroideryFee: 0,
    digitizationFee: 0,
    rushFee: 0,
    unitTotal: 0,
    quantity: 0,
    grandTotal: 0,
    lines: [],
  };

  if (!product) return empty;

  const lines: { label: string; amount: number }[] = [];
  const base = product.basePrice;
  lines.push({ label: "Base price", amount: base });

  const color = product.colors.find((c) => c.id === state.selectedColorId);
  const colorSurcharge = color?.surcharge || 0;
  if (colorSurcharge > 0) {
    lines.push({ label: `${color?.name || "Color"} surcharge`, amount: colorSurcharge });
  }

  let locationFees = 0;
  if (!product.textOnlyMode) {
    const extra = Math.max(0, state.activeLocations.length - 1);
    locationFees = extra * product.pricing.extraLocationFee;
    if (locationFees > 0) {
      lines.push({
        label: `Extra print location${extra > 1 ? "s" : ""} (×${extra})`,
        amount: locationFees,
      });
    }
  }

  let doubleSideFee = 0;
  if (product.textOnlyMode && state.printPositionMode === "double_side") {
    doubleSideFee = product.pricing.doubleSideFee;
    lines.push({ label: "Double side", amount: doubleSideFee });
  } else if (
    !product.textOnlyMode &&
    state.activeLocations.includes("front") &&
    state.activeLocations.includes("back")
  ) {
    // Front+Back already covered by extra location fee; optional explicit double-side bump
  }

  let embroideryFee = 0;
  if (state.decorationStyle === "embroidery") {
    embroideryFee = product.pricing.embroideryFee;
    lines.push({ label: "Embroidery", amount: embroideryFee });
  }

  let digitizationFee = 0;
  if (state.decorationStyle === "embroidery") {
    const needsDigitize = state.activeLocations.some((id) => {
      const art = state.locationConfigs[id]?.artwork;
      return art?.previewUrl && !art.digitized;
    });
    if (needsDigitize) {
      digitizationFee = product.pricing.digitizationFee;
      lines.push({ label: "Logo digitization (one-time)", amount: digitizationFee });
    }
  }

  let rushFee = 0;
  if (state.deliverySpeed === "express_3") {
    rushFee = product.pricing.rushDeliveryFee;
    lines.push({ label: "Express delivery (3 days)", amount: rushFee });
  }

  const unitTotal =
    base + colorSurcharge + locationFees + doubleSideFee + embroideryFee + digitizationFee + rushFee;
  const quantity = Math.max(1, getTotalQuantity(state));
  const grandTotal = unitTotal * quantity;

  return {
    base,
    colorSurcharge,
    locationFees,
    doubleSideFee,
    embroideryFee,
    digitizationFee,
    rushFee,
    unitTotal,
    quantity,
    grandTotal,
    lines,
  };
}

export function createDefaultLocationConfig(locationId: PrintLocationId) {
  return {
    locationId,
    artwork: null,
    text: {
      enabled: false,
      line1: "",
      line2: "",
      position:
        locationId === "left_chest"
          ? ("left_chest" as const)
          : locationId === "right_chest"
            ? ("right_chest" as const)
            : locationId === "back"
              ? ("center_back" as const)
              : ("center_front" as const),
      color: "#111827",
      font: "block" as const,
    },
  };
}

export function hydrateFromProduct(product: ProductData): Partial<CustomizationState> {
  const preferredColor =
    product.colors.find((c) => c.group === "core") || product.colors[0];
  const preferredSize =
    product.sizes.find((s) => s.id === "m") ||
    product.sizes.find((s) => !s.kids) ||
    product.sizes[0];

  return {
    product,
    loading: false,
    error: null,
    selectedColorId: preferredColor?.id || "",
    selectedSizeId: preferredSize?.id || "",
    multiSizeMode: false,
    sizeQuantities: {},
    decorationStyle: "screenprint",
    activeLocations: [],
    locationConfigs: {},
    printPositionMode: product.textOnlyMode ? "full_front" : null,
    deliverySpeed: "standard_5",
    quantity: 1,
    previewSide: "front",
    priceBreakdownOpen: false,
  };
}
