# VibeCano Track Your Order — Integration Guide

Premium order-tracking widget for [vibecano.com](https://vibecano.com/), built for WordPress + WooCommerce + Elementor.

## Files

| File | Purpose | Where it goes |
|------|---------|---------------|
| `vibecano-track-order.html` | Frontend UI (HTML + CSS + JS) | Elementor HTML widget on a Track Order page |
| `vibecano-track-order-api.php` | Secure REST API backend | Custom plugin, child theme `functions.php`, or Code Snippets |

**Important:** PHP cannot run inside an Elementor HTML widget. The frontend and backend must be installed separately.

---

## Architecture

```
Browser (Elementor HTML widget)
        │  POST JSON + optional X-WP-Nonce
        ▼
/wp-json/vibecano/v1/track   ← server-side only
        │  sanitize → validate → rate-limit → WooCommerce query
        ▼
Safe JSON response (no addresses, payment, or API keys)
        │
        ▼
Tracking result + timeline UI
```

Secrets (WooCommerce REST consumer keys/secrets, carrier API keys) stay on the server. The browser never calls WooCommerce REST with credentials.

---

## A. Frontend (Elementor)

1. Create a page (e.g. **Track Your Order**).
2. Edit with Elementor.
3. Add an **HTML** widget (full width).
4. Paste the entire contents of `vibecano-track-order.html`.
5. Publish.

The widget is namespaced under `.vibecano-track-*` to avoid theme/Elementor collisions.

### Optional manual config

If the PHP backend is not active yet, you can set:

```html
<script>
window.VIBECANO_TRACKING_CONFIG = {
  endpoint: "/wp-json/vibecano/v1/track", // PLACEHOLDER — confirm on your site
  nonce: "",
  refreshInterval: 60000
};
</script>
```

When `vibecano-track-order-api.php` is active, it prints `endpoint` + a fresh `wp_rest` nonce automatically.

---

## B. Backend (WordPress / WooCommerce)

Choose **one** install method:

### Option 1 — Custom plugin (recommended)

1. Create folder: `wp-content/plugins/vibecano-order-tracking/`
2. Copy `vibecano-track-order-api.php` into that folder.
3. Activate **VibeCano Order Tracking API** in Plugins.

### Option 2 — Child theme

Require or paste the file from `functions.php`:

```php
require_once get_stylesheet_directory() . '/vibecano-track-order-api.php';
```

### Option 3 — Code Snippets

Create a new snippet, paste the PHP file contents, set to **Run everywhere**, activate.

---

## C. API

**Endpoint:** `POST /wp-json/vibecano/v1/track`

**Headers:**

```
Content-Type: application/json
X-WP-Nonce: <wp_rest nonce>   // recommended; auto-localized by PHP
```

### Request — Method 1 (order + email/phone)

```json
{
  "type": "order",
  "orderNumber": "12345",
  "contact": "customer@email.com"
}
```

### Request — Method 2 (tracking number)

```json
{
  "type": "tracking",
  "trackingNumber": "ABC123456"
}
```

### Success response

```json
{
  "success": true,
  "data": {
    "orderNumber": "12345",
    "status": "shipped",
    "statusLabel": "Shipped",
    "carrier": "Carrier Name",
    "trackingNumber": "ABC123456",
    "trackingUrl": "https://example.com/track/ABC123456",
    "estimatedDelivery": "2026-07-25",
    "lastUpdated": "2026-07-23T12:00:00+00:00"
  }
}
```

### Error response (WordPress REST format)

```json
{
  "code": "order_not_found",
  "message": "Order not found. Please check your details and try again.",
  "data": { "status": 404 }
}
```

### Never returned to the frontend

- Billing / shipping addresses
- Payment method or transaction IDs
- WooCommerce consumer keys/secrets
- Full order line items / internal meta dumps
- Other customers’ data

Order lookups require a matching email **or** phone. Failed matches return the same generic “not found” message.

---

## D. Status mapping

| WooCommerce status | UI stage | Label |
|--------------------|----------|-------|
| pending / on-hold | Order Confirmed | Order Confirmed / On Hold |
| processing | Processing | Processing |
| shipped | Shipped | Shipped |
| out-for-delivery | Out for Delivery | Out for Delivery |
| completed / delivered | Delivered | Delivered |
| cancelled / refunded / failed | Terminal | Cancelled / Refunded / Failed |

Customize with:

```php
add_filter( 'vibecano_track_status_map', function( $map ) {
    $map['packed'] = array(
        'status' => 'processing',
        'label'  => 'Processing',
    );
    return $map;
} );
```

---

## E. Shipment provider adapter

Tracking numbers are read from common order meta keys (WooCommerce Shipment Tracking, AfterShip, etc.).

For a live carrier API, use the server-side filter (API keys stay in `wp-config.php`):

```php
// wp-config.php
define( 'VIBECANO_SHIP_API_KEY', 'your-server-only-key' );

add_filter( 'vibecano_track_shipment_adapter', function( $data, $order ) {
    if ( empty( $data['trackingNumber'] ) ) {
        return $data;
    }
    // Call AfterShip / Shiprocket / EasyPost here using VIBECANO_SHIP_API_KEY.
    // Update $data['carrier'], $data['trackingUrl'], $data['estimatedDelivery'].
    return $data;
}, 10, 2 );
```

Other hooks:

- `vibecano_track_find_order_by_number`
- `vibecano_track_find_order_by_tracking`
- `vibecano_track_contact_matches`
- `vibecano_track_safe_payload`
- `vibecano_track_require_nonce` (set `true` to require nonce on every request)
- `vibecano_track_rate_limit_max` (default 12 / 10 minutes / IP)

---

## F. Frontend features

- Dual tracking methods with desktop OR separator / mobile horizontal OR
- Client + server validation
- Loading button state (`Tracking...` + spinner)
- Accessible alerts (`role="alert"`, `aria-live`)
- Status timeline with completed / current / upcoming states
- Auto-refresh every 60s (pauses when tab hidden; stops on Delivered)
- “Track Another Order” without page reload
- `prefers-reduced-motion` support
- Namespaced CSS variables for easy theming

---

## G. Quick test checklist

1. Activate PHP backend.
2. Visit `/wp-json/vibecano/v1/` — route should list `track`.
3. Paste HTML into Elementor and open the page.
4. Submit empty forms → field validation messages.
5. Submit wrong order + email → generic not-found message.
6. Submit a real order number + matching billing email/phone → timeline appears.
7. Confirm Network tab shows only `/wp-json/vibecano/v1/track` (no WC consumer keys).
