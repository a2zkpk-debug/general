# Vibecano Featured Products

## The problem

Your current Elementor HTML widget uses **hardcoded product links and images**. When you add a new product in WooCommerce, nothing updates automatically because the page is not connected to your product catalog.

## The fix

Use the `vibecano-featured-products.php` plugin to load products dynamically from WooCommerce while keeping the same design.

### Install

1. Copy `vibecano-featured-products.php` to:
   `wp-content/plugins/vibecano-featured-products/vibecano-featured-products.php`
2. In WordPress admin, go to **Plugins** and activate **Vibecano Featured Products**.

### Use in Elementor

Replace your entire static HTML block with this single line in the Elementor **HTML** widget:

```html
[vibecano_featured_products]
```

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
