# Vibecano WooCommerce Custom Pages

Custom Elementor HTML widgets for the Vibecano WooCommerce store.

## Files

| File | Purpose |
|------|---------|
| `vibecano-hero-section.html` | Homepage header + hero (paste into Elementor HTML widget) |
| `vibecano-header.html` | Site-wide header (Theme Builder → Header) |
| `vibecano-nav-shared.js` | Nav dropdown menus (Men, Women, Kids, Under 999) |
| `vibecano-hero.css` / `vibecano-hero.js` | Styles + logic for homepage hero (loaded via CDN) |
| `vibecano-header.css` / `vibecano-header.js` | Styles + logic for inner-page header (loaded via CDN) |
| `vibecano-footer.html` | Site-wide footer |
| `vibecano-single-product-page.html` | Single product page |
| `vibecano-cart-page.html` | Custom cart page |
| `vibecano-checkout-page.html` | Custom checkout page |

## Why external CSS/JS?

Elementor HTML widgets can strip or break inline `<style>` and `<script>` tags (especially when old code is pasted on top). The HTML files now contain **only** `<link>` tags, markup, and `<script src="...">` — no inline CSS or JS.

Assets load from jsDelivr CDN (same repo branch):

- `https://cdn.jsdelivr.net/gh/a2zkpk-debug/general@cursor/brand-categories-hero-redesign-9b96/vibecano-nav-shared.js`
- `https://cdn.jsdelivr.net/gh/a2zkpk-debug/general@cursor/brand-categories-hero-redesign-9b96/vibecano-hero.css`
- `https://cdn.jsdelivr.net/gh/a2zkpk-debug/general@cursor/brand-categories-hero-redesign-9b96/vibecano-hero.js`
- `https://cdn.jsdelivr.net/gh/a2zkpk-debug/general@cursor/brand-categories-hero-redesign-9b96/vibecano-header.css`
- `https://cdn.jsdelivr.net/gh/a2zkpk-debug/general@cursor/brand-categories-hero-redesign-9b96/vibecano-header.js`

## Homepage hero — deploy steps

**The live site still has old broken code until you follow these steps exactly.**

1. **Elementor → Pages → Homepage** → Edit with Elementor
2. Click the **first HTML widget** (hero section)
3. **Ctrl+A → Delete ALL** existing code (must be completely empty first)
4. Paste the **entire** `vibecano-hero-section.html` file (~150 lines)
5. Widget + section: **Full Width / 100%**
6. **Disable Theme Builder header on homepage** (hero already includes header)
7. Click **Update** → hard refresh **Ctrl+Shift+R**

### Verify it worked

View page source (Ctrl+U). You should see:

- `cdn.jsdelivr.net/.../vibecano-hero.css`
- `<div class="vibecano-hero-root" id="vibecanoHeroRoot">`
- `ro-topbar` in the HTML

You should **NOT** see:

- `VIBECANO — HOMEPAGE HERO SECTION` as visible text
- `--surface: #f8fafc` as plain text on the page
- Old categories like "Customize" or "Ready Made"

## Site header (shop, cart, product pages)

1. **Elementor → Theme Builder → Header** → HTML widget
2. **Ctrl+A → Delete ALL** old code
3. Paste entire `vibecano-header.html` (~85 lines)
4. Width **100%** → **Update** → hard refresh

## Footer

Paste `vibecano-footer.html` into **Theme Builder → Footer**.

## Optional: self-host assets on WordPress

Upload `vibecano-hero.css`, `vibecano-hero.js`, `vibecano-header.css`, `vibecano-header.js` to Media Library, then replace the jsDelivr URLs in the HTML files with your upload URLs.

## Checkout full-width fix

The checkout section stretches to full page width on Elementor via JavaScript that expands host containers to `100%` on load and resize.

## Cart checkout redirect

Redirect to `/checkout/?session=CART_TOKEN` so the Store API cart carries into checkout.
