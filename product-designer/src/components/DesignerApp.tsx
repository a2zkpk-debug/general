import { ProductOptionsPanel } from "./components/ProductOptions/ProductOptionsPanel";
import { PersonalizationPanel } from "./components/Personalization/PersonalizationPanel";
import { TextEditorPanel } from "./components/TextEditor/TextEditorPanel";
import { ImageUploadModal } from "./components/ImageUpload/ImageUploadModal";
import { CanvasPreview } from "./components/Canvas/CanvasPreview";
import { LayersPanel } from "./components/Layers/LayersPanel";
import { useDesignerStore } from "./store/designerStore";

/**
 * Vibecano Product Designer — modular shell.
 * Compose panels freely; each feature module is independently replaceable.
 */
export function DesignerApp() {
  const product = useDesignerStore((s) => s.product);
  const activePanel = useDesignerStore((s) => s.activePanel);
  const setActivePanel = useDesignerStore((s) => s.setActivePanel);
  const colorId = useDesignerStore((s) => s.colorId);
  const totalQuantity = useDesignerStore((s) => s.totalQuantity);
  const color = product.colors.find((c) => c.id === colorId);

  const total = product.basePrice * Math.max(1, totalQuantity());

  return (
    <div className="pd-shell">
      <header className="pd-topbar">
        <div className="pd-topbar__left">
          <a className="pd-back" href="javascript:history.back()">
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
          <button type="button" className="pd-btn pd-btn--primary">
            Add to Cart
          </button>
        </div>
      </header>

      <div className="pd-layout">
        <main className="pd-layout__preview">
          <CanvasPreview />
        </main>

        <aside className="pd-layout__panel">
          <nav className="pd-panel-tabs" aria-label="Designer sections">
            {(
              [
                ["options", "Options"],
                ["personalize", "Personalize"],
                ["text", "Text"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={activePanel === id ? "is-active" : ""}
                onClick={() => setActivePanel(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {(activePanel === "options" || activePanel === null) && <ProductOptionsPanel />}
          {activePanel === "personalize" && <PersonalizationPanel />}
          {activePanel === "text" && <TextEditorPanel />}
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
                Qty {Math.max(1, totalQuantity())} · Live preview
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
