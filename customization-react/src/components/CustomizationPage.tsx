"use client";

/**
 * Vibecano Customization Page — React + TypeScript reference
 * Pair with Zustand store, sample product data, and Tailwind + Framer Motion.
 *
 * Desktop: 60% live preview | 40% sticky panel
 * Mobile: preview on top, accordion / bottom-sheet panel
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useCustomizationStore } from "../store/customizationStore";
import {
  ARTWORK_SIZES,
  LOCATION_META,
  PRINT_POSITION_OPTIONS,
  TEXT_COLORS,
} from "../data/sampleProduct";
import {
  calculatePrice,
  formatMoney,
  hasPrintContent,
} from "../lib/pricing";
import type { PrintLocationId } from "../types/product";

const FONT_PREVIEW: Record<string, string> = {
  block: "font-black tracking-tight uppercase",
  script: "italic font-serif",
  modern: "font-medium tracking-wide",
};

export default function CustomizationPage({
  onBack,
  onAddToCart,
  onSaveDesign,
}: {
  onBack?: () => void;
  onAddToCart?: (payload: unknown) => void;
  onSaveDesign?: (payload: unknown) => void;
}) {
  const store = useCustomizationStore();
  const product = store.product;
  const [chartOpen, setChartOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);

  const price = useMemo(() => calculatePrice(store), [store]);
  const color = product?.colors.find((c) => c.id === store.selectedColorId);
  const symbol = product?.currencySymbol || "Rs ";

  if (store.loading || !product) {
    return (
      <div className="vc-cz-shell flex min-h-[70vh] items-center justify-center bg-[radial-gradient(circle_at_20%_10%,#dbeafe,transparent_35%),radial-gradient(circle_at_90%_0%,#ccfbf1,transparent_30%),#f8fafc]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0B3D4A]/20 border-t-[#0B3D4A]" />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!hasPrintContent(store) && !product.textOnlyMode) {
      setValidationMsg("Select a print location and add artwork or text first.");
      return;
    }
    if (product.textOnlyMode && !store.printPositionMode) {
      setValidationMsg("Choose a print position.");
      return;
    }
    if (!store.multiSizeMode && !store.selectedSizeId) {
      setValidationMsg("Please choose a size.");
      return;
    }
    if (store.multiSizeMode && price.quantity < 1) {
      setValidationMsg("Add quantity for at least one size.");
      return;
    }
    setValidationMsg("");
    onAddToCart?.(store);
  };

  return (
    <div className="vc-cz-shell min-h-screen bg-[radial-gradient(ellipse_at_top_left,#dbeafe_0%,transparent_42%),radial-gradient(ellipse_at_top_right,#ccfbf1_0%,transparent_38%),linear-gradient(180deg,#f1f5f9_0%,#ffffff_48%)] text-slate-900">
      {/* Sticky product header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#0B3D4A] hover:text-[#0B3D4A]"
            >
              ← Back to Product
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-[family-name:Manrope] text-lg font-extrabold tracking-tight md:text-xl">
                {product.name}
              </h1>
              <p className="truncate text-xs text-slate-500">
                {product.material} · Base {formatMoney(symbol, product.basePrice)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {color && (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:flex">
                <span
                  className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                  style={{ background: color.hex }}
                />
                <span className="text-xs font-semibold">{color.name}</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Total
              </div>
              <div className="font-[family-name:Manrope] text-xl font-extrabold text-[#0B3D4A]">
                {formatMoney(symbol, price.grandTotal)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-5 md:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8 lg:py-8">
        {/* LEFT — Live preview */}
        <section className="lg:sticky lg:top-24 lg:self-start">
          <LivePreview />
        </section>

        {/* RIGHT — Customization panel */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <div className="space-y-5 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_30px_80px_-48px_rgba(11,61,74,0.55)] md:p-6">
            <ColorSection />
            <SizeSection onOpenChart={() => setChartOpen(true)} />
            <DecorationStyleSection />
            {product.textOnlyMode ? <PrintPositionsSection /> : <PrintLocationsSection />}
            <DeliverySection />
            <PricingSection />
            <FinalActions
              validationMsg={validationMsg}
              onAddToCart={handleAddToCart}
              onSave={() => onSaveDesign?.(store)}
              onHelp={() => setHelpOpen(true)}
            />
          </div>
        </aside>
      </div>

      {/* Mobile panel toggle */}
      <button
        type="button"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0B3D4A] px-5 py-3 text-sm font-bold text-white shadow-xl lg:hidden"
        onClick={() => setMobilePanelOpen((v) => !v)}
      >
        {mobilePanelOpen ? "Hide Options" : "Customize"} · {formatMoney(symbol, price.grandTotal)}
      </button>

      <AnimatePresence>
        {chartOpen && <SizeChartModal onClose={() => setChartOpen(false)} />}
        {helpOpen && <HelpBubble onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function LivePreview() {
  const store = useCustomizationStore();
  const product = store.product!;
  const color = product.colors.find((c) => c.id === store.selectedColorId);
  const side = store.previewSide === "back" ? "back" : "front";
  const img = side === "back" ? product.images.back : product.images.front;

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 p-4 shadow-[0_40px_100px_-60px_rgba(11,61,74,0.7)] md:p-6">
      <div className="mb-4 flex items-center justify-center gap-2">
        {(["front", "back", "360"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => store.setPreviewSide(s)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              store.previewSide === s
                ? "bg-[#0B3D4A] text-white shadow-lg"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-[#0B3D4A]"
            }`}
          >
            {s === "360" ? "360°" : s}
          </button>
        ))}
      </div>

      <div className="relative mx-auto aspect-[4/5] max-w-[520px] overflow-hidden rounded-[28px]">
        {/* Fabric + lighting */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 40%),
              radial-gradient(circle at 70% 80%, rgba(0,0,0,0.18), transparent 45%),
              linear-gradient(145deg, ${color?.hex || "#e2e8f0"} 0%, ${shade(color?.hex || "#e2e8f0", -18)} 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.14] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          }}
        />
        <img
          src={img}
          alt={`${product.name} ${side}`}
          className="relative z-[1] h-full w-full object-cover mix-blend-multiply opacity-90"
        />
        {/* Soft shadow under garment */}
        <div className="pointer-events-none absolute inset-x-[18%] bottom-[6%] z-[2] h-6 rounded-full bg-black/25 blur-2xl" />

        {/* Print overlays */}
        <PrintOverlays side={side} />
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Live mockup · updates as you customize
      </p>
    </div>
  );
}

function PrintOverlays({ side }: { side: "front" | "back" }) {
  const store = useCustomizationStore();
  const relevant = store.activeLocations.filter((id) => {
    if (side === "back") return id === "back";
    return id !== "back";
  });

  return (
    <>
      {relevant.map((id) => {
        const cfg = store.locationConfigs[id];
        if (!cfg) return null;
        const box = placementClass(id);
        const sizeScale =
          cfg.artwork?.size === "L" ? "scale-110" : cfg.artwork?.size === "S" ? "scale-75" : "scale-100";

        return (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute z-[3] flex items-center justify-center ${box}`}
          >
            <div className={`transition-transform ${sizeScale}`}>
              {cfg.artwork?.previewUrl ? (
                <img
                  src={cfg.artwork.previewUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              ) : cfg.text.enabled && cfg.text.line1 ? (
                <div
                  className={`text-center leading-tight ${FONT_PREVIEW[cfg.text.font]}`}
                  style={{ color: cfg.text.color, fontSize: "clamp(10px, 2.4vw, 18px)" }}
                >
                  <div>{cfg.text.line1}</div>
                  {cfg.text.line2 && <div className="opacity-90">{cfg.text.line2}</div>}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/70 bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {LOCATION_META.find((l) => l.id === id)?.label}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

function placementClass(id: PrintLocationId): string {
  switch (id) {
    case "front":
      return "left-[28%] right-[28%] top-[28%] h-[28%]";
    case "back":
      return "left-[28%] right-[28%] top-[26%] h-[30%]";
    case "left_chest":
      return "left-[30%] top-[30%] h-[12%] w-[18%]";
    case "right_chest":
      return "right-[30%] top-[30%] h-[12%] w-[18%]";
    case "left_sleeve":
      return "left-[8%] top-[38%] h-[10%] w-[14%]";
    case "right_sleeve":
      return "right-[8%] top-[38%] h-[10%] w-[14%]";
    default:
      return "inset-[30%]";
  }
}

function ColorSection() {
  const store = useCustomizationStore();
  const product = store.product!;
  const core = product.colors.filter((c) => c.group === "core");
  const limited = product.colors.filter((c) => c.group === "limited");

  return (
    <section>
      <SectionTitle>Color</SectionTitle>
      <ColorGroup label="Core Colors" colors={core} />
      {limited.length > 0 && (
        <div className="mt-4">
          <ColorGroup label="Limited Edition" colors={limited} />
        </div>
      )}
    </section>
  );
}

function ColorGroup({
  label,
  colors,
}: {
  label: string;
  colors: { id: string; name: string; hex: string; surcharge?: number }[];
}) {
  const store = useCustomizationStore();
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((c) => {
          const selected = store.selectedColorId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              title={c.name + (c.surcharge ? ` (+Rs ${c.surcharge})` : "")}
              aria-label={c.name}
              aria-pressed={selected}
              onClick={() => store.setColor(c.id)}
              className={`relative h-10 w-10 rounded-full border-2 transition ${
                selected
                  ? "border-[#0B3D4A] ring-4 ring-[#0B3D4A]/15 scale-105"
                  : "border-white shadow-[0_0_0_1px_rgba(15,23,42,0.12)] hover:scale-105"
              }`}
              style={{ background: c.hex }}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SizeSection({ onOpenChart }: { onOpenChart: () => void }) {
  const store = useCustomizationStore();
  const product = store.product!;
  const adult = product.sizes.filter((s) => !s.kids);
  const kids = product.sizes.filter((s) => s.kids);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle className="mb-0">Size</SectionTitle>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenChart}
            className="text-xs font-bold text-[#1D6FE8] hover:underline"
          >
            Size Chart
          </button>
          <button
            type="button"
            onClick={() => store.setMultiSizeMode(!store.multiSizeMode)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
              store.multiSizeMode
                ? "bg-[#0B3D4A] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Select Multiple Sizes
          </button>
        </div>
      </div>

      {!store.multiSizeMode ? (
        <>
          <SizeRow
            sizes={adult}
            selected={store.selectedSizeId}
            onSelect={store.setSize}
          />
          {kids.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Kids
              </div>
              <SizeRow
                sizes={kids}
                selected={store.selectedSizeId}
                onSelect={store.setSize}
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {product.sizes.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2"
            >
              <div>
                <div className="text-sm font-bold">{s.label}</div>
                {typeof s.stock === "number" && (
                  <div className="text-[11px] text-slate-500">{s.stock} left</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg bg-white font-bold ring-1 ring-slate-200"
                  onClick={() =>
                    store.setSizeQty(s.id, (store.sizeQuantities[s.id] || 0) - 1)
                  }
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold">
                  {store.sizeQuantities[s.id] || 0}
                </span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg bg-white font-bold ring-1 ring-slate-200"
                  onClick={() =>
                    store.setSizeQty(s.id, (store.sizeQuantities[s.id] || 0) + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SizeRow({
  sizes,
  selected,
  onSelect,
}: {
  sizes: { id: string; label: string; stock?: number }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const active = selected === s.id;
        const out = typeof s.stock === "number" && s.stock <= 0;
        return (
          <button
            key={s.id}
            type="button"
            disabled={out}
            title={typeof s.stock === "number" ? `${s.stock} in stock` : s.label}
            onClick={() => onSelect(s.id)}
            className={`min-w-[3rem] rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-[#0B3D4A] text-white shadow-md"
                : out
                  ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#0B3D4A]/40"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function DecorationStyleSection() {
  const store = useCustomizationStore();
  return (
    <section>
      <SectionTitle>Decoration Style</SectionTitle>
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
        {([
          ["screenprint", "Screenprint"],
          ["embroidery", "Embroidery"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => store.setDecorationStyle(id)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              store.decorationStyle === id
                ? "bg-[#0B3D4A] text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PrintLocationsSection() {
  const store = useCustomizationStore();
  return (
    <section>
      <SectionTitle>Print Locations</SectionTitle>
      <p className="mb-3 text-sm text-slate-500">
        Select one or more locations. Each opens its own artwork & text options.
      </p>
      <div className="flex flex-wrap gap-2">
        {LOCATION_META.map((loc) => {
          const active = store.activeLocations.includes(loc.id as PrintLocationId);
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => store.toggleLocation(loc.id as PrintLocationId)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? "bg-[#0B3D4A] text-white shadow-md"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0B3D4A]/35"
              }`}
            >
              {loc.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        <AnimatePresence initial={false}>
          {store.activeLocations.map((id) => (
            <LocationCard key={id} locationId={id} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function LocationCard({ locationId }: { locationId: PrintLocationId }) {
  const store = useCustomizationStore();
  const cfg = store.locationConfigs[locationId];
  const meta = LOCATION_META.find((l) => l.id === locationId);
  const sizes = ARTWORK_SIZES[locationId];

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      store.setArtwork(locationId, { fileName: file.name, previewUrl: url });
    },
    [locationId, store]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
      "application/postscript": [".ai", ".eps"],
      "image/svg+xml": [".svg"],
    },
    maxSize: 15 * 1024 * 1024,
  });

  if (!cfg) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-[family-name:Manrope] text-sm font-extrabold">{meta?.label}</h3>
        <button
          type="button"
          className="text-xs font-bold text-slate-400 hover:text-red-500"
          onClick={() => store.toggleLocation(locationId)}
        >
          Remove
        </button>
      </div>

      {/* Artwork upload */}
      {!cfg.text.enabled && (
        <>
          {!cfg.artwork?.previewUrl ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                isDragActive
                  ? "border-[#1D6FE8] bg-blue-50"
                  : "border-slate-300 bg-white hover:border-[#0B3D4A]/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                ↑
              </div>
              <p className="text-sm font-bold text-slate-700">Drag & drop artwork</p>
              <p className="mt-1 text-xs text-slate-500">
                .jpg .png .pdf .ai .eps .svg · max 15 MB · 300 DPI recommended
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <img
                src={cfg.artwork.previewUrl}
                alt=""
                className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{cfg.artwork.fileName}</div>
                <div className="text-xs text-slate-500">Ready for {meta?.label}</div>
              </div>
              <label className="cursor-pointer text-xs font-bold text-[#1D6FE8]">
                Change
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.ai,.eps,.svg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    store.setArtwork(locationId, {
                      fileName: f.name,
                      previewUrl: URL.createObjectURL(f),
                    });
                  }}
                />
              </label>
              <button
                type="button"
                className="text-xs font-bold text-red-500"
                onClick={() => store.setArtwork(locationId, null)}
              >
                Remove
              </button>
            </div>
          )}

          {cfg.artwork?.previewUrl && store.decorationStyle === "embroidery" && (
            <div className="mt-3 rounded-2xl border border-teal-200 bg-teal-50 px-3 py-3 text-xs leading-relaxed text-teal-900">
              Great news! This is a one-time digitization setup fee for new logos.
              Once it&apos;s in our system, it&apos;s for life.
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Artwork Size
            </div>
            <div className="flex gap-2">
              {(Object.keys(sizes) as ("L" | "M" | "S")[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => store.setArtworkSize(locationId, key)}
                  className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold ${
                    (cfg.artwork?.size || "M") === key
                      ? "bg-[#0B3D4A] text-white"
                      : "bg-white ring-1 ring-slate-200 text-slate-600"
                  }`}
                >
                  {key} {sizes[key]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Text option */}
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={cfg.text.enabled}
          onChange={(e) => store.setUseText(locationId, e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#0B3D4A]"
        />
        Use Text instead of Artwork
      </label>

      {cfg.text.enabled && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
              <span>First Line</span>
              <span>{cfg.text.line1.length}/26</span>
            </div>
            <input
              maxLength={26}
              value={cfg.text.line1}
              onChange={(e) => store.setTextField(locationId, { line1: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B3D4A]"
              placeholder="Your text"
            />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-500">
              Second Line (optional)
            </div>
            <input
              maxLength={26}
              value={cfg.text.line2}
              onChange={(e) => store.setTextField(locationId, { line2: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B3D4A]"
              placeholder="Optional"
            />
          </div>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Text Color
            </div>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => store.setTextField(locationId, { color: c.hex })}
                  className={`h-8 w-8 rounded-full border-2 ${
                    cfg.text.color === c.hex ? "border-[#0B3D4A]" : "border-white shadow"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Font Type
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["block", "script", "modern"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => store.setTextField(locationId, { font: f })}
                  className={`rounded-xl px-2 py-3 text-sm ${
                    cfg.text.font === f
                      ? "bg-[#0B3D4A] text-white"
                      : "bg-white ring-1 ring-slate-200"
                  } ${FONT_PREVIEW[f]}`}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PrintPositionsSection() {
  const store = useCustomizationStore();
  return (
    <section>
      <SectionTitle>Print Positions</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {PRINT_POSITION_OPTIONS.map((opt) => {
          const active = store.printPositionMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => store.setPrintPositionMode(opt.id)}
              className={`rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                active
                  ? "bg-[#0B3D4A] text-white shadow-md"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {opt.label}
              {opt.surcharge > 0 && (
                <span className={`mt-1 block text-[11px] ${active ? "text-teal-100" : "text-slate-400"}`}>
                  + Rs {opt.surcharge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DeliverySection() {
  const store = useCustomizationStore();
  const options = [
    { id: "express_3" as const, label: "3 Days", sub: "Express" },
    { id: "standard_5" as const, label: "5 Days", sub: "Popular" },
    { id: "economy_10" as const, label: "10 Days", sub: "Standard" },
  ];
  return (
    <section>
      <SectionTitle>Delivery Speed</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const active = store.deliverySpeed === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => store.setDeliverySpeed(o.id)}
              className={`rounded-2xl px-2 py-3 text-center transition ${
                active
                  ? "bg-[#0B3D4A] text-white shadow-lg scale-[1.02]"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              <div className="text-sm font-extrabold">{o.label}</div>
              <div className={`text-[10px] font-semibold ${active ? "text-teal-100" : "text-slate-400"}`}>
                {o.sub}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PricingSection() {
  const store = useCustomizationStore();
  const product = store.product!;
  const price = calculatePrice(store);
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => store.togglePriceBreakdown()}
      >
        <span className="text-sm font-bold">Price breakdown</span>
        <span className="font-[family-name:Manrope] text-lg font-extrabold text-[#0B3D4A]">
          {formatMoney(product.currencySymbol, price.grandTotal)}
        </span>
      </button>
      <AnimatePresence>
        {store.priceBreakdownOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-1.5 overflow-hidden border-t border-slate-200 pt-3 text-sm"
          >
            {price.lines.map((line) => (
              <li key={line.label} className="flex justify-between text-slate-600">
                <span>{line.label}</span>
                <span className="font-semibold">
                  {formatMoney(product.currencySymbol, line.amount)}
                </span>
              </li>
            ))}
            <li className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
              <span>
                Total × {price.quantity}
              </span>
              <span>{formatMoney(product.currencySymbol, price.grandTotal)}</span>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}

function FinalActions({
  validationMsg,
  onAddToCart,
  onSave,
  onHelp,
}: {
  validationMsg: string;
  onAddToCart: () => void;
  onSave: () => void;
  onHelp: () => void;
}) {
  const store = useCustomizationStore();
  return (
    <section className="space-y-3 border-t border-slate-200 pt-4">
      {!store.multiSizeMode && (
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-2">
          <span className="px-2 text-sm font-bold text-slate-600">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl bg-white font-bold shadow-sm"
              onClick={() => store.setQuantity(store.quantity - 1)}
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-extrabold">{store.quantity}</span>
            <button
              type="button"
              className="h-10 w-10 rounded-xl bg-white font-bold shadow-sm"
              onClick={() => store.setQuantity(store.quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      )}
      {validationMsg && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {validationMsg}
        </p>
      )}
      <button
        type="button"
        onClick={onAddToCart}
        className="w-full rounded-2xl bg-[#0B3D4A] py-4 text-base font-extrabold text-white shadow-[0_18px_40px_-18px_rgba(11,61,74,0.9)] transition hover:bg-[#0a3340] active:scale-[0.99]"
      >
        Add to Cart
      </button>
      <button
        type="button"
        onClick={onSave}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-[#0B3D4A]/40"
      >
        Save Design for Later
      </button>
      <button
        type="button"
        onClick={onHelp}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1D6FE8] text-sm font-bold text-white shadow-xl lg:bottom-8"
        aria-label="Need Help?"
      >
        ?
      </button>
    </section>
  );
}

function SizeChartModal({ onClose }: { onClose: () => void }) {
  const product = useCustomizationStore((s) => s.product)!;
  const chart = product.sizeChart;
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/45 p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[family-name:Manrope] text-xl font-extrabold">{chart.title}</h3>
          <button type="button" onClick={onClose} className="text-2xl text-slate-400">
            ×
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#0B3D4A] text-white">
                <th className="rounded-tl-xl px-3 py-3 text-left">Measure</th>
                {chart.columns.map((c) => (
                  <th key={c} className="px-3 py-3 text-center last:rounded-tr-xl">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                  <td className="px-3 py-2.5 font-bold text-slate-700">{row.label}</td>
                  {chart.columns.map((c) => (
                    <td key={c} className="px-3 py-2.5 text-center text-slate-600">
                      {row.values[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HelpBubble({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed bottom-24 right-4 z-[60] w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl lg:bottom-24"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm">Need Help?</strong>
        <button type="button" onClick={onClose} className="text-slate-400">
          ×
        </button>
      </div>
      <p className="text-sm text-slate-600">
        WhatsApp us for artwork advice, bulk quotes, or placement tips. We usually reply within minutes.
      </p>
      <a
        href="https://wa.me/923001234567"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex rounded-xl bg-[#25D366] px-3 py-2 text-sm font-bold text-white"
      >
        Chat on WhatsApp
      </a>
    </motion.div>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-3 font-[family-name:Manrope] text-sm font-extrabold tracking-tight text-slate-900 ${className}`}
    >
      {children}
    </h2>
  );
}

function shade(hex: string, percent: number): string {
  const raw = hex.replace("#", "");
  const num = parseInt(raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
