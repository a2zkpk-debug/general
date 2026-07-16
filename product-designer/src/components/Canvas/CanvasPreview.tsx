import { FONTS } from "../../data/catalog";
import { useDesignerStore } from "../../store/designerStore";

export function CanvasPreview() {
  const product = useDesignerStore((s) => s.product);
  const colorId = useDesignerStore((s) => s.colorId);
  const printPositionId = useDesignerStore((s) => s.printPositionId);
  const layers = useDesignerStore((s) => s.layers);
  const selectedLayerId = useDesignerStore((s) => s.selectedLayerId);
  const selectLayer = useDesignerStore((s) => s.selectLayer);

  const color = product.colors.find((c) => c.id === colorId) || product.colors[0];
  const position =
    product.printPositions.find((p) => p.id === printPositionId) || product.printPositions[0];
  const side = position.previewSide;
  const image =
    (side === "back" ? color.imageBack || product.images.back : color.imageFront || product.images.front);

  const activeLayers = layers.filter((layer) => {
    if (!layer.visible) return false;
    if (printPositionId === "front_back") return layer.positionId === "front" || layer.positionId === "back" || layer.positionId === "front_back";
    if (printPositionId === "pocket_back") return layer.positionId === "pocket" || layer.positionId === "back" || layer.positionId === "pocket_back";
    return layer.positionId === printPositionId;
  });

  return (
    <div className="pd-canvas">
      <div className="pd-canvas__stage" style={{ background: color.hex }}>
        <div className="pd-canvas__fabric" aria-hidden="true" />
        <img className="pd-canvas__product" src={image} alt={`${product.name} ${side}`} />
        <div className={`pd-canvas__zone is-${position.zone}`} aria-label={`${position.label} design area`}>
          {activeLayers.map((layer) => {
            if (layer.type === "text" && layer.text) {
              const font = FONTS.find((f) => f.id === layer.text!.fontId);
              const content = applyCase(layer.text.content, layer.text.textCase);
              return (
                <button
                  key={layer.id}
                  type="button"
                  className={`pd-layer-text${selectedLayerId === layer.id ? " is-selected" : ""}`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: `translate(-50%, -50%) rotate(${layer.text.rotation + (layer.text.effect === "vertical" ? 0 : 0)}deg) scale(${layer.scale})`,
                    fontFamily: font?.family || "Manrope",
                    fontSize: `${layer.text.fontSize * 0.35}px`,
                    fontWeight: layer.text.bold ? 800 : layer.text.fontWeight,
                    fontStyle: layer.text.italic ? "italic" : "normal",
                    textDecoration: layer.text.underline ? "underline" : "none",
                    letterSpacing: `${layer.text.letterSpacing}px`,
                    lineHeight: layer.text.lineHeight,
                    opacity: layer.text.opacity,
                    color: layer.text.gradientEnabled ? undefined : layer.text.color,
                    backgroundImage: layer.text.gradientEnabled
                      ? `linear-gradient(90deg, ${layer.text.gradientFrom}, ${layer.text.gradientTo})`
                      : undefined,
                    WebkitBackgroundClip: layer.text.gradientEnabled ? "text" : undefined,
                    WebkitTextFillColor: layer.text.gradientEnabled ? "transparent" : undefined,
                    textAlign: layer.text.align,
                    writingMode: layer.text.effect === "vertical" ? "vertical-rl" : undefined,
                    textShadow:
                      layer.text.effect === "shadow"
                        ? `0 ${Math.max(1, layer.text.shadowBlur / 3)}px ${layer.text.shadowBlur}px ${layer.text.shadowColor}`
                        : undefined,
                    WebkitTextStroke:
                      layer.text.effect === "outline" && layer.text.strokeWidth
                        ? `${layer.text.strokeWidth * 0.35}px ${layer.text.strokeColor}`
                        : undefined,
                  }}
                  onClick={() => selectLayer(layer.id)}
                >
                  {content || "Enter your text here..."}
                </button>
              );
            }
            if (layer.type === "image" && layer.image) {
              return (
                <button
                  key={layer.id}
                  type="button"
                  className={`pd-layer-image${selectedLayerId === layer.id ? " is-selected" : ""}`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                    opacity: layer.opacity,
                  }}
                  onClick={() => selectLayer(layer.id)}
                >
                  <img src={layer.image.src} alt={layer.image.fileName} />
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>
      <p className="pd-canvas__hint">
        Editing <strong>{position.label}</strong> · {color.name}
      </p>
    </div>
  );
}

function applyCase(value: string, mode: "none" | "uppercase" | "lowercase") {
  if (mode === "uppercase") return value.toUpperCase();
  if (mode === "lowercase") return value.toLowerCase();
  return value;
}
