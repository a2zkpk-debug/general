# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header (top bar, logo, search, nav, cart count)
- `vibecano-hero-section.html` — Homepage hero content only (category circles + CTAs)
- `vibecano-footer.html` — Site-wide footer (links, contact, copyright)
- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-customization-page.html` — Dedicated product customization studio (Customize Now)
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow
- `customization-react/` — React + TypeScript + Zustand reference of the same UX

## Header + hero + footer setup

1. **All pages:** paste `vibecano-header.html` into **Elementor → Theme Builder → Header** (HTML widget, width **100%**).
2. **All pages:** paste `vibecano-footer.html` into **Elementor → Theme Builder → Footer** (HTML widget, width **100%**).
3. **Homepage only:** paste `vibecano-hero-section.html` into the homepage content area below the header.
4. Remove the old combined hero/header widget if it is still on the homepage.

## Product customization page

### Flow

1. Customer opens a customizable product on the single product page.
2. Clicks **Customize Now**.
3. Lands on `/customize/?product_cms={id}&color=…&size=…`.
4. Configures color, size, decoration, print locations, artwork/text, delivery.
5. Live total updates; **Add to Cart** validates that a print exists.

### Setup

1. Create a WordPress page with slug `customize` (URL `/customize/`).
2. Edit with Elementor → add an **HTML** widget at **100%** width.
3. Paste the full contents of `vibecano-customization-page.html`.
4. Publish. The single product page already links customizable products here.

### UI wireframe

```
┌──────────────────────────────── Sticky header ────────────────────────────────┐
│ ← Back to Product   Product name · material · base     [swatch Color]  TOTAL │
└───────────────────────────────────────────────────────────────────────────────┘
┌──────────────── Live Preview (60%) ─────────────┬── Sticky Panel (40%) ───────┐
│         [ Front | Back | 360° ]                 │  Color                      │
│   ┌───────────────────────────────────────┐     │   Core ○○○○○  Limited ○○○  │
│   │  Fabric texture + lighting + shadow   │     │  Size  [chart] [multi]      │
│   │     ┌──────── print overlay ────┐     │     │   XXS…6XL · Kids            │
│   │     │  artwork / text / guide   │     │     │  Decoration                  │
│   │     └───────────────────────────┘     │     │   [Screenprint|Embroidery]  │
│   └───────────────────────────────────────┘     │  Print Locations (chips)    │
│                                                 │   ▓ Front  ○ Back  ○ Chest… │
│                                                 │   ┌─ expanded location ───┐ │
│                                                 │   │ upload · size · text  │ │
│                                                 │   └───────────────────────┘ │
│                                                 │  Delivery  [3][5][10]       │
│                                                 │  Price breakdown ▾ TOTAL │
│                                                 │  Qty  [Add to Cart]         │
└─────────────────────────────────────────────────┴─────────────────────────────┘
 Mobile: preview on top · panel stacks below · help bubble fixed bottom-right
```

### Design system

- Primary: deep navy/teal `#0B3D4A`
- Accent: vibrant blue `#1D6FE8`
- Fonts: Manrope (titles) + Plus Jakarta Sans (UI)
- Soft layered backgrounds, fabric noise on mockup, smooth location expand animations

### Smart defaults

| Setting | Default |
|---------|---------|
| Decoration | Screenprint |
| Delivery | 5 Days |
| Size | M (or URL `size`) |
| Color | First core color (or URL `color`) |
| Print locations | None until selected |
| Artwork size | M for each location |
| Add to Cart | Blocked until artwork or text exists on a location |

### Pricing engine (live)

- Base price (from WooCommerce Store API or sample)
- + Limited-edition color surcharge
- + Extra print location fees (beyond first)
- + Double-side fee (text-only mode)
- + Embroidery fee
- + One-time logo digitization (embroidery + new artwork)
- + Express 3-day rush fee
- Expandable breakdown × quantity / multi-size totals

### Sample product data

Embedded Classic Cotton Tee (PKR) with core + limited colors, XXS–6XL + kids sizes, size chart, and fee table. Used when no `product_cms` / `product_id` query param is present, or when the Store API fetch fails.

### React reference

See `customization-react/README.md` for the TypeScript + Zustand + Framer Motion port of the same experience.

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
