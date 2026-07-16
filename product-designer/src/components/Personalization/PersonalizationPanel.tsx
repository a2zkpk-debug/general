import { useDesignerStore } from "../../store/designerStore";
import { PanelCard } from "../ui/primitives";

const ACTIONS = [
  {
    id: "text" as const,
    title: "Add Text",
    desc: "Typography, effects, and alignment",
    ready: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7V5h16v2" />
        <path d="M12 5v14" />
        <path d="M8 19h8" />
      </svg>
    ),
  },
  {
    id: "image" as const,
    title: "Upload Image",
    desc: "PNG, JPG, SVG from device or camera",
    ready: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 15l-5-5-8 8" />
      </svg>
    ),
  },
  {
    id: "clipart" as const,
    title: "Add Clipart",
    desc: "Coming soon",
    ready: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 10h.01M15 10h.01" />
      </svg>
    ),
  },
  {
    id: "logo" as const,
    title: "Add Logo",
    desc: "Coming soon",
    ready: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
];

export function PersonalizationPanel() {
  const addTextLayer = useDesignerStore((s) => s.addTextLayer);
  const openUploadModal = useDesignerStore((s) => s.openUploadModal);
  const setActivePanel = useDesignerStore((s) => s.setActivePanel);

  return (
    <PanelCard title="Personalization" subtitle="Add design elements with one click.">
      <div className="pd-action-grid">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`pd-action${action.ready ? "" : " is-soon"}`}
            disabled={!action.ready}
            onClick={() => {
              if (action.id === "text") {
                addTextLayer("Enter your text here...");
                setActivePanel("text");
              }
              if (action.id === "image") openUploadModal(true);
            }}
          >
            <span className="pd-action__icon">{action.icon}</span>
            <span className="pd-action__copy">
              <strong>{action.title}</strong>
              <small>{action.desc}</small>
            </span>
            {!action.ready ? <span className="pd-pill">Soon</span> : null}
          </button>
        ))}
      </div>
    </PanelCard>
  );
}
