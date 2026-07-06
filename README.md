# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-single-product-page.html` — Single product page with size/color swatches
- `vibecano-cart-page.html` — Custom cart page with Store API integration
- `vibecano-checkout-page.html` — Custom checkout page with WhatsApp order flow

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
