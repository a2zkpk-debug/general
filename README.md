# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header HTML widget (Theme Builder → Header)
- `vibecano-header.css` — Stylesheet for site header (upload to WordPress Media first)
- `vibecano-hero.css` — Stylesheet for homepage hero (upload to WordPress Media first)
- `vibecano-hero-section.html` — Homepage combined header + hero HTML widget
- `vibecano-footer.html` — Site-wide footer (links, contact, copyright)
- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow

## Homepage hero (IMPORTANT — 2 steps)

**Why:** Elementor strips `<!-- comments -->` and `<style>` tags from HTML widgets, which makes CSS appear as plain text on the page. The live site currently has old broken code pasted multiple times — you must replace it completely.

### Step 1 — Upload CSS file

1. In WordPress go to **Media → Add New**
2. Upload `vibecano-hero.css` from this repo
3. Copy the file URL — it should be:  
   `https://vibecano.com/wp-content/uploads/2026/07/vibecano-hero.css`  
   (rename on upload if needed to match this path)

If you skip this step, the HTML widget will try a CDN fallback, but uploading to your site is more reliable.

### Step 2 — Replace HTML widget code

1. Open **Elementor → Homepage → HTML widget** (the first/top one)
2. **Ctrl+A → Delete ALL** existing code (critical — old code is broken)
3. Paste the **entire** `vibecano-hero-section.html` (starts with `<link rel="stylesheet"`)
4. Set section + widget to **Full Width / 100%**
5. **Disable Theme Builder header on homepage** (avoid double header)
6. **Update** → hard refresh **Ctrl+Shift+R**

### How to verify it worked

View page source and search for `ro-topbar` — you should see it inside HTML, NOT as visible CSS text like `--surface:` on the page.

## Site header — Theme Builder (shop, cart, product pages)

Same Elementor issue: `<!-- comments -->` and `<style>` in the header widget can break and show CSS as text.

### Step 1 — Upload header CSS

1. **Media → Add New** → upload `vibecano-header.css`
2. URL should be: `https://vibecano.com/wp-content/uploads/2026/07/vibecano-header.css`

### Step 2 — Replace header HTML widget

1. **Elementor → Theme Builder → Header** → edit the HTML widget
2. **Ctrl+A → Delete ALL** old code
3. Paste entire `vibecano-header.html` (starts with `<link rel="stylesheet" href="...vibecano-header.css"`)
4. Widget width **100%** → **Update** → hard refresh

## Other pages (footer)

1. Paste `vibecano-footer.html` into **Elementor → Theme Builder → Footer** (HTML widget, width **100%**).

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
