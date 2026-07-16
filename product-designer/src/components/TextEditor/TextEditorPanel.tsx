import { useMemo, useState } from "react";
import { FONTS, PRESET_COLORS } from "../../data/catalog";
import { useDesignerStore } from "../../store/designerStore";
import { IconButton, PanelCard, SliderField } from "../ui/primitives";
import type { TextAlign, TextCase, TextEffect } from "../../types/designer";

export function TextEditorPanel() {
  const layers = useDesignerStore((s) => s.layers);
  const selectedLayerId = useDesignerStore((s) => s.selectedLayerId);
  const recentFonts = useDesignerStore((s) => s.recentFonts);
  const recentColors = useDesignerStore((s) => s.recentColors);
  const updateTextStyle = useDesignerStore((s) => s.updateTextStyle);
  const rememberFont = useDesignerStore((s) => s.rememberFont);
  const rememberColor = useDesignerStore((s) => s.rememberColor);
  const removeLayer = useDesignerStore((s) => s.removeLayer);
  const duplicateLayer = useDesignerStore((s) => s.duplicateLayer);
  const moveLayer = useDesignerStore((s) => s.moveLayer);
  const setActivePanel = useDesignerStore((s) => s.setActivePanel);

  const [fontQuery, setFontQuery] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");

  const layer = layers.find((l) => l.id === selectedLayerId && l.type === "text");
  const style = layer?.text;

  const fonts = useMemo(() => {
    const q = fontQuery.trim().toLowerCase();
    const list = FONTS.filter((f) => !q || f.label.toLowerCase().includes(q) || f.family.toLowerCase().includes(q));
    const recent = recentFonts
      .map((id) => FONTS.find((f) => f.id === id))
      .filter(Boolean) as typeof FONTS;
    return { recent, list };
  }, [fontQuery, recentFonts]);

  if (!layer || !style) {
    return (
      <PanelCard title="Text Editor" subtitle="Select or add text to edit typography.">
        <p className="pd-empty">No text layer selected.</p>
      </PanelCard>
    );
  }

  const applyColor = (hex: string) => {
    const clean = normalizeHex(hex);
    if (!clean) return;
    updateTextStyle(layer.id, { color: clean });
    rememberColor(clean);
    setHexInput(clean);
    setRgbInput(hexToRgbString(clean));
  };

  return (
    <PanelCard
      title="Text Editor"
      subtitle="Live preview updates as you type."
      action={
        <button type="button" className="pd-link" onClick={() => setActivePanel("personalize")}>
          Done
        </button>
      }
    >
      <label className="pd-field">
        <span className="pd-label">Text</span>
        <textarea
          className="pd-textarea"
          rows={4}
          placeholder="Enter your text here..."
          value={style.content}
          onChange={(e) => updateTextStyle(layer.id, { content: e.target.value })}
        />
      </label>

      <div className="pd-field">
        <span className="pd-label">Font</span>
        <input
          className="pd-input"
          type="search"
          placeholder="Search fonts..."
          value={fontQuery}
          onChange={(e) => setFontQuery(e.target.value)}
        />
        {fonts.recent.length > 0 && !fontQuery ? (
          <div className="pd-font-recent">
            <span className="pd-micro">Recently used</span>
            <div className="pd-font-list">
              {fonts.recent.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={`pd-font-item${style.fontId === font.id ? " is-active" : ""}`}
                  style={{ fontFamily: font.family }}
                  onClick={() => {
                    updateTextStyle(layer.id, { fontId: font.id });
                    rememberFont(font.id);
                  }}
                >
                  <strong>{font.label}</strong>
                  <span>{font.preview}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="pd-font-list">
          {fonts.list.map((font) => (
            <button
              key={font.id}
              type="button"
              className={`pd-font-item${style.fontId === font.id ? " is-active" : ""}`}
              style={{ fontFamily: font.family }}
              onClick={() => {
                updateTextStyle(layer.id, { fontId: font.id });
                rememberFont(font.id);
              }}
            >
              <strong>{font.label}</strong>
              <span>{font.preview}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pd-slider-stack">
        <SliderField label="Font Size" value={style.fontSize} min={10} max={120} suffix="px" onChange={(v) => updateTextStyle(layer.id, { fontSize: v })} />
        <SliderField label="Font Weight" value={style.fontWeight} min={300} max={900} step={100} onChange={(v) => updateTextStyle(layer.id, { fontWeight: v })} />
        <SliderField label="Letter Spacing" value={style.letterSpacing} min={-4} max={20} step={0.5} suffix="px" onChange={(v) => updateTextStyle(layer.id, { letterSpacing: v })} />
        <SliderField label="Line Height" value={style.lineHeight} min={0.8} max={2.4} step={0.05} onChange={(v) => updateTextStyle(layer.id, { lineHeight: v })} />
        <SliderField label="Rotation" value={style.rotation} min={-180} max={180} suffix="°" onChange={(v) => updateTextStyle(layer.id, { rotation: v })} />
        <SliderField label="Opacity" value={Math.round(style.opacity * 100)} min={10} max={100} suffix="%" onChange={(v) => updateTextStyle(layer.id, { opacity: v / 100 })} />
      </div>

      <div className="pd-field">
        <span className="pd-label">Formatting</span>
        <div className="pd-toolbar">
          {(["left", "center", "right", "justify"] as TextAlign[]).map((align) => (
            <IconButton key={align} title={align} active={style.align === align} onClick={() => updateTextStyle(layer.id, { align })}>
              {align[0].toUpperCase()}
            </IconButton>
          ))}
          <IconButton title="Bold" active={style.bold} onClick={() => updateTextStyle(layer.id, { bold: !style.bold })}>
            B
          </IconButton>
          <IconButton title="Italic" active={style.italic} onClick={() => updateTextStyle(layer.id, { italic: !style.italic })}>
            I
          </IconButton>
          <IconButton title="Underline" active={style.underline} onClick={() => updateTextStyle(layer.id, { underline: !style.underline })}>
            U
          </IconButton>
          <IconButton title="Uppercase" active={style.textCase === "uppercase"} onClick={() => updateTextStyle(layer.id, { textCase: (style.textCase === "uppercase" ? "none" : "uppercase") as TextCase })}>
            AA
          </IconButton>
          <IconButton title="Lowercase" active={style.textCase === "lowercase"} onClick={() => updateTextStyle(layer.id, { textCase: (style.textCase === "lowercase" ? "none" : "lowercase") as TextCase })}>
            aa
          </IconButton>
        </div>
      </div>

      <div className="pd-field">
        <span className="pd-label">Text Color</span>
        <div className="pd-color-presets">
          {PRESET_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`pd-swatch${style.color.toLowerCase() === hex.toLowerCase() ? " is-active" : ""}`}
              style={{ background: hex }}
              onClick={() => applyColor(hex)}
              aria-label={hex}
            />
          ))}
        </div>
        <div className="pd-color-inputs">
          <label>
            HEX
            <input
              className="pd-input"
              value={hexInput || style.color}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => applyColor(hexInput || style.color)}
            />
          </label>
          <label>
            RGB
            <input
              className="pd-input"
              value={rgbInput || hexToRgbString(style.color)}
              onChange={(e) => setRgbInput(e.target.value)}
              onBlur={() => {
                const hex = rgbStringToHex(rgbInput);
                if (hex) applyColor(hex);
              }}
            />
          </label>
        </div>
        {recentColors.length ? (
          <div className="pd-recent-colors">
            <span className="pd-micro">Recently used</span>
            <div className="pd-swatches">
              {recentColors.map((hex) => (
                <button key={hex} type="button" className="pd-swatch" style={{ background: hex }} onClick={() => applyColor(hex)} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="pd-field">
        <span className="pd-label">Advanced Effects</span>
        <div className="pd-chips">
          {(["none", "outline", "shadow", "curved", "arc", "vertical"] as TextEffect[]).map((effect) => (
            <button
              key={effect}
              type="button"
              className={`pd-chip${style.effect === effect ? " is-active" : ""}`}
              onClick={() => updateTextStyle(layer.id, { effect })}
            >
              {effect === "none" ? "None" : effect[0].toUpperCase() + effect.slice(1)}
            </button>
          ))}
        </div>
        {(style.effect === "outline" || style.effect === "shadow" || style.effect === "curved" || style.effect === "arc") && (
          <div className="pd-slider-stack">
            {style.effect === "outline" ? (
              <SliderField label="Stroke Width" value={style.strokeWidth} min={0} max={12} onChange={(v) => updateTextStyle(layer.id, { strokeWidth: v })} />
            ) : null}
            {style.effect === "shadow" ? (
              <SliderField label="Shadow Blur" value={style.shadowBlur} min={0} max={24} onChange={(v) => updateTextStyle(layer.id, { shadowBlur: v })} />
            ) : null}
            {style.effect === "curved" || style.effect === "arc" ? (
              <SliderField label="Curve / Arc" value={style.curveAmount} min={-180} max={180} onChange={(v) => updateTextStyle(layer.id, { curveAmount: v })} />
            ) : null}
          </div>
        )}
        <div className="pd-toggle-row">
          <label className="pd-check">
            <input
              type="checkbox"
              checked={style.gradientEnabled}
              onChange={(e) => updateTextStyle(layer.id, { gradientEnabled: e.target.checked })}
            />
            Gradient Fill
          </label>
          <label className="pd-check">
            <input
              type="checkbox"
              checked={style.patternFill}
              onChange={(e) => updateTextStyle(layer.id, { patternFill: e.target.checked })}
            />
            Pattern Fill
          </label>
        </div>
      </div>

      <div className="pd-field">
        <span className="pd-label">Layer Controls</span>
        <div className="pd-toolbar">
          <IconButton title="Bring forward" onClick={() => moveLayer(layer.id, "up")}>↑</IconButton>
          <IconButton title="Send backward" onClick={() => moveLayer(layer.id, "down")}>↓</IconButton>
          <IconButton title="Duplicate" onClick={() => duplicateLayer(layer.id)}>⧉</IconButton>
          <IconButton title="Delete" onClick={() => removeLayer(layer.id)}>⌫</IconButton>
        </div>
      </div>
    </PanelCard>
  );
}

function normalizeHex(value: string): string | null {
  const v = value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) {
    const raw = v.replace("#", "");
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toUpperCase();
  }
  return null;
}

function hexToRgbString(hex: string): string {
  const h = normalizeHex(hex);
  if (!h) return "0, 0, 0";
  const n = parseInt(h.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function rgbStringToHex(value: string): string | null {
  const parts = value.split(",").map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
  return `#${parts.map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
