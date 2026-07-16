import { ProductOptionsPanel } from "./components/ProductOptions/ProductOptionsPanel";
import { PersonalizationPanel } from "./components/Personalization/PersonalizationPanel";
import { TextEditorPanel } from "./components/TextEditor/TextEditorPanel";
import { ClipartPanel } from "./components/Personalization/ClipartPanel";
import { ImageUploadModal } from "./components/ImageUpload/ImageUploadModal";
import { CanvasPreview } from "./components/Canvas/CanvasPreview";
import { LayersPanel } from "./components/Layers/LayersPanel";
import { useDesignerStore } from "./store/designerStore";
import "./styles/designer.css";

/**
 * Vibecano Product Designer — stacked cards (no tabs).
 * Always visible: Product Options → Personalization → Layers
 * On demand: Text Editor (Add Text) · Clipart (Add Clipart)
 */
export function DesignerApp() {
  const product = useDesignerStore((s) => s.product);
  const activePanel = useDesignerStore((s) => s.activePanel);
  const colorId = useDesignerStore((s) => s.colorId);
  const totalQuantity = useDesignerStore((s) => s.totalQuantity);
  const layers = useDesignerStore((s) => s.layers);
  const selectedLayerId = useDesignerStore((s) => s.selectedLayerId);
  const color = product.colors.find((c) => c.id === colorId);
  const qty = Math.max(1, totalQuantity());
  const total = product.basePrice * qty;
  const selected = layers.find((l) => l.id === selectedLayerId);
  const showText = activePanel === "text" && selected?.type === "text";
  const showClipart = activePanel === "clipart";

  const handleAddToCart = () => {
    if (!layers.length) return;
    const payload = {
      product_id: product.id,
      color: color?.name,
      quantity: qty,
      total,
      layers: layers.map((l) => ({ id: l.id, type: l.type, name: l.name, positionId: l.positionId })),
    };
    try {
      sessionStorage.setItem("vcDesignerLastOrder", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    window.location.href = "/checkout/";
  };

  return (
    <div className="pd-shell">
      <header className="pd-topbar">
        <div className="pd-topbar__left">
          <a className="pd-back" href={typeof document !== "undefined" && document.referrer ? document.referrer : "/"}>
            ← Back
          </a>
          <div>
            <h1>{product.name}</h1>
            <p>{product.material}</p>
          </div>
        </div>
        <div className="pd-topbar__right">
          <div className="pd-total">
            <span>Total</span>
            <strong>
              {product.currencySymbol}
              {total.toLocaleString()}
            </strong>
          </div>
          <button type="button" className="pd-btn pd-btn--primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </header>

      <div className="pd-layout">
        <main className="pd-layout__preview">
          <CanvasPreview />
        </main>

        <aside className="pd-layout__panel">
          <ProductOptionsPanel />
          <PersonalizationPanel />
          {showText ? <TextEditorPanel /> : null}
          {showClipart ? <ClipartPanel /> : null}
          <LayersPanel />

          <div className="pd-summary">
            <span
              className="pd-summary__swatch"
              style={{ background: color?.hex || "#fff" }}
              title={color?.name}
            />
            <div>
              <strong>{color?.name}</strong>
              <small>
                Qty {qty} · {layers.length} layer{layers.length === 1 ? "" : "s"}
              </small>
            </div>
          </div>
        </aside>
      </div>

      <ImageUploadModal />
    </div>
  );
}

export default DesignerApp;
