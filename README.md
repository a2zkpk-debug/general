# Vibecano Featured Products

## The problem

Your current Elementor HTML widget uses **hardcoded product links and images**. When you add a new product in WooCommerce, nothing updates automatically because the page is not connected to your product catalog.

## The fix

Use the `vibecano-featured-products.php` plugin to load products dynamically from WooCommerce while keeping the same design.

### Install

1. Copy `vibecano-featured-products.php` to:
   `wp-content/plugins/vibecano-featured-products/vibecano-featured-products.php`
2. In WordPress admin, go to **Plugins** and activate **Vibecano Featured Products**.

### Use in Elementor (recommended)

**Best option:** use the built-in Elementor widget (most reliable):

1. Edit your page in Elementor
2. Search the widget panel for **Vibecano Featured Products**
3. Drag it onto the page
4. Delete the old static HTML widget
5. Click **Update**

**Alternative:** use a **Shortcode** widget (not HTML widget) with:

```html
[vibecano_featured_products]
```

The HTML widget often shows the shortcode as plain text instead of running it.

### Mark products as featured

For a product to appear in the showcase:

1. Go to **Products → All Products**
2. Edit the product
3. In **Product data → General** (or **Catalog visibility**), check **Featured**
4. Set a **Product image**
5. **Update** the product

New featured products will show automatically — no HTML editing required.

### Shortcode options

| Attribute | Default   | Description |
|-----------|-----------|-------------|
| `limit`   | `4`       | Number of products to show |
| `source`  | `featured`| `featured`, `recent`, or `manual` |
| `orderby` | `date`    | Sort field |
| `order`   | `DESC`    | `ASC` or `DESC` |
| `ids`     | —         | Product IDs when `source="manual"` |

Examples:

```html
[vibecano_featured_products limit="4"]
[vibecano_featured_products source="recent" limit="4"]
[vibecano_featured_products source="manual" ids="101,102,103,104"]
```

### Alternative: show latest products instead of featured

If you want **every new product** to appear without marking it featured:

```html
[vibecano_featured_products source="recent" limit="4"]
```

This shows the 4 most recently published products.

## Troubleshooting

| What you see | Fix |
|---|---|
| Plain text `[vibecano_featured_products]` on the page | Use the **Vibecano Featured Products** Elementor widget, or a **Shortcode** widget — not an HTML widget |
| Old hardcoded products still showing | Delete the old HTML widget entirely and add the new widget |
| Empty section | Publish products in WooCommerce and set a product image. The plugin now falls back to newest products if none are marked Featured |
| Yellow admin notice | Read the message while logged in as admin — it explains what is missing |
| Changes not visible | Clear cache: Elementor → Tools → Regenerate CSS, plus any caching plugin (LiteSpeed, WP Rocket, etc.) |
