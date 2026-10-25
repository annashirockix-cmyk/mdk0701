<?php
/**
 * Title: header
 * Slug: ury/header
 * Inserter: no
 */
?>
<!-- wp:group {"metadata":{"name":"header"},"layout":{"type":"default"}} -->
<div class="wp-block-group"><!-- wp:spacer {"height":"var:preset|spacing|50"} -->
<div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:site-logo {"width":60,"shouldSyncIcon":true} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@mobile":{"spacing":{"blockGap":"0"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:site-title {"level":0,"fontSize":"2x-large"} /-->

<!-- wp:site-tagline {"style":{"@mobile":{"typography":{"fontSize":"var:preset|font-size|small"}}}} /--></div>
<!-- /wp:group -->

<!-- wp:navigation {"overlayMenu":"never","style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.1em"},"spacing":{"blockGap":"var:preset|spacing|20"},"@mobile":{"typography":{"fontSize":"var:preset|font-size|small"}}},"fontSize":"small","layout":{"type":"flex","flexWrap":"wrap","orientation":"vertical"}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)"><!-- wp:paragraph {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|30"}}}} -->
<p style="padding-bottom:var(--wp--preset--spacing--30)"><?php esc_html_e( 'Recent Posts', 'ury' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:latest-posts {"style":{"spacing":{"blockGap":"0"}},"textColor":"theme-3"} /--></div>
<!-- /wp:group -->

<!-- wp:social-links {"iconColor":"theme-3","iconColorValue":"#000000","className":"is-style-logos-only","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}}} -->
<ul class="wp-block-social-links has-icon-color is-style-logos-only"><!-- wp:social-link {"url":"#","service":"instagram"} /-->

<!-- wp:social-link {"url":"#","service":"facebook"} /-->

<!-- wp:social-link {"url":"#","service":"tiktok"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group -->