# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header (top bar, logo, search, nav, cart count)
- `vibecano-hero-section.html` — Homepage hero content only (category circles + CTAs)
- `vibecano-footer.html` — Site-wide footer (links, contact, copyright)
- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow
- `vibecano-track-order.html` — Track Your Order widget (Elementor HTML)
- `vibecano-track-order-api.php` — Secure WooCommerce REST tracking endpoint
- `TRACK-ORDER-INTEGRATION.md` — Full Track Order setup + API docs

## Header + hero + footer setup

1. **All pages:** paste `vibecano-header.html` into **Elementor → Theme Builder → Header** (HTML widget, width **100%**).
2. **All pages:** paste `vibecano-footer.html` into **Elementor → Theme Builder → Footer** (HTML widget, width **100%**).
3. **Homepage only:** paste `vibecano-hero-section.html` into the homepage content area below the header.
4. Remove the old combined hero/header widget if it is still on the homepage.

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

## Track Your Order setup

1. **Backend:** Install `vibecano-track-order-api.php` as a plugin, via child-theme `functions.php`, or Code Snippets. PHP cannot run inside Elementor.
2. **Frontend:** Create a Track Order page → Elementor → HTML widget → paste `vibecano-track-order.html`.
3. Customers can track with **Order Number + Email/Phone** or **Tracking Number**. The API returns only safe status fields (no addresses, payment data, or WC keys).

See `TRACK-ORDER-INTEGRATION.md` for API payloads, status mapping, rate limiting, and shipment-provider adapters.

## Usage

Replace the Elementor HTML widget content on each template with the matching file contents.

## Note on Variation Swatches plugin

The GetWooPlugins swatches plugin styles the default WooCommerce variation form. These custom widgets render their own UI via the Store API. The swatches plugin can be uninstalled if all product/cart pages use these custom templates.
