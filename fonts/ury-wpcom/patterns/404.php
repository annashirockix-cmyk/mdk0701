<?php
/**
 * Title: 404
 * Slug: ury/404
 * Inserter: no
 */
?>
<!-- wp:group {"metadata":{"name":"404"},"style":{"dimensions":{"minHeight":"100dvh"}},"backgroundColor":"theme-1","layout":{"type":"default"}} -->
<div class="wp-block-group has-theme-1-background-color has-background" style="min-height:100dvh"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"0","left":"0"}}}} -->
<div class="wp-block-columns"><!-- wp:column {"width":"30%","style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|70","left":"var:preset|spacing|60","right":"var:preset|spacing|60"}},"@mobile":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40","top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}}} -->
<div class="wp-block-column" style="padding-top:0;padding-right:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--60);flex-basis:30%"><!-- wp:group {"metadata":{"name":"Header"},"style":{"position":{"type":"sticky","top":"0px"}},"layout":{"type":"default"}} -->
<div class="wp-block-group"><!-- wp:template-part {"slug":"header","area":"header"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"70%","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"var:preset|spacing|60","right":"var:preset|spacing|60"}},"@mobile":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40"}}}}} -->
<div class="wp-block-column" style="padding-top:0;padding-right:var(--wp--preset--spacing--60);padding-bottom:0;padding-left:var(--wp--preset--spacing--60);flex-basis:70%"><!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="padding-right:0;padding-left:0"><!-- wp:spacer {"height":"var:preset|spacing|60","metadata":{"blockVisibility":{"viewport":{"mobile":false}}}} -->
<div style="height:var(--wp--preset--spacing--60)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"level":1,"fontSize":"2x-large"} -->
<h1 class="wp-block-heading has-2-x-large-font-size"><?php esc_html_e( 'Page not found', 'ury' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'The page you are looking for doesn\'t exist, or it has been moved. Please try searching using the form below.', 'ury' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:search {"label":"<?php esc_attr_e( 'Search', 'ury' ); ?>","showLabel":false,"buttonText":"<?php esc_attr_e( 'Search', 'ury' ); ?>","buttonUseIcon":true} /--></main>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->