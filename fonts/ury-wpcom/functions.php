<?php
/**
 * Ury functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Ury
 * @since Ury 1.0
 */

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'ury_editor_style' ) ) :
	/**
	 * Enqueues editor-style.css in the editors.
	 *
	 * @since Ury 1.0
	 * @return void
	 */
	function ury_editor_style() {
		add_editor_style( 'assets/css/editor-style.css' );
	}
endif;
add_action( 'after_setup_theme', 'ury_editor_style' );

if ( ! function_exists( 'ury_styles' ) ) :
	/**
	 * Enqueue styles.
	 *
	 * @since Ury 1.0
	 * @return void
	 */
	function ury_styles() {
		// Register theme stylesheet.
		wp_register_style(
			'ury-style',
			get_stylesheet_directory_uri() . '/style.css',
			array(),
			wp_get_theme()->get( 'Version' )
		);

		// Enqueue theme stylesheet.
		wp_enqueue_style( 'ury-style' );
	}
endif;
add_action( 'wp_enqueue_scripts', 'ury_styles' );


// updater for WordPress.com themes
if ( is_admin() )
	include dirname( __FILE__ ) . '/inc/updater.php';
