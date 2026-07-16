import { useMemo, useState } from "react";
import { useDesignerStore } from "../../store/designerStore";
import { PanelCard } from "../ui/primitives";

const CLIPART = [
  { id: "star", name: "Star", tags: "star shape" },
  { id: "heart", name: "Heart", tags: "heart love" },
  { id: "bolt", name: "Bolt", tags: "bolt energy" },
  { id: "leaf", name: "Leaf", tags: "leaf nature" },
  { id: "flame", name: "Flame", tags: "flame fire" },
  { id: "crown", name: "Crown", tags: "crown royal" },
  { id: "smile", name: "Smile", tags: "smile face" },
  { id: "mountain", name: "Mountain", tags: "mountain outdoor" },
  { id: "wave", name: "Wave", tags: "wave water" },
  { id: "diamond", name: "Diamond", tags: "diamond gem" },
  { id: "music", name: "Music", tags: "music note" },
  { id: "paw", name: "Paw", tags: "paw animal" },
];

export function ClipartPanel() {
  const [query, setQuery] = useState("");
  const addImageLayer = useDesignerStore((s) => s.addImageLayer);
  const printPositionId = useDesignerStore((s) => s.printPositionId);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLIPART.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.tags.includes(q)
    );
  }, [query]);

  return (
    <PanelCard title="Clipart Library" subtitle="Tap an icon to place it on the active print area.">
      <input
        className="pd-input"
        type="search"
        placeholder="Search clipart..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="pd-action-grid" style={{ marginTop: 12 }}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="pd-action"
            onClick={() =>
              addImageLayer({
                src: `data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="40" text-anchor="middle" font-size="28">${item.name[0]}</text></svg>`
                )}`,
                fileName: `${item.name} clipart`,
                width: 64,
                height: 64,
                hasTransparency: true,
              })
            }
          >
            <span className="pd-action__icon">{item.name[0]}</span>
            <span className="pd-action__copy">
              <strong>{item.name}</strong>
              <small>Place on {printPositionId.replace(/_/g, " ")}</small>
            </span>
          </button>
        ))}
      </div>
    </PanelCard>
  );
}
