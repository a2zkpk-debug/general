<?php
/**
 * Plugin Name: Vibecano Featured Products
 * Description: Dynamic featured product showcase for Elementor (replaces static HTML widget).
 * Version: 1.1.0
 * Author: Vibecano
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Query products for the showcase.
 *
 * @param array $atts Shortcode / widget attributes.
 * @return WC_Product[]
 */
function vibecano_get_featured_products( $atts ) {
	$limit = max( 1, min( 12, absint( $atts['limit'] ) ) );

	$query_args = array(
		'status'  => 'publish',
		'limit'   => $limit,
		'orderby' => sanitize_key( $atts['orderby'] ),
		'order'   => strtoupper( $atts['order'] ) === 'ASC' ? 'ASC' : 'DESC',
	);

	if ( 'manual' === $atts['source'] && ! empty( $atts['ids'] ) ) {
		$ids = array_filter( array_map( 'absint', explode( ',', $atts['ids'] ) ) );
		if ( empty( $ids ) ) {
			return array();
		}
		$query_args['include'] = $ids;
		$query_args['orderby'] = 'include';
	} elseif ( 'recent' === $atts['source'] ) {
		$query_args['orderby'] = 'date';
		$query_args['order']   = 'DESC';
	} else {
		$query_args['featured'] = true;
	}

	$products = wc_get_products( $query_args );

	// If no featured products exist, fall back to the newest products.
	if ( empty( $products ) && 'featured' === $atts['source'] ) {
		unset( $query_args['featured'] );
		$query_args['orderby'] = 'date';
		$query_args['order']   = 'DESC';
		$products              = wc_get_products( $query_args );
	}

	return $products;
}

/**
 * Render the featured products section.
 *
 * Usage:
 *   [vibecano_featured_products]
 *   [vibecano_featured_products source="recent" limit="4"]
 *
 * @param array|string $atts Shortcode attributes.
 * @return string
 */
function vibecano_featured_products_shortcode( $atts ) {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return vibecano_featured_products_notice(
			'WooCommerce is not active. Activate WooCommerce to show featured products.'
		);
	}

	$atts = shortcode_atts(
		array(
			'limit'   => 4,
			'orderby' => 'date',
			'order'   => 'DESC',
			'source'  => 'featured',
			'ids'     => '',
		),
		$atts,
		'vibecano_featured_products'
	);

	$products = vibecano_get_featured_products( $atts );

	if ( empty( $products ) ) {
		return vibecano_featured_products_notice(
			'No products found. Publish at least one WooCommerce product with a product image.'
		);
	}

	static $styles_printed = false;

	ob_start();

	if ( ! $styles_printed ) {
		$styles_printed = true;
		vibecano_featured_products_styles();
	}
	?>
<section class="vc-featured-cats">
  <div class="vc-featured-cats-inner">
    <div class="vc-featured-cats-head">
      <div>
        <span class="vc-featured-cats-kicker">Featured products</span>
        <h2 class="vc-featured-cats-title">Fresh styles made for your vibe.</h2>
        <p class="vc-featured-cats-sub">A clean, visual showcase of selected Vibecano products with premium imagery and direct product discovery.</p>
      </div>

      <a class="vc-featured-cats-shop" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">View full shop</a>
    </div>

    <div class="vc-featured-cats-grid">
      <?php foreach ( $products as $product ) : ?>
        <?php
        $image_id  = $product->get_image_id();
        $image_url = $image_id
          ? wp_get_attachment_image_url( $image_id, 'large' )
          : wc_placeholder_img_src( 'large' );
        ?>
        <a class="vc-featured-cat" href="<?php echo esc_url( $product->get_permalink() ); ?>">
          <img
            src="<?php echo esc_url( $image_url ); ?>"
            alt="<?php echo esc_attr( $product->get_name() ); ?>"
            loading="lazy"
          >
          <span class="vc-featured-cat-content">
            <span>
              <span class="vc-featured-cat-name"><?php echo esc_html( $product->get_name() ); ?></span>
            </span>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
	<?php
	return ob_get_clean();
}
add_shortcode( 'vibecano_featured_products', 'vibecano_featured_products_shortcode' );

/**
 * Visible notice for admins when nothing can be rendered.
 *
 * @param string $message Message text.
 * @return string
 */
function vibecano_featured_products_notice( $message ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return '';
	}

	return sprintf(
		'<div style="padding:16px 18px;border:1px solid #f59e0b;border-radius:12px;background:#fffbeb;color:#92400e;font:600 14px/1.5 Inter,sans-serif;">Vibecano Featured Products: %s</div>',
		esc_html( $message )
	);
}

/**
 * Print section styles once.
 */
function vibecano_featured_products_styles() {
	?>
<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap");

  .vc-featured-cats,
  .vc-featured-cats * {
    box-sizing: border-box;
  }

  .vc-featured-cats {
    position: relative;
    overflow: hidden;
    padding: 86px 20px;
    background:
      radial-gradient(circle at 12% 10%, rgba(249, 115, 22, 0.13), transparent 28%),
      radial-gradient(circle at 90% 8%, rgba(37, 99, 235, 0.12), transparent 30%),
      linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    color: #0f172a;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    isolation: isolate;
  }

  .vc-featured-cats::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, black, transparent 78%);
  }

  .vc-featured-cats-inner {
    max-width: 1240px;
    margin: 0 auto;
  }

  .vc-featured-cats-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 24px;
    margin-bottom: 34px;
  }

  .vc-featured-cats-kicker {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 12px;
    padding: 8px 13px;
    border: 1px solid rgba(37, 99, 235, 0.16);
    border-radius: 999px;
    background: rgba(219, 234, 254, 0.88);
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .vc-featured-cats-kicker::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #2563eb;
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.12);
  }

  .vc-featured-cats-title {
    max-width: 720px;
    margin: 0;
    font-family: "Plus Jakarta Sans", Inter, sans-serif;
    font-size: clamp(30px, 4vw, 46px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .vc-featured-cats-sub {
    max-width: 610px;
    margin: 12px 0 0;
    color: #64748b;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.7;
  }

  .vc-featured-cats-shop {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0 18px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 999px;
    background: #fff;
    color: #0f172a;
    font-size: 14px;
    font-weight: 900;
    text-decoration: none;
    box-shadow: 0 18px 38px -28px rgba(15, 23, 42, 0.65);
    transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease;
    white-space: nowrap;
  }

  .vc-featured-cats-shop:hover,
  .vc-featured-cats-shop:focus-visible {
    border-color: rgba(37, 99, 235, 0.36);
    color: #2563eb;
    transform: translateY(-2px);
  }

  .vc-featured-cats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }

  .vc-featured-cat {
    position: relative;
    display: block;
    overflow: hidden;
    min-height: 360px;
    aspect-ratio: 4 / 5;
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 28px;
    background: #0f172a;
    color: #fff;
    text-decoration: none;
    box-shadow: 0 26px 60px -42px rgba(15, 23, 42, 0.95);
    isolation: isolate;
    transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  }

  .vc-featured-cat:hover,
  .vc-featured-cat:focus-visible {
    border-color: rgba(37, 99, 235, 0.34);
    box-shadow: 0 34px 76px -44px rgba(15, 23, 42, 1);
    transform: translateY(-7px);
  }

  .vc-featured-cat img {
    position: absolute;
    inset: 0;
    z-index: -3;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    filter: saturate(1.05) contrast(1.04);
    transition: transform 0.55s ease, filter 0.55s ease;
  }

  .vc-featured-cat:hover img,
  .vc-featured-cat:focus-visible img {
    filter: saturate(1.14) contrast(1.08);
    transform: scale(1.08);
  }

  .vc-featured-cat::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -2;
    background:
      linear-gradient(to top, rgba(2, 6, 23, 0.88), rgba(2, 6, 23, 0.28) 48%, rgba(2, 6, 23, 0.02)),
      radial-gradient(circle at top right, rgba(249, 115, 22, 0.2), transparent 34%);
  }

  .vc-featured-cat::after {
    content: "";
    position: absolute;
    inset: 14px;
    z-index: -1;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 22px;
    pointer-events: none;
  }

  .vc-featured-cat-content {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: 22px;
    display: block;
  }

  .vc-featured-cat-name {
    display: block;
    margin-bottom: 8px;
    font-family: "Plus Jakarta Sans", Inter, sans-serif;
    font-size: clamp(21px, 2vw, 26px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.035em;
    text-shadow: 0 18px 34px rgba(0, 0, 0, 0.38);
  }

  @media (max-width: 980px) {
    .vc-featured-cats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .vc-featured-cat {
      min-height: 300px;
    }
  }

  @media (max-width: 720px) {
    .vc-featured-cats {
      padding: 62px 16px;
    }

    .vc-featured-cats-head {
      grid-template-columns: 1fr;
      margin-bottom: 26px;
    }

    .vc-featured-cats-shop {
      width: 100%;
    }

    .vc-featured-cats-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .vc-featured-cat {
      min-height: 280px;
      border-radius: 24px;
      aspect-ratio: 4 / 4.35;
    }

    .vc-featured-cat-content {
      left: 18px;
      right: 18px;
      bottom: 18px;
    }
  }
</style>
	<?php
}

/**
 * Run shortcodes inside Elementor widget output.
 *
 * Elementor HTML widgets do not process shortcodes by default.
 *
 * @param string      $content Widget HTML.
 * @param \Elementor\Widget_Base $widget Widget instance.
 * @return string
 */
function vibecano_elementor_process_shortcodes( $content, $widget ) {
	if ( is_string( $content ) && false !== strpos( $content, '[vibecano_featured_products' ) ) {
		return do_shortcode( $content );
	}

	return $content;
}
add_filter( 'elementor/widget/render_content', 'vibecano_elementor_process_shortcodes', 10, 2 );

/**
 * Register native Elementor widget (most reliable option).
 */
function vibecano_register_elementor_widget( $widgets_manager ) {
	if ( ! class_exists( '\Elementor\Widget_Base' ) ) {
		return;
	}

	if ( ! class_exists( 'Vibecano_Featured_Products_Elementor_Widget' ) ) {
		class Vibecano_Featured_Products_Elementor_Widget extends \Elementor\Widget_Base {

			public function get_name() {
				return 'vibecano_featured_products';
			}

			public function get_title() {
				return 'Vibecano Featured Products';
			}

			public function get_icon() {
				return 'eicon-products';
			}

			public function get_categories() {
				return class_exists( '\Elementor\Modules\Woocommerce\Module' )
					? array( 'woocommerce-elements' )
					: array( 'general' );
			}

			public function get_keywords() {
				return array( 'vibecano', 'featured', 'products', 'woocommerce', 'shop' );
			}

			protected function register_controls() {
				$this->start_controls_section(
					'content_section',
					array(
						'label' => 'Products',
					)
				);

				$this->add_control(
					'source',
					array(
						'label'   => 'Product source',
						'type'    => \Elementor\Controls_Manager::SELECT,
						'default' => 'featured',
						'options' => array(
							'featured' => 'Featured products',
							'recent'   => 'Newest products',
							'manual'   => 'Manual product IDs',
						),
					)
				);

				$this->add_control(
					'limit',
					array(
						'label'   => 'Number of products',
						'type'    => \Elementor\Controls_Manager::NUMBER,
						'default' => 4,
						'min'     => 1,
						'max'     => 12,
					)
				);

				$this->add_control(
					'ids',
					array(
						'label'       => 'Product IDs',
						'type'        => \Elementor\Controls_Manager::TEXT,
						'description' => 'Comma-separated IDs. Used only when source is Manual.',
						'condition'   => array(
							'source' => 'manual',
						),
					)
				);

				$this->end_controls_section();
			}

			protected function render() {
				$settings = $this->get_settings_for_display();

				echo vibecano_featured_products_shortcode(
					array(
						'source' => $settings['source'],
						'limit'  => $settings['limit'],
						'ids'    => $settings['ids'],
					)
				);
			}
		}
	}

	if ( method_exists( $widgets_manager, 'register' ) ) {
		$widgets_manager->register( new Vibecano_Featured_Products_Elementor_Widget() );
	} elseif ( method_exists( $widgets_manager, 'register_widget_type' ) ) {
		$widgets_manager->register_widget_type( new Vibecano_Featured_Products_Elementor_Widget() );
	}
}
add_action( 'elementor/widgets/register', 'vibecano_register_elementor_widget' );
add_action( 'elementor/widgets/widgets_registered', 'vibecano_register_elementor_widget' );
