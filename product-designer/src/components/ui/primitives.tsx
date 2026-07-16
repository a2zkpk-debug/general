import type { CSSProperties, ReactNode } from "react";

export function PanelCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="pd-card">
      <header className="pd-card__head">
        <div>
          <h3 className="pd-card__title">{title}</h3>
          {subtitle ? <p className="pd-card__sub">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="pd-tooltip" data-tip={label}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="pd-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="pd-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className={`pd-modal__box${wide ? " is-wide" : ""}`}>
        <header className="pd-modal__head">
          <h3>{title}</h3>
          <button type="button" className="pd-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="pd-modal__body">{children}</div>
      </div>
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="pd-slider">
      <span className="pd-slider__head">
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function IconButton({
  active,
  title,
  onClick,
  children,
  disabled,
  style,
}: {
  active?: boolean;
  title: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className={`pd-iconbtn${active ? " is-active" : ""}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}
