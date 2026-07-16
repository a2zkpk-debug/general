import { PRINT_POSITIONS } from "../../data/catalog";
import { useDesignerStore } from "../../store/designerStore";
import { Modal, PanelCard, Tooltip } from "../ui/primitives";
import type { PrintPositionId } from "../../types/designer";

export function ProductOptionsPanel() {
  const product = useDesignerStore((s) => s.product);
  const printPositionId = useDesignerStore((s) => s.printPositionId);
  const colorId = useDesignerStore((s) => s.colorId);
  const sizeMode = useDesignerStore((s) => s.sizeMode);
  const selectedSizeId = useDesignerStore((s) => s.selectedSizeId);
  const sizeQuantities = useDesignerStore((s) => s.sizeQuantities);
  const sizeChartOpen = useDesignerStore((s) => s.sizeChartOpen);
  const setPrintPosition = useDesignerStore((s) => s.setPrintPosition);
  const setColor = useDesignerStore((s) => s.setColor);
  const setSizeMode = useDesignerStore((s) => s.setSizeMode);
  const setSelectedSize = useDesignerStore((s) => s.setSelectedSize);
  const setSizeQty = useDesignerStore((s) => s.setSizeQty);
  const openSizeChart = useDesignerStore((s) => s.openSizeChart);

  const positions = product.printPositions?.length ? product.printPositions : PRINT_POSITIONS;

  return (
    <>
      <PanelCard title="Product Options" subtitle="Position, color, and size — updates live.">
        <div className="pd-field">
          <span className="pd-label">Print Position</span>
          <div className="pd-segment" role="tablist" aria-label="Print position">
            {positions.map((pos) => (
              <button
                key={pos.id}
                type="button"
                role="tab"
                aria-selected={printPositionId === pos.id}
                className={`pd-segment__btn${printPositionId === pos.id ? " is-active" : ""}`}
                onClick={() => setPrintPosition(pos.id as PrintPositionId)}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pd-field">
          <span className="pd-label">Color</span>
          <div className="pd-swatches">
            {product.colors.map((color) => (
              <Tooltip key={color.id} label={color.inStock ? color.name : `${color.name} · Out of stock`}>
                <button
                  type="button"
                  className={`pd-swatch${colorId === color.id ? " is-active" : ""}${
                    !color.inStock ? " is-disabled" : ""
                  }`}
                  style={{ background: color.hex }}
                  disabled={!color.inStock}
                  aria-label={color.name}
                  onClick={() => setColor(color.id)}
                />
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="pd-field">
          <div className="pd-field__row">
            <span className="pd-label">Size</span>
            <div className="pd-inline-actions">
              <button type="button" className="pd-link" onClick={() => openSizeChart(true)}>
                Size Chart
              </button>
              <div className="pd-mini-toggle">
                <button
                  type="button"
                  className={sizeMode === "single" ? "is-active" : ""}
                  onClick={() => setSizeMode("single")}
                >
                  Single
                </button>
                <button
                  type="button"
                  className={sizeMode === "multi" ? "is-active" : ""}
                  onClick={() => setSizeMode("multi")}
                >
                  Multi
                </button>
              </div>
            </div>
          </div>

          {sizeMode === "single" ? (
            <div className="pd-chips">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  className={`pd-chip${selectedSizeId === size.id ? " is-active" : ""}${
                    !size.inStock ? " is-disabled" : ""
                  }`}
                  disabled={!size.inStock}
                  onClick={() => setSelectedSize(size.id)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="pd-qty-grid">
              {product.sizes.map((size) => (
                <div key={size.id} className={`pd-qty-row${!size.inStock ? " is-disabled" : ""}`}>
                  <span>{size.label}</span>
                  <div className="pd-stepper">
                    <button
                      type="button"
                      disabled={!size.inStock}
                      onClick={() => setSizeQty(size.id, (sizeQuantities[size.id] || 0) - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      disabled={!size.inStock}
                      value={sizeQuantities[size.id] || 0}
                      onChange={(e) => setSizeQty(size.id, Number(e.target.value))}
                    />
                    <button
                      type="button"
                      disabled={!size.inStock}
                      onClick={() => setSizeQty(size.id, (sizeQuantities[size.id] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelCard>

      <Modal open={sizeChartOpen} title={product.sizeChart.title} onClose={() => openSizeChart(false)} wide>
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Measure</th>
                {product.sizeChart.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.sizeChart.rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {product.sizeChart.columns.map((col) => (
                    <td key={col}>{row.values[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
