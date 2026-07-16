# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header (top bar, logo, search, nav, cart count)
- `vibecano-hero-section.html` — Homepage hero content only (category circles + CTAs)
- `vibecano-footer.html` — Site-wide footer (links, contact, copyright)
- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-product-designer.html` — Premium product customization studio (Customize Now)
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow
- `product-designer/` — Modular React + TypeScript reference of the designer architecture

## Header + hero + footer setup

1. **All pages:** paste `vibecano-header.html` into **Elementor → Theme Builder → Header** (HTML widget, width **100%**).
2. **All pages:** paste `vibecano-footer.html` into **Elementor → Theme Builder → Footer** (HTML widget, width **100%**).
3. **Homepage only:** paste `vibecano-hero-section.html` into the homepage content area below the header.
4. Remove the old combined hero/header widget if it is still on the homepage.

## Premium product designer

### Flow

1. Customer opens a customizable product.
2. Clicks **Customize Now** on the single product page.
3. Lands on `/design-editor/?product_cms={id}&color=…&size=…`.
4. Configures print position, color, size; adds text/artwork; reviews live preview.
5. **Add to Cart** validates that at least one design layer exists.

### Setup

1. Create a WordPress page with slug `design-editor` (URL `/design-editor/`).
2. Edit with Elementor → add an **HTML** widget at **100%** width.
3. Paste the full contents of `vibecano-product-designer.html`.
4. Publish. The single product page already links customizable products here via `DESIGNER_URL`.

### UI modules

| Module | Features |
|--------|----------|
| Product Options | Segmented print positions, circular color swatches, size chips, multi-size qty, size chart modal |
| Personalization | Add Text, Upload Image, Clipart/Logo (future placeholders) |
| Text Editor | Fonts with preview/search/recent, typography sliders, formatting, color picker (HEX/RGB/presets), effects, layer controls |
| Image Upload | Computer / mobile / camera, drag-drop, validation, progress, cancel/retry |
| Canvas | Instant print-zone switching, live color/preview updates |
| Layers | Select, hide, lock, delete |

### Architecture

Production delivery is the complete Elementor HTML widget (`VibeDesigner.*` namespaces) with WooCommerce Store API hydrate + add-to-cart.

The `product-designer/` folder is a component-based React + Zustand reference (plus full `designer.css`) so new tools, print locations, and product types can be added without rewriting the core shell.

### Cart integration

- Uses the same `vcWcCartToken` session key as the single product / cart pages
- Posts to `/wp-json/wc/store/v1/cart/add-item` with color/size variation attributes
- Saves design summary to `sessionStorage.vcDesignerLastOrder`
- On success redirects to `/checkout/?session=CART_TOKEN` (classic fallback if Store API fails)

### Design system

- Navy `#0B3D4A` · Teal `#0E7490` · Accent orange `#F97316`
- Fonts: Manrope (titles) + Plus Jakarta Sans (UI)
- Radius 10–14px · 8px spacing grid · ~240ms transitions
- Soft shadows, high-contrast type, SaaS-style panels

## Checkout full-width fix

The checkout section now stretches to full page width on Elementor. The live checkout HTML widget uses `elementor-widget__width-initial`, which limited the page to about 963px and left empty space on the right. The fix expands the Elementor host containers to `100%` width via JavaScript on load, render, and resize.

## Checkout WhatsApp fix (color, size, receipt)

WhatsApp messages now include Size/Color from Store API cart variations. Receipt uploads use the mobile Share API when available; desktop opens a receipt image tab for manual attach because `wa.me` links cannot include files.

## Cart checkout redirect fix

### Problem

Clicking **Proceed to Checkout** returned to the cart page because the custom cart uses the WooCommerce Store API (`Cart-Token` in `sessionStorage`), while checkout uses the classic WooCommerce session. A plain `/checkout/` link does not carry the Store API cart, so WooCommerce sees an empty cart and redirects back to `/cart/`.

### Fix

Redirect to checkout with the cart session token:

```
/checkout/?session=CART_TOKEN
```

WooCommerce restores the Store API cart from the `session` query parameter. The fixed cart page refreshes the cart on checkout click and redirects with the stored token. The single product page uses the same pattern after add-to-cart.

## Single product color swatches fix

Color swatches were hidden because `renderColorOptions()` required `COLOR_VARIES`, which only became true when variation API data exposed parseable color values. The fix shows colors whenever the Color attribute has terms.

## Usage

Replace the Elementor HTML widget content on each template with the matching file contents.

## Note on Variation Swatches plugin

The GetWooPlugins swatches plugin styles the default WooCommerce variation form. These custom widgets render their own UI via the Store API. The swatches plugin can be uninstalled if all product/cart pages use these custom templates.
