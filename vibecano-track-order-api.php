<?php
/**
 * Plugin Name: VibeCano Order Tracking API
 * Description: Secure REST endpoint for the VibeCano Track Your Order widget. Never exposes WooCommerce credentials or private customer data to the browser.
 * Version: 1.0.0
 * Author: VibeCano
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 *
 * INSTALL OPTIONS (pick one):
 * 1) Save as a plugin file under wp-content/plugins/vibecano-order-tracking/vibecano-track-order-api.php and activate.
 * 2) Paste into a child theme functions.php (wrap with function_exists guards if needed).
 * 3) Add via Code Snippets plugin (run everywhere).
 *
 * PHP CANNOT run inside an Elementor HTML widget.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Vibecano_Order_Tracking_API {

	const NS              = 'vibecano/v1';
	const ROUTE           = '/track';
	const RATE_LIMIT_MAX  = 12;   // requests
	const RATE_LIMIT_WINDOW = 10 * MINUTE_IN_SECONDS;
	const TRANSIENT_PREFIX = 'vibecano_track_rl_';

	/**
	 * Known tracking meta keys used by popular WooCommerce shipping plugins.
	 * Extend this list for your provider.
	 *
	 * @var string[]
	 */
	private $tracking_meta_keys = array(
		'_wc_shipment_tracking_items', // WooCommerce Shipment Tracking (serialized)
		'_tracking_number',
		'tracking_number',
		'_tracking_id',
		'_aftership_tracking_number',
		'_yt_tracking_code',
		'_wcast_tracking_number',
		'_wc_connect_tracking_number',
	);

	/**
	 * Carrier / URL meta keys.
	 *
	 * @var array<string,string[]>
	 */
	private $related_meta = array(
		'carrier' => array(
			'_tracking_provider',
			'tracking_provider',
			'_aftership_tracking_provider',
			'_wc_shipment_tracking_provider',
			'_carrier_name',
		),
		'url'     => array(
			'_tracking_link',
			'tracking_link',
			'_tracking_url',
			'_aftership_tracking_link',
			'_wc_shipment_tracking_url',
		),
		'date'    => array(
			'_estimated_delivery',
			'estimated_delivery',
			'_delivery_date',
			'_wc_shipment_tracking_date',
		),
	);

	public static function init() {
		$instance = new self();
		add_action( 'rest_api_init', array( $instance, 'register_routes' ) );
		add_action( 'wp_enqueue_scripts', array( $instance, 'maybe_localize_config' ) );
	}

	/**
	 * Register POST /wp-json/vibecano/v1/track
	 */
	public function register_routes() {
		register_rest_route(
			self::NS,
			self::ROUTE,
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_track' ),
				'permission_callback' => array( $this, 'permission_check' ),
				'args'                => array(
					'type'           => array(
						'required'          => true,
						'type'              => 'string',
						'enum'              => array( 'order', 'tracking' ),
						'sanitize_callback' => 'sanitize_text_field',
					),
					'orderNumber'    => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'contact'        => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => array( $this, 'sanitize_contact' ),
					),
					'trackingNumber' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);
	}

	/**
	 * Public endpoint — identity is verified via order + contact match server-side.
	 * Nonce is preferred when available (logged-in or localized for guests).
	 */
	public function permission_check( WP_REST_Request $request ) {
		if ( ! $this->woocommerce_ready() ) {
			return new WP_Error(
				'woocommerce_missing',
				__( 'Order tracking is temporarily unavailable.', 'vibecano' ),
				array( 'status' => 503 )
			);
		}

		$rate = $this->check_rate_limit();
		if ( is_wp_error( $rate ) ) {
			return $rate;
		}

		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( $nonce && ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_Error(
				'invalid_nonce',
				__( 'Your session expired. Please refresh the page and try again.', 'vibecano' ),
				array( 'status' => 403 )
			);
		}

		/**
		 * Optional: force nonce for all requests by returning false when missing.
		 * Default allows guest tracking without a nonce while still supporting it.
		 */
		$require_nonce = (bool) apply_filters( 'vibecano_track_require_nonce', false );
		if ( $require_nonce && empty( $nonce ) ) {
			return new WP_Error(
				'missing_nonce',
				__( 'Your session expired. Please refresh the page and try again.', 'vibecano' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Main tracking handler.
	 */
	public function handle_track( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );

		if ( 'order' === $type ) {
			return $this->track_by_order( $request );
		}

		return $this->track_by_tracking_number( $request );
	}

	/**
	 * Method 1: order number + email/phone.
	 */
	private function track_by_order( WP_REST_Request $request ) {
		$order_number = trim( (string) $request->get_param( 'orderNumber' ) );
		$contact      = trim( (string) $request->get_param( 'contact' ) );

		if ( '' === $order_number ) {
			return $this->error(
				'missing_order_number',
				__( 'Please enter your order number.', 'vibecano' ),
				400
			);
		}

		if ( '' === $contact ) {
			return $this->error(
				'missing_contact',
				__( 'Please enter the email address or phone number used when placing your order.', 'vibecano' ),
				400
			);
		}

		if ( ! $this->is_valid_contact( $contact ) ) {
			return $this->error(
				'invalid_contact',
				__( 'Please enter a valid email address or phone number.', 'vibecano' ),
				400
			);
		}

		$order = $this->find_order_by_number( $order_number );
		if ( ! $order ) {
			return $this->not_found_order();
		}

		if ( ! $this->contact_matches_order( $order, $contact ) ) {
			// Same message as not found — do not leak whether the order exists.
			return $this->not_found_order();
		}

		return $this->success( $this->build_safe_payload( $order ) );
	}

	/**
	 * Method 2: tracking number lookup.
	 */
	private function track_by_tracking_number( WP_REST_Request $request ) {
		$tracking_number = trim( (string) $request->get_param( 'trackingNumber' ) );

		if ( '' === $tracking_number ) {
			return $this->error(
				'missing_tracking_number',
				__( 'Please enter your tracking number.', 'vibecano' ),
				400
			);
		}

		$order = $this->find_order_by_tracking_number( $tracking_number );
		if ( ! $order ) {
			return $this->error(
				'tracking_not_found',
				__( "We couldn't find a shipment with this tracking number. Please check the number and try again.", 'vibecano' ),
				404
			);
		}

		$payload = $this->build_safe_payload( $order );

		// Ensure the returned tracking number matches the requested one when multiple exist.
		if ( empty( $payload['trackingNumber'] ) ) {
			$payload['trackingNumber'] = $tracking_number;
		}

		return $this->success( $payload );
	}

	/**
	 * Locate a WooCommerce order by displayed order number / ID.
	 */
	private function find_order_by_number( $order_number ) {
		$order_number = ltrim( $order_number, '#' );

		// Direct ID lookup.
		if ( ctype_digit( $order_number ) ) {
			$order = wc_get_order( absint( $order_number ) );
			if ( $order instanceof WC_Order ) {
				return $order;
			}
		}

		/**
		 * Allow custom order-number plugins (Sequential Order Numbers, etc.).
		 *
		 * @param WC_Order|null $order
		 * @param string        $order_number
		 */
		$filtered = apply_filters( 'vibecano_track_find_order_by_number', null, $order_number );
		if ( $filtered instanceof WC_Order ) {
			return $filtered;
		}

		// Meta lookup for sequential/custom order numbers.
		$orders = wc_get_orders(
			array(
				'limit'      => 1,
				'return'     => 'objects',
				'meta_key'   => '_order_number',
				'meta_value' => $order_number,
			)
		);

		if ( ! empty( $orders[0] ) && $orders[0] instanceof WC_Order ) {
			return $orders[0];
		}

		$orders = wc_get_orders(
			array(
				'limit'      => 1,
				'return'     => 'objects',
				'meta_key'   => '_order_number_formatted',
				'meta_value' => $order_number,
			)
		);

		if ( ! empty( $orders[0] ) && $orders[0] instanceof WC_Order ) {
			return $orders[0];
		}

		return null;
	}

	/**
	 * Find an order that owns the given tracking number.
	 */
	private function find_order_by_tracking_number( $tracking_number ) {
		$normalized = $this->normalize_tracking( $tracking_number );

		/**
		 * Adapter hook for custom shipment providers / APIs.
		 *
		 * @param WC_Order|null $order
		 * @param string        $tracking_number
		 */
		$filtered = apply_filters( 'vibecano_track_find_order_by_tracking', null, $tracking_number );
		if ( $filtered instanceof WC_Order ) {
			return $filtered;
		}

		foreach ( $this->tracking_meta_keys as $meta_key ) {
			$orders = wc_get_orders(
				array(
					'limit'      => 5,
					'return'     => 'objects',
					'meta_key'   => $meta_key,
					'meta_value' => $tracking_number,
				)
			);

			foreach ( $orders as $order ) {
				if ( $order instanceof WC_Order ) {
					return $order;
				}
			}
		}

		// Fallback: scan recent orders for serialized shipment tracking arrays.
		$recent = wc_get_orders(
			array(
				'limit'   => 50,
				'orderby' => 'date',
				'order'   => 'DESC',
				'return'  => 'objects',
				'status'  => array_keys( wc_get_order_statuses() ),
			)
		);

		foreach ( $recent as $order ) {
			if ( ! $order instanceof WC_Order ) {
				continue;
			}
			$shipment = $this->extract_shipment_data( $order );
			if ( ! empty( $shipment['trackingNumber'] ) && $this->normalize_tracking( $shipment['trackingNumber'] ) === $normalized ) {
				return $order;
			}
		}

		return null;
	}

	/**
	 * Verify email OR phone against billing (and optionally shipping) details.
	 */
	private function contact_matches_order( WC_Order $order, $contact ) {
		$contact = strtolower( trim( $contact ) );

		$email = strtolower( trim( (string) $order->get_billing_email() ) );
		if ( $email && is_email( $contact ) && hash_equals( $email, $contact ) ) {
			return true;
		}

		$phones = array( (string) $order->get_billing_phone() );
		if ( method_exists( $order, 'get_shipping_phone' ) ) {
			$phones[] = (string) $order->get_shipping_phone();
		}
		$phones = array_filter( $phones );

		$contact_digits = $this->digits_only( $contact );
		foreach ( $phones as $phone ) {
			$phone_digits = $this->digits_only( $phone );
			if ( '' === $phone_digits || '' === $contact_digits ) {
				continue;
			}
			if ( $this->phones_match( $phone_digits, $contact_digits ) ) {
				return true;
			}
		}

		/**
		 * Allow custom verification (e.g. account phone meta).
		 *
		 * @param bool     $matches
		 * @param WC_Order $order
		 * @param string   $contact
		 */
		return (bool) apply_filters( 'vibecano_track_contact_matches', false, $order, $contact );
	}

	/**
	 * Build a sanitized response — never include addresses, payment, or full order objects.
	 */
	private function build_safe_payload( WC_Order $order ) {
		$status       = $order->get_status(); // without wc- prefix
		$status_map   = $this->map_status( $status );
		$shipment     = $this->extract_shipment_data( $order );
		$order_number = $order->get_order_number();

		$payload = array(
			'orderNumber'       => (string) $order_number,
			'status'            => $status_map['status'],
			'statusLabel'       => $status_map['label'],
			'carrier'           => $shipment['carrier'] ? (string) $shipment['carrier'] : null,
			'trackingNumber'    => $shipment['trackingNumber'] ? (string) $shipment['trackingNumber'] : null,
			'trackingUrl'       => $shipment['trackingUrl'] ? esc_url_raw( $shipment['trackingUrl'] ) : null,
			'estimatedDelivery' => $shipment['estimatedDelivery'] ? (string) $shipment['estimatedDelivery'] : null,
			'lastUpdated'       => gmdate( 'c', $order->get_date_modified() ? $order->get_date_modified()->getTimestamp() : time() ),
		);

		/**
		 * Filter the public tracking payload. Do NOT add PII.
		 *
		 * @param array    $payload
		 * @param WC_Order $order
		 */
		$payload = apply_filters( 'vibecano_track_safe_payload', $payload, $order );

		return $payload;
	}

	/**
	 * Map WooCommerce statuses to customer-friendly tracking stages.
	 */
	private function map_status( $status ) {
		$status = strtolower( (string) $status );

		$map = array(
			'pending'           => array( 'status' => 'pending', 'label' => __( 'Order Confirmed', 'vibecano' ) ),
			'on-hold'           => array( 'status' => 'on-hold', 'label' => __( 'On Hold', 'vibecano' ) ),
			'processing'        => array( 'status' => 'processing', 'label' => __( 'Processing', 'vibecano' ) ),
			'shipped'           => array( 'status' => 'shipped', 'label' => __( 'Shipped', 'vibecano' ) ),
			'wc-shipped'        => array( 'status' => 'shipped', 'label' => __( 'Shipped', 'vibecano' ) ),
			'out-for-delivery'  => array( 'status' => 'out-for-delivery', 'label' => __( 'Out for Delivery', 'vibecano' ) ),
			'completed'         => array( 'status' => 'delivered', 'label' => __( 'Delivered', 'vibecano' ) ),
			'delivered'         => array( 'status' => 'delivered', 'label' => __( 'Delivered', 'vibecano' ) ),
			'cancelled'         => array( 'status' => 'cancelled', 'label' => __( 'Cancelled', 'vibecano' ) ),
			'refunded'          => array( 'status' => 'refunded', 'label' => __( 'Refunded', 'vibecano' ) ),
			'failed'            => array( 'status' => 'failed', 'label' => __( 'Failed', 'vibecano' ) ),
		);

		/**
		 * Customize status mapping for custom WooCommerce order statuses.
		 *
		 * @param array  $map
		 * @param string $status
		 */
		$map = apply_filters( 'vibecano_track_status_map', $map, $status );

		if ( isset( $map[ $status ] ) ) {
			return $map[ $status ];
		}

		return array(
			'status' => $status,
			'label'  => ucwords( str_replace( array( '-', '_' ), ' ', $status ) ),
		);
	}

	/**
	 * Extract tracking data from common plugin meta formats.
	 * Integration point for real carrier APIs.
	 */
	private function extract_shipment_data( WC_Order $order ) {
		$data = array(
			'carrier'           => '',
			'trackingNumber'    => '',
			'trackingUrl'       => '',
			'estimatedDelivery' => '',
		);

		// WooCommerce Shipment Tracking plugin format.
		$items = $order->get_meta( '_wc_shipment_tracking_items', true );
		if ( is_array( $items ) && ! empty( $items ) ) {
			$first = reset( $items );
			if ( is_array( $first ) ) {
				$data['trackingNumber'] = isset( $first['tracking_number'] ) ? (string) $first['tracking_number'] : '';
				$data['carrier']        = isset( $first['tracking_provider'] ) ? (string) $first['tracking_provider'] : '';
				if ( empty( $data['carrier'] ) && ! empty( $first['custom_tracking_provider'] ) ) {
					$data['carrier'] = (string) $first['custom_tracking_provider'];
				}
				if ( ! empty( $first['custom_tracking_link'] ) ) {
					$data['trackingUrl'] = (string) $first['custom_tracking_link'];
				}
				if ( ! empty( $first['date_shipped'] ) ) {
					// Keep estimated delivery separate; date_shipped is not ETA.
				}
			}
		}

		foreach ( $this->tracking_meta_keys as $key ) {
			if ( '_wc_shipment_tracking_items' === $key ) {
				continue;
			}
			$value = $order->get_meta( $key, true );
			if ( is_string( $value ) && '' !== trim( $value ) && '' === $data['trackingNumber'] ) {
				$data['trackingNumber'] = trim( $value );
			}
		}

		foreach ( $this->related_meta['carrier'] as $key ) {
			$value = $order->get_meta( $key, true );
			if ( is_string( $value ) && '' !== trim( $value ) && '' === $data['carrier'] ) {
				$data['carrier'] = trim( $value );
			}
		}

		foreach ( $this->related_meta['url'] as $key ) {
			$value = $order->get_meta( $key, true );
			if ( is_string( $value ) && '' !== trim( $value ) && '' === $data['trackingUrl'] ) {
				$data['trackingUrl'] = trim( $value );
			}
		}

		foreach ( $this->related_meta['date'] as $key ) {
			$value = $order->get_meta( $key, true );
			if ( ! empty( $value ) && '' === $data['estimatedDelivery'] ) {
				$data['estimatedDelivery'] = is_numeric( $value )
					? gmdate( 'Y-m-d', (int) $value )
					: sanitize_text_field( (string) $value );
			}
		}

		/**
		 * Primary adapter for live carrier / 3PL APIs.
		 * Return the same shape as $data to override meta-based values.
		 *
		 * Example:
		 * add_filter( 'vibecano_track_shipment_adapter', function( $data, $order ) {
		 *     // Call AfterShip / Shiprocket / EasyPost server-side here.
		 *     return $data;
		 * }, 10, 2 );
		 *
		 * @param array    $data
		 * @param WC_Order $order
		 */
		$data = apply_filters( 'vibecano_track_shipment_adapter', $data, $order );

		return $data;
	}

	public function sanitize_contact( $value ) {
		$value = is_string( $value ) ? trim( $value ) : '';
		if ( is_email( $value ) ) {
			return sanitize_email( $value );
		}
		return sanitize_text_field( $value );
	}

	private function is_valid_contact( $contact ) {
		if ( is_email( $contact ) ) {
			return true;
		}
		$digits = $this->digits_only( $contact );
		return strlen( $digits ) >= 7 && strlen( $digits ) <= 15;
	}

	private function digits_only( $value ) {
		return preg_replace( '/\D+/', '', (string) $value );
	}

	private function phones_match( $a, $b ) {
		if ( hash_equals( $a, $b ) ) {
			return true;
		}
		// Compare last 10 digits to tolerate country codes.
		$a_tail = substr( $a, -10 );
		$b_tail = substr( $b, -10 );
		return $a_tail && $b_tail && hash_equals( $a_tail, $b_tail );
	}

	private function normalize_tracking( $value ) {
		return strtoupper( preg_replace( '/\s+/', '', (string) $value ) );
	}

	private function woocommerce_ready() {
		return class_exists( 'WooCommerce' ) && function_exists( 'wc_get_order' );
	}

	private function check_rate_limit() {
		$ip = $this->client_ip();
		$key = self::TRANSIENT_PREFIX . md5( $ip );
		$bucket = get_transient( $key );

		if ( ! is_array( $bucket ) ) {
			$bucket = array(
				'count' => 0,
				'start' => time(),
			);
		}

		if ( ( time() - (int) $bucket['start'] ) > self::RATE_LIMIT_WINDOW ) {
			$bucket = array(
				'count' => 0,
				'start' => time(),
			);
		}

		$bucket['count']++;

		set_transient( $key, $bucket, self::RATE_LIMIT_WINDOW );

		$max = (int) apply_filters( 'vibecano_track_rate_limit_max', self::RATE_LIMIT_MAX );
		if ( $bucket['count'] > $max ) {
			return new WP_Error(
				'rate_limited',
				__( 'Too many requests. Please wait a moment and try again.', 'vibecano' ),
				array( 'status' => 429 )
			);
		}

		return true;
	}

	private function client_ip() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
		/**
		 * Caution: only trust forwarded headers behind a known reverse proxy.
		 *
		 * @param string $ip
		 */
		return (string) apply_filters( 'vibecano_track_client_ip', $ip );
	}

	private function success( array $data ) {
		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $data,
			)
		);
	}

	private function error( $code, $message, $status ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}

	private function not_found_order() {
		return $this->error(
			'order_not_found',
			__( 'Order not found. Please check your details and try again.', 'vibecano' ),
			404
		);
	}

	/**
	 * Localize endpoint + REST nonce for the Elementor HTML widget.
	 * Printed in both head and early footer so the widget can read it
	 * whether the HTML widget script runs before or after wp_footer output.
	 */
	public function maybe_localize_config() {
		add_action( 'wp_head', array( $this, 'print_frontend_config' ), 20 );
		add_action( 'wp_footer', array( $this, 'print_frontend_config' ), 1 );
	}

	public function print_frontend_config() {
		if ( is_admin() ) {
			return;
		}

		static $printed = false;
		if ( $printed ) {
			return;
		}
		$printed = true;

		$config = array(
			'endpoint'        => esc_url_raw( rest_url( self::NS . self::ROUTE ) ),
			'nonce'           => wp_create_nonce( 'wp_rest' ),
			'refreshInterval' => 60000,
		);

		printf(
			'<script>window.VIBECANO_TRACKING_CONFIG = %s;</script>' . "\n",
			wp_json_encode( $config )
		);
	}
}

Vibecano_Order_Tracking_API::init();

/**
 * ---------------------------------------------------------------------------
 * OPTIONAL: Custom shipment provider adapter example
 * ---------------------------------------------------------------------------
 *
 * add_filter( 'vibecano_track_shipment_adapter', function( $data, $order ) {
 *     // Server-side only. Never put API keys in frontend JS.
 *     // $api_key = defined('VIBECANO_SHIP_API_KEY') ? VIBECANO_SHIP_API_KEY : '';
 *     // Call your carrier / AfterShip / Shiprocket API here using $data['trackingNumber'].
 *     // Merge live status into $data if needed, and/or update status via
 *     // vibecano_track_safe_payload filter.
 *     return $data;
 * }, 10, 2 );
 *
 * add_filter( 'vibecano_track_status_map', function( $map ) {
 *     $map['custom-packed'] = array(
 *         'status' => 'processing',
 *         'label'  => 'Processing',
 *     );
 *     return $map;
 * } );
 */
