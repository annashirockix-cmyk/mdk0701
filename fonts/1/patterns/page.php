<?php
/**
 * Title: page
 * Slug: primarium/page
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

<!-- wp:columns {"verticalAlignment":"top","align":"full","style":{"spacing":{"blockGap":{"top":"0","left":"9px"}}}} -->
<div class="wp-block-columns alignfull are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top","width":"25%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:25%"><!-- wp:post-title {"level":1,"style":{"spacing":{"margin":{"top":"-16px"}}}} /-->

<!-- wp:group {"metadata":{"name":"Date Wrapper"},"style":{"spacing":{"blockGap":"5px","margin":{"top":"var:preset|spacing|regular","bottom":"var:preset|spacing|regular"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--regular);margin-bottom:var(--wp--preset--spacing--regular)"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php esc_html_e('↳', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"datetime":"2026-01-19T14:30:35.615Z","format":"M j","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"date"}}}},"className":"wp-block-post-date__modified-date"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"75%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:75%"><!-- wp:group {"metadata":{"name":"Content Wrapper"},"align":"full","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:post-content {"lock":{"move":true,"remove":true},"layout":{"type":"constrained","justifyContent":"center"}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"var:preset|spacing|large","metadata":{"name":"L"}} -->
<div style="height:var(--wp--preset--spacing--large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer"} /--></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->