import { useDesignerStore } from "../../store/designerStore";
import { PanelCard } from "../ui/primitives";

export function LayersPanel() {
  const layers = useDesignerStore((s) => s.layers);
  const selectedLayerId = useDesignerStore((s) => s.selectedLayerId);
  const selectLayer = useDesignerStore((s) => s.selectLayer);
  const removeLayer = useDesignerStore((s) => s.removeLayer);
  const toggleLayerVisibility = useDesignerStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useDesignerStore((s) => s.toggleLayerLock);
  const setActivePanel = useDesignerStore((s) => s.setActivePanel);

  return (
    <PanelCard title="Layers" subtitle="Manage stacking order and visibility.">
      {layers.length === 0 ? (
        <p className="pd-empty">No layers yet. Add text or upload an image.</p>
      ) : (
        <ul className="pd-layers">
          {[...layers].reverse().map((layer) => (
            <li key={layer.id} className={selectedLayerId === layer.id ? "is-active" : ""}>
              <button
                type="button"
                className="pd-layers__main"
                onClick={() => {
                  selectLayer(layer.id);
                  if (layer.type === "text") setActivePanel("text");
                }}
              >
                <span className="pd-layers__type">{layer.type === "text" ? "T" : "IMG"}</span>
                <span>
                  <strong>{layer.name}</strong>
                  <small>{layer.positionId.replace("_", " ")}</small>
                </span>
              </button>
              <div className="pd-layers__actions">
                <button type="button" title="Visibility" onClick={() => toggleLayerVisibility(layer.id)}>
                  {layer.visible ? "Show" : "Hide"}
                </button>
                <button type="button" title="Lock" onClick={() => toggleLayerLock(layer.id)}>
                  {layer.locked ? "Unlock" : "Lock"}
                </button>
                <button type="button" title="Delete" onClick={() => removeLayer(layer.id)}>
                  ⌫
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
