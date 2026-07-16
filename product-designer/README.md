# Vibecano Product Designer

Modular, production-oriented product customization studio for WooCommerce + Elementor Pro.

## Architecture

Every feature is an isolated module. The core shell never needs edits when you add a print location, tool, or product type.

```
src/
  components/
    ProductOptions/   # Print position · color · size
    Personalization/  # Action buttons (text, image, clipart, logo)
    TextEditor/       # Typography · effects · layer controls
    ImageUpload/      # Upload modal · validation · progress
    Canvas/           # Live product preview
    Layers/           # Layer stack
    Toolbar/          # Top chrome + CTAs
    Mobile/           # Mobile sheet controls
    ui/               # Shared primitives (Modal, Tooltip, Slider…)
  store/              # Zustand designer store
  types/              # Shared contracts
  data/               # Sample product + font/color registries
  lib/                # Upload validation, pricing helpers
  hooks/              # Reusable interaction hooks
```

## Production delivery

Paste `../vibecano-product-designer.html` into an Elementor HTML widget at **100%** width on `/design-editor/` (or `/customize/`).

The HTML widget is the **complete production implementation** and includes:

- WooCommerce Store API product hydrate + variation-aware add-to-cart
- Print positions, colors, sizes (single + multi qty), size chart
- Text editor, image/logo upload, clipart library, drag-to-reposition layers
- Design payload saved to `sessionStorage` (`vcDesignerLastOrder`)

This React folder mirrors the same module map (`VibeDesigner.*` / Zustand store) for typed extension work.

## Extending

| Goal | Where |
|------|--------|
| New print position | `PRINT_POSITIONS` registry + canvas zone map |
| New color | Product `colors[]` (unlimited) |
| New font | `FONTS` registry |
| New personalization tool | Register in `PERSONALIZATION_ACTIONS` + panel component |
| New product type | Provide a `ProductData` payload via Store API |

## Design tokens

- Navy `#0B3D4A` · Teal `#0E7490` · Accent orange `#F97316`
- Radius 10–14px · 8px spacing grid · 240ms transitions
- Fonts: Manrope (display) + Plus Jakarta Sans (UI)
