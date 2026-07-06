# Vibecano Single Product Page Fix

Fixed version of the Elementor HTML widget for WooCommerce single product pages.

## Problem

Color swatches were hidden because `renderColorOptions()` required `COLOR_VARIES === true`. That flag was only set when variation API responses exposed a parseable color value. Size options did not have this restriction, so sizes appeared while colors did not.

## Fix

See `vibecano-single-product-page.html` for the full updated widget code.

Key changes:

1. Show color swatches whenever the product has a Color attribute with terms (same logic as size).
2. Detect color variations from product attributes (`has_variations`) and improved variation parsing.
3. Match variations by size + color using a composite key.
4. Use actual WooCommerce attribute names/slugs for add-to-cart payloads.
5. Improved color name to hex mapping for compound names (e.g. "OLIVE Green", "NAVY BLUE").
6. Support swatch images from Store API term data when available.

## Usage

Replace the existing Elementor HTML widget content on your WooCommerce Single Product template with the contents of `vibecano-single-product-page.html`.

## Note on Variation Swatches plugin

The GetWooPlugins swatches plugin styles the default WooCommerce variation form. This custom widget renders its own swatch UI via the Store API. Plugin-configured swatch colors/images appear when exposed on attribute terms; otherwise the built-in color mapping is used.
