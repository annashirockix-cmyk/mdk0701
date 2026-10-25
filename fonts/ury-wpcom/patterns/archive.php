<?php
/**
 * Title: archive
 * Slug: ury/archive
 * Inserter: no
 */
?>
<!-- wp:group {"style":{"dimensions":{"minHeight":"100dvh"}},"backgroundColor":"theme-1","layout":{"type":"default"}} -->
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

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:query-title {"type":"archive","showPrefix":false,"fontSize":"2x-large"} /-->

<!-- wp:term-description /-->

<!-- wp:spacer {"height":"var:preset|spacing|30"} -->
<div style="height:var(--wp--preset--spacing--30)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":0,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true,"taxQuery":null,"parents":[],"excludeCurrent":null},"layout":{"type":"default"}} -->
<div class="wp-block-query"><!-- wp:post-template {"style":{"spacing":{"blockGap":"var:preset|spacing|30","padding":{"right":"0","left":"0","top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
<!-- wp:group {"style":{"border":{"bottom":{"color":"var:preset|color|theme-5","width":"1px"}},"spacing":{"padding":{"bottom":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--theme-5);border-bottom-width:1px;padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:post-title {"isLink":true,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} /-->

<!-- wp:post-date {"textColor":"theme-3","fontSize":"small"} /--></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p><?php esc_html_e( 'Sorry, but nothing was found. Please try a search with different keywords.', 'ury' ); ?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","style":{"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|50"},"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"fontSize":"small","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide has-small-font-size" style="margin-top:0;margin-bottom:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:query-pagination {"paginationArrow":"chevron","fontSize":"medium","layout":{"type":"flex","justifyContent":"space-between"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></main>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->