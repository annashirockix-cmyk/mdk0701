<?php
/**
 * Title: home
 * Slug: primarium/home
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

<!-- wp:column {"verticalAlignment":"top","width":"75%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:75%"><!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:group {"metadata":{"name":"Intro"},"style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group" style="padding-right:0;padding-left:0"><!-- wp:paragraph -->
<p><?php esc_html_e('I started writing because I was afraid of how easily thoughts would disappear. Not the important—but the small ones. How light shifts when I leave a room. The sound of a page turning in the night.', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php esc_html_e('Small observations. They don’t ask to be understood. Only to be recorded and maybe read, slowly.', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"var:preset|spacing|small","metadata":{"name":"S"}} -->
<div style="height:var(--wp--preset--spacing--small)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph -->
<p><?php esc_html_e('— Lucía M.', 'primarium');?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Social Icons Wrapper"},"style":{"dimensions":{"minHeight":"32px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group" style="min-height:32px"><!-- wp:social-links {"size":"has-normal-icon-size","className":"is-style-logos-only"} -->
<ul class="wp-block-social-links has-normal-icon-size is-style-logos-only"><!-- wp:social-link {"url":"#","service":"linkedin"} /-->

<!-- wp:social-link {"url":"#","service":"mastodon"} /-->

<!-- wp:social-link {"url":"#","service":"bluesky"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"var:preset|spacing|x-large","metadata":{"name":"XL"}} -->
<div style="height:var(--wp--preset--spacing--x-large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns {"align":"full","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|regular","left":"9px"}}}} -->
<div class="wp-block-columns alignfull"><!-- wp:column {"verticalAlignment":"top","width":"75%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="padding-right:0;padding-left:0;flex-basis:75%"><!-- wp:group {"metadata":{"name":"Blog Wrapper"},"align":"wide","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":"0","padding":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignwide" style="margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0"><!-- wp:query {"queryId":0,"query":{"perPage":1,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"ignore","inherit":false,"taxQuery":null,"parents":[]},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"layout":{"type":"default"}} -->
<!-- wp:columns {"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":{"top":"var:preset|spacing|x-small","left":"var:preset|spacing|x-small"}}}} -->
<div class="wp-block-columns" style="margin-top:0;margin-bottom:0"><!-- wp:column {"width":""} -->
<div class="wp-block-column"></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"var:preset|spacing|32"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-title {"level":1,"isLink":true,"style":{"spacing":{"margin":{"top":"-18px","bottom":"0"}}}} /-->

<!-- wp:spacer {"height":"var:preset|spacing|x-small","metadata":{"name":"XS"}} -->
<div style="height:var(--wp--preset--spacing--x-small)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"metadata":{"name":"Date Wrapper"},"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php esc_html_e('↳', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"datetime":"2026-01-19T14:30:35.615Z","format":"M j","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"date"}}}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-excerpt {"moreText":"","showMoreOnNewLine":false,"excerptLength":25} /-->

<!-- wp:read-more {"content":"≻","style":{"spacing":{"padding":{"top":"0","bottom":"0"},"margin":{"top":"0","bottom":"0"}}}} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->

<!-- wp:spacer {"height":"var:preset|spacing|x-large","metadata":{"name":"L"}} -->
<div style="height:var(--wp--preset--spacing--x-large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:query {"queryId":0,"query":{"perPage":1,"pages":0,"offset":"1","postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"ignore","inherit":false,"taxQuery":null,"parents":[]},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"layout":{"type":"default"}} -->
<!-- wp:columns {"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":{"top":"var:preset|spacing|x-small","left":"var:preset|spacing|x-small"}}}} -->
<div class="wp-block-columns" style="margin-top:0;margin-bottom:0"><!-- wp:column {"width":"","style":{"spacing":{"blockGap":"var:preset|spacing|32"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-title {"isLink":true,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"typography":{"textTransform":"uppercase"}}} /-->

<!-- wp:spacer {"height":"var:preset|spacing|x-small","metadata":{"name":"XS"}} -->
<div style="height:var(--wp--preset--spacing--x-small)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"metadata":{"name":"Date Wrapper"},"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php esc_html_e('↳', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"datetime":"2026-01-19T14:30:35.615Z","format":"M j","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"date"}}}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"5%"} -->
<div class="wp-block-column" style="flex-basis:5%"></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-excerpt {"moreText":"","showMoreOnNewLine":false,"excerptLength":25} /-->

<!-- wp:read-more {"content":"≻","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"large"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->

<!-- wp:spacer {"height":"var:preset|spacing|x-large","metadata":{"name":"XL"}} -->
<div style="height:var(--wp--preset--spacing--x-large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:query {"queryId":0,"query":{"perPage":1,"pages":0,"offset":"2","postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"ignore","inherit":false,"taxQuery":null,"parents":[]},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"layout":{"type":"default"}} -->
<!-- wp:columns {"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":{"top":"var:preset|spacing|x-small","left":"var:preset|spacing|x-small"}}}} -->
<div class="wp-block-columns" style="margin-top:0;margin-bottom:0"><!-- wp:column {"width":""} -->
<div class="wp-block-column"></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"var:preset|spacing|32"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-title {"level":1,"isLink":true,"style":{"spacing":{"margin":{"top":"-18px","bottom":"0"}}}} /-->

<!-- wp:spacer {"height":"var:preset|spacing|x-small","metadata":{"name":"XS"}} -->
<div style="height:var(--wp--preset--spacing--x-small)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"metadata":{"name":"Date Wrapper"},"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php esc_html_e('↳', 'primarium');?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"datetime":"2026-01-19T14:30:35.615Z","format":"M j","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"date"}}}},"className":"wp-block-post-date__modified-date"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column"><!-- wp:post-excerpt {"moreText":"","showMoreOnNewLine":false,"excerptLength":25} /-->

<!-- wp:read-more {"content":"≻","fontSize":"large"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:post-template --></div>
<!-- /wp:query --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"stretch","width":"25%","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-column is-vertically-aligned-stretch" style="padding-right:0;padding-left:0;flex-basis:25%"><!-- wp:group {"metadata":{"name":"Illustration Wrapper"},"style":{"spacing":{"blockGap":"var:preset|spacing|large"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"space-between"}} -->
<div class="wp-block-group"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","align":"left","style":{"layout":{"selfStretch":"fit","flexSize":null},"spacing":{"margin":{"right":"var:preset|spacing|large","left":"var:preset|spacing|large"}}}} -->
<figure class="wp-block-image alignleft size-full" style="margin-right:var(--wp--preset--spacing--large);margin-left:var(--wp--preset--spacing--large)"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/primarium--opendoodle-index-a.png" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"full","linkDestination":"none","align":"left","style":{"layout":{"selfStretch":"fit","flexSize":null},"spacing":{"margin":{"right":"var:preset|spacing|x-large","left":"var:preset|spacing|x-large"}}}} -->
<figure class="wp-block-image alignleft size-full" style="margin-right:var(--wp--preset--spacing--x-large);margin-left:var(--wp--preset--spacing--x-large)"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/primarium--opendoodle-dots.png" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"full","linkDestination":"none","align":"left"} -->
<figure class="wp-block-image alignleft size-full"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/primarium--opendoodle-index-b.png" alt=""/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":"var:preset|spacing|x-large","metadata":{"name":"XL"}} -->
<div style="height:var(--wp--preset--spacing--x-large)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer"} /--></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->