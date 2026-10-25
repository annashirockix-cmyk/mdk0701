<?php
/**
 * Title: archive
 * Slug: primarium/archive
 * Inserter: no
 */
?>
<!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() . '/assets/images/primarium--grid-line.png' ); ?>","isRepeated":true,"dimRatio":0,"customOverlayColor":"#fdfdfd","isUserOverlayColor":false,"focalPoint":{"x":0,"y":0},"minHeight":100,"minHeightUnit":"dvh","contentPosition":"top center","isDark":false,"sizeSlug":"full","metadata":{"name":"index","patternName":"primarium/index"},"style":{"spacing":{"padding":{"top":"0","bottom":"0","right":"0","left":"var:preset|spacing|small"}}},"layout":{"type":"default"}} -->
<div class="wp-block-cover is-light is-repeated has-custom-content-position is-position-top-center" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:var(--wp--preset--spacing--small);min-height:100dvh"><div class="wp-block-cover__image-background size-full is-repeated" style="background-position:0% 0%;background-image:url(<?php echo esc_url( get_template_directory_uri() . '/assets/images/primarium--grid-line.png' ); ?>)"></div><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#fdfdfd"></span><div class="wp-block-cover__inner-container"><!-- wp:group {"metadata":{"name":"Paper Sheet Wrapper"},"align":"wide","style":{"border":{"left":{"color":"var:preset|color|theme-3","width":"1px"}},"spacing":{"blockGap":"0","padding":{"right":"var:preset|spacing|small","left":"var:preset|spacing|small","top":"var:preset|spacing|large","bottom":"var:preset|spacing|large"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignwide" style="border-left-color:var(--wp--preset--color--theme-3);border-left-width:1px;padding-top:var(--wp--preset--spacing--large);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--large);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"tagName":"main","metadata":{"name":"Content"},"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"layout":{"type":"constrained","justifyContent":"center"}} -->
<main class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:columns {"verticalAlignment":"top","align":"full","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":{"top":"var:preset|spacing|small","left":"var:preset|spacing|small"}}}} -->
<div class="wp-block-columns alignfull are-vertically-aligned-top" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"top","width":"","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0"><!-- wp:template-part {"slug":"header"} /--></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"75%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:75%"></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"var:preset|spacing|large","metadata":{"name":"L"}} -->
<div style="height:var(--wp--preset--spacing--large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns {"verticalAlignment":"top","align":"full","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|x-small","left":"var:preset|spacing|xx-small"}}}} -->
<div class="wp-block-columns alignfull are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top","width":"25%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:25%"><!-- wp:query-title {"type":"archive","showPrefix":false,"style":{"spacing":{"margin":{"top":"-18px"}}}} /--></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"75%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:75%"><!-- wp:query {"queryId":0,"query":{"perPage":20,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"ignore","inherit":true,"taxQuery":null,"parents":[]},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"style":{"spacing":{"blockGap":"var:preset|spacing|large"}},"layout":{"type":"grid","minimumColumnWidth":"440px"}} -->
<!-- wp:post-featured-image /-->

<!-- wp:post-title {"isLink":true,"style":{"spacing":{"margin":{"top":"-8px","bottom":"0"}},"typography":{"textTransform":"uppercase"}},"fontSize":"large"} /-->

<!-- wp:group {"metadata":{"name":"Date Wrapper"},"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php esc_html_e('↳', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"datetime":"2026-01-19T14:30:35.615Z","format":"M j","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"date"}}}}} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Excerpt"},"style":{"spacing":{"blockGap":"0","margin":{"top":"var:preset|spacing|small"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--small)"><!-- wp:post-excerpt {"moreText":"","showMoreOnNewLine":false,"excerptLength":20} /-->

<!-- wp:read-more {"content":"≻","fontSize":"large"} /--></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:group {"metadata":{"name":"Pagination"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|large","bottom":"var:preset|spacing|x-small"},"padding":{"top":"var:preset|spacing|x-small","bottom":"var:preset|spacing|x-small"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--large);margin-bottom:var(--wp--preset--spacing--x-small);padding-top:var(--wp--preset--spacing--x-small);padding-bottom:var(--wp--preset--spacing--x-small)"><!-- wp:query-pagination {"align":"full","layout":{"type":"flex","justifyContent":"space-between"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p><?php esc_html_e('Sorry, but nothing was found. Please try a search with different keywords.', 'primarium');?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"var:preset|spacing|large","metadata":{"name":"L"}} -->
<div style="height:var(--wp--preset--spacing--large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer"} /--></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->