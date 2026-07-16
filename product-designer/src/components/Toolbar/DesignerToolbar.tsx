/** Top toolbar actions — keep chrome separate from feature panels */
export function DesignerToolbar({
  productName,
  totalLabel,
  onAddToCart,
}: {
  productName: string;
  totalLabel: string;
  onAddToCart: () => void;
}) {
  return (
    <header className="pd-toolbar">
      <h1>{productName}</h1>
      <div className="pd-toolbar__right">
        <strong>{totalLabel}</strong>
        <button type="button" className="pd-btn pd-btn--primary" onClick={onAddToCart}>
          Add to Cart
        </button>
      </div>
    </header>
  );
}
