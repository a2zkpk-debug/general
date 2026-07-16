/** Mobile bottom sheet controls — extend without touching core shell */
export function MobileControls({
  onOpenOptions,
  onOpenPersonalize,
}: {
  onOpenOptions: () => void;
  onOpenPersonalize: () => void;
}) {
  return (
    <div className="pd-mobile-bar">
      <button type="button" onClick={onOpenOptions}>
        Options
      </button>
      <button type="button" onClick={onOpenPersonalize}>
        Personalize
      </button>
    </div>
  );
}
