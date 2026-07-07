# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

- `vibecano-header.html` — Site-wide header (Theme Builder → Header)
- `vibecano-hero-section.html` — Homepage header + hero combined (one HTML widget)
- `vibecano-footer.html` — Site-wide footer
- `vibecano-single-product-page.html` — Single product page
- `vibecano-cart-page.html` — Custom cart page
- `vibecano-checkout-page.html` — Custom checkout page
- `vibecano-hero.css` / `vibecano-header.css` — Reference copies of styles (already embedded in HTML files)

## Homepage hero (paste once)

**Important:** Do NOT add HTML comments (`<!-- -->`). Do NOT paste on top of old code.

1. **Elementor → Homepage** → open the first HTML widget
2. **Ctrl+A → Delete ALL** existing code
3. Paste the **entire** `vibecano-hero-section.html` file (starts with Google Fonts `<link>` tags, then `<style>`)
4. Set section + widget to **Full Width / 100%**
5. **Disable Theme Builder header on homepage** (hero already includes header)
6. **Update** → hard refresh **Ctrl+Shift+R**

## Site header (shop, cart, product pages)

1. **Elementor → Theme Builder → Header** → HTML widget
2. **Ctrl+A → Delete ALL** old code
3. Paste entire `vibecano-header.html`
4. Width **100%** → Update

## Footer

Paste `vibecano-footer.html` into **Theme Builder → Footer**.

## Checkout full-width fix

The checkout section stretches to full page width on Elementor via JavaScript that expands host containers to `100%` on load and resize.

## Cart checkout redirect

Redirect to `/checkout/?session=CART_TOKEN` so the Store API cart carries into checkout.
