<?php
/**
 * Primarium functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Primarium
 * @since Primarium 1.0
 */

/* functions.php */
if ( ! function_exists( 'primarium_support' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * @since Primarium 1.0
	 * @return void
	 */
	function primarium_support() {
		// Make theme available for translation.
		load_theme_textdomain( 'primarium' );
	}
endif;
add_action( 'after_setup_theme', 'primarium_support' );

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'primarium_editor_style' ) ) :
	/**
	 * Enqueues editor-style.css in the editors.
	 *
	 * @since Primarium 1.0
	 * @return void
	 */
	function primarium_editor_style() {
		add_editor_style( 'assets/css/editor-style.css' );
	}
endif;
add_action( 'after_setup_theme', 'primarium_editor_style' );

if ( ! function_exists( 'primarium_styles' ) ) :
	/**
	 * Enqueue styles.
	 *
	 * @since Primarium 1.0
	 * @return void
	 */
	function primarium_styles() {
		// Register theme stylesheet.
		wp_register_style(
			'primarium-style',
			get_stylesheet_directory_uri() . '/style.css',
			array(),
			wp_get_theme()->get( 'Version' )
		);

		// Enqueue theme stylesheet.
		wp_enqueue_style( 'primarium-style' );
	}
endif;
add_action( 'wp_enqueue_scripts', 'primarium_styles' );


// updater for WordPress.com themes
if ( is_admin() )
	include dirname( __FILE__ ) . '/inc/updater.php';
