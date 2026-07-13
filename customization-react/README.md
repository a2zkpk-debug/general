# Vibecano Customization — React Reference

Portable React + TypeScript implementation of the product customization experience.

## Stack

- React 19 + TypeScript
- Zustand (customization state)
- Framer Motion (progressive disclosure + overlays)
- react-dropzone (artwork upload)
- Tailwind utility class names (bring your own Tailwind setup)

## Files

| Path | Role |
|------|------|
| `src/types/product.ts` | Product + customization types |
| `src/data/sampleProduct.ts` | Sample Classic Cotton Tee (PKR) |
| `src/lib/pricing.ts` | Live pricing engine |
| `src/store/customizationStore.ts` | Zustand store |
| `src/components/CustomizationPage.tsx` | Full page UI |

## Smart defaults

- Decoration: **Screenprint**
- Delivery: **5 Days**
- Size: **M** (if available)
- Color: first **Core** color (or URL `?color=`)
- Print locations: none selected until user picks (Add to Cart blocked until artwork/text exists)
- Artwork size per location: **M**

## Usage

```tsx
import { CustomizationPage, useCustomizationStore, SAMPLE_PRODUCT } from "./src";

useCustomizationStore.getState().loadProduct(SAMPLE_PRODUCT);

export default function Page() {
  return (
    <CustomizationPage
      onBack={() => history.back()}
      onAddToCart={(state) => console.log(state)}
      onSaveDesign={(state) => localStorage.setItem("design", JSON.stringify(state))}
    />
  );
}
```

For production on the Vibecano WooCommerce site, use the Elementor widget:

`../vibecano-customization-page.html`
