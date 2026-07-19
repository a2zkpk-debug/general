# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header (top bar, logo, search, nav, cart count)
- `vibecano-hero-section.html` — Homepage hero content only (category circles + CTAs)
- `vibecano-footer.html` — Site-wide footer (links, contact, copyright)
- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-women-collection.html` — Women collection grid with size picker, Store API add-to-cart, and Diners-style cart popup
- `vibecano-men-collection.html` — Men collection grid (same UX as Women; category slug `men`)
- `vibecano-featured-collection.html` — Featured collection grid (same UX; category slug `featured`)
- `vibecano-kids-collection.html` — Kids collection grid (same UX; category slug `kids`)
- `vibecano-under999-collection.html` — Under999 collection grid (same UX; category slug `under999`)
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow

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

## Collection grids (Women / Men / Featured / Kids / Under999)

Selecting a size and clicking **Add to Cart** uses a fast Store API payload (parent product + size/attributes, no per-variation fetch waterfall), stays on the page, and opens a centered popup with product image, top-right close control, **Continue Shopping**, and **View Cart**. Category chips and sort filters are removed; **View All Products** sits under the grid.

- Women widget: `vibecano-women-collection.html` (`women` category)
- Men widget: `vibecano-men-collection.html` (`men` category)
- Featured widget: `vibecano-featured-collection.html` (tries `featured` category slug, then category ID, then Woo `featured=true` star flag)
- Kids widget: `vibecano-kids-collection.html` (`kids` category)
- Under999 widget: `vibecano-under999-collection.html` (`under999` category)

## Usage

Replace the Elementor HTML widget content on each template with the matching file contents.

## Note on Variation Swatches plugin

The GetWooPlugins swatches plugin styles the default WooCommerce variation form. These custom widgets render their own UI via the Store API. The swatches plugin can be uninstalled if all product/cart pages use these custom templates.
