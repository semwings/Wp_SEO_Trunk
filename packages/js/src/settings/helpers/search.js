/* eslint-disable camelcase */
import { __, sprintf } from "@wordpress/i18n";
import { reduce, times, omit } from "lodash";

/**
 * @param {Object} postType The post type.
 * @returns {Object} The search index for the post type.
 */
export const createPostTypeSearchIndex = ( { name, label, route, hasArchive } ) => ( {
	[ `title-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-title-${ name }`,
		fieldLabel: __( "SEO title", "wordpress-seo" ),
		keywords: [],
	},
	[ `metadesc-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-metadesc-${ name }`,
		fieldLabel: __( "Meta description", "wordpress-seo" ),
		keywords: [],
	},
	[ `noindex-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-noindex-${ name }`,
		fieldLabel: sprintf(
			// translators: %1$s expands to the post type plural, e.g. Posts.
			__( "Show %1$s in search results", "wordpress-seo" ),
			label
		),
		keywords: [],
	},
	[ `display-metabox-pt-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-display-metabox-pt-${ name }`,
		fieldLabel: __( "Enable SEO controls and assessments", "wordpress-seo" ),
		keywords: [],
	},
	[ `schema-page-type-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-schema-page-type-${ name }`,
		fieldLabel: __( "Page type", "wordpress-seo" ),
		keywords: [],
	},
	[ `schema-article-type-${ name }` ]: {
		route: `/post-type/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-schema-article-type-${ name }`,
		fieldLabel: __( "Article type", "wordpress-seo" ),
		keywords: [],
	},
	...( name !== "attachment" && {
		[ `social-title-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-social-title-${ name }`,
			fieldLabel: __( "Social title", "wordpress-seo" ),
			keywords: [],
		},
		[ `social-description-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-social-description-${ name }`,
			fieldLabel: __( "Social description", "wordpress-seo" ),
			keywords: [],
		},
		[ `social-image-id-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `button-wpseo_titles-social-image-${ name }-preview`,
			fieldLabel: __( "Social image", "wordpress-seo" ),
			keywords: [],
		},
	} ),
	...( hasArchive && {
		[ `title-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-title-ptarchive-${ name }`,
			fieldLabel: __( "Archive SEO title", "wordpress-seo" ),
			keywords: [],
		},
		[ `metadesc-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-metadesc-ptarchive-${ name }`,
			fieldLabel: __( "Archive meta description", "wordpress-seo" ),
			keywords: [],
		},
		[ `bctitle-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-bctitle-ptarchive-${ name }`,
			fieldLabel: __( "Archive breadcrumbs title", "wordpress-seo" ),
			keywords: [],
		},
		[ `noindex-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-noindex-ptarchive-${ name }`,
			fieldLabel: sprintf(
				// translators: %1$s expands to the post type plural, e.g. Posts.
				__( "Show the archive for %1$s in search results", "wordpress-seo" ),
				label
			),
			keywords: [],
		},
		[ `social-title-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-social-title-ptarchive-${ name }`,
			fieldLabel: __( "Archive social title", "wordpress-seo" ),
			keywords: [],
		},
		[ `social-description-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `input-wpseo_titles-social-description-ptarchive-${ name }`,
			fieldLabel: __( "Archive social description", "wordpress-seo" ),
			keywords: [],
		},
		[ `social-image-id-ptarchive-${ name }` ]: {
			route: `/post-type/${ route }`,
			routeLabel: label,
			fieldId: `button-wpseo_titles-social-image-ptarchive-${ name }-preview`,
			fieldLabel: __( "Archive social image", "wordpress-seo" ),
			keywords: [],
		},
	} ),
} );

/**
 * @param {Object} taxonomy The taxonomy.
 * @returns {Object} The search index for the taxonomy.
 */
export const createTaxonomySearchIndex = ( { name, label, route } ) => ( {
	[ `title-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-title-tax-${ name }`,
		fieldLabel: __( "SEO title", "wordpress-seo" ),
		keywords: [],
	},
	[ `metadesc-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-metadesc-tax-${ name }`,
		fieldLabel: __( "Meta description", "wordpress-seo" ),
		keywords: [],
	},
	[ `display-metabox-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-display-metabox-tax-${ name }`,
		fieldLabel: sprintf(
			/* translators: %1$s expands to Yoast SEO. %2$s expands to the taxonomy plural, e.g. Categories. */
			__( "Enable %1$s for %2$s", "wordpress-seo" ),
			"Yoast SEO",
			label
		),
		keywords: [],
	},
	[ `display-metabox-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-display-metabox-tax-${ name }`,
		fieldLabel: __( "Enable SEO controls and assessments", "wordpress-seo" ),
		keywords: [],
	},
	[ `noindex-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-noindex-tax-${ name }`,
		fieldLabel: sprintf(
			// translators: %1$s expands to the taxonomy plural, e.g. Categories.
			__( "Show %1$s in search results", "wordpress-seo" ),
			label
		),
		keywords: [],
	},
	[ `social-title-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-social-title-tax-${ name }`,
		fieldLabel: __( "Social title", "wordpress-seo" ),
		keywords: [],
	},
	[ `social-description-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `input-wpseo_titles-social-description-tax-${ name }`,
		fieldLabel: __( "Social description", "wordpress-seo" ),
		keywords: [],
	},
	[ `social-image-id-tax-${ name }` ]: {
		route: `/taxonomy/${ route }`,
		routeLabel: label,
		fieldId: `button-wpseo_titles-social-image-tax-${ name }-preview`,
		fieldLabel: __( "Social image", "wordpress-seo" ),
		keywords: [],
	},
} );

/**
 * @param {Object} postTypes The post types.
 * @param {Object} taxonomies The taxonomies.
 * @returns {Object} The search index.
 */
export const createSearchIndex = ( postTypes, taxonomies ) => ( {
	blogname: {
		route: "/site-basics",
		routeLabel: __( "Site basics", "wordpress-seo" ),
		fieldId: "input-blogname",
		fieldLabel: __( "Site title", "wordpress-seo" ),
		keywords: [],
	},
	blogdescription: {
		route: "/site-basics",
		routeLabel: __( "Site basics", "wordpress-seo" ),
		fieldId: "input-blogdescription",
		fieldLabel: __( "Tagline", "wordpress-seo" ),
		keywords: [],
	},
	wpseo: {
		keyword_analysis_active: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-keyword_analysis_active",
			fieldLabel: __( "SEO analysis", "wordpress-seo" ),
			keywords: [
				__( "Keyword analysis", "wordpress-seo" ),
				__( "This also works", "wordpress-seo" ),
			],
		},
		content_analysis_active: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-content_analysis_active",
			fieldLabel: __( "Readability analysis", "wordpress-seo" ),
			keywords: [],
		},
		inclusive_language_analysis_active: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-inclusive_language_analysis_active",
			fieldLabel: __( "Inclusive language analysis", "wordpress-seo" ),
			keywords: [],
		},
		enable_metabox_insights: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_metabox_insights",
			fieldLabel: __( "Insights", "wordpress-seo" ),
			keywords: [],
		},
		enable_cornerstone_content: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_cornerstone_content",
			fieldLabel: __( "Cornerstone content", "wordpress-seo" ),
			keywords: [],
		},
		enable_text_link_counter: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_text_link_counter",
			fieldLabel: __( "Text link counter", "wordpress-seo" ),
			keywords: [],
		},
		enable_link_suggestions: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_link_suggestions",
			fieldLabel: __( "Link suggestions", "wordpress-seo" ),
			keywords: [],
		},
		enable_enhanced_slack_sharing: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_enhanced_slack_sharing",
			fieldLabel: __( "Slack sharing", "wordpress-seo" ),
			keywords: [],
		},
		enable_admin_bar_menu: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_admin_bar_menu",
			fieldLabel: __( "Admin bar menu", "wordpress-seo" ),
			keywords: [],
		},
		enable_headless_rest_endpoints: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_headless_rest_endpoints",
			fieldLabel: __( "REST API endpoint", "wordpress-seo" ),
			keywords: [],
		},
		enable_xml_sitemap: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_xml_sitemap",
			fieldLabel: __( "XML sitemaps", "wordpress-seo" ),
			keywords: [],
		},
		enable_index_now: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo-enable_index_now",
			fieldLabel: __( "IndexNow", "wordpress-seo" ),
			keywords: [],
		},
		disableadvanced_meta: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "input-wpseo-disableadvanced_meta",
			fieldLabel: __( "Restrict advanced settings for authors", "wordpress-seo" ),
			keywords: [],
		},
		tracking: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "input-wpseo-tracking",
			fieldLabel: __( "Usage tracking", "wordpress-seo" ),
			keywords: [],
		},
		baiduverify: {
			route: "/site-connections",
			routeLabel: __( "Site connections", "wordpress-seo" ),
			fieldId: "input-wpseo-baiduverify",
			fieldLabel: __( "Baidu", "wordpress-seo" ),
			keywords: [],
		},
		googleverify: {
			route: "/site-connections",
			routeLabel: __( "Site connections", "wordpress-seo" ),
			fieldId: "input-wpseo-googleverify",
			fieldLabel: __( "Google", "wordpress-seo" ),
			keywords: [],
		},
		msverify: {
			route: "/site-connections",
			routeLabel: __( "Site connections", "wordpress-seo" ),
			fieldId: "input-wpseo-msverify",
			fieldLabel: __( "Bing", "wordpress-seo" ),
			keywords: [],
		},
		yandexverify: {
			route: "/site-connections",
			routeLabel: __( "Site connections", "wordpress-seo" ),
			fieldId: "input-wpseo-yandexverify",
			fieldLabel: __( "Yandex", "wordpress-seo" ),
			keywords: [],
		},
		remove_shortlinks: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_shortlinks",
			fieldLabel: __( "Shortlinks", "wordpress-seo" ),
			keywords: [],
		},
		remove_rest_api_links: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_rest_api_links",
			fieldLabel: __( "Rest API links", "wordpress-seo" ),
			keywords: [],
		},
		remove_rsd_wlw_links: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_rsd_wlw_links",
			fieldLabel: __( "RSD / WLW links", "wordpress-seo" ),
			keywords: [],
		},
		remove_oembed_links: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_oembed_links",
			fieldLabel: __( "oEmbed links", "wordpress-seo" ),
			keywords: [],
		},
		remove_generator: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_generator",
			fieldLabel: __( "Generator tag", "wordpress-seo" ),
			keywords: [],
		},
		remove_pingback_header: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_pingback_header",
			fieldLabel: __( "Pingback HTTP header", "wordpress-seo" ),
			keywords: [],
		},
		remove_powered_by_header: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_powered_by_header",
			fieldLabel: __( "Powered by HTTP header", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_global: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_global",
			fieldLabel: __( "Global feed", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_global_comments: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_global_comments",
			fieldLabel: __( "Global comment feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_post_comments: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_post_comments",
			fieldLabel: __( "Post comments feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_authors: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_authors",
			fieldLabel: __( "Post authors feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_post_types: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_post_types",
			fieldLabel: __( "Post type feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_categories: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_categories",
			fieldLabel: __( "Category feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_tags: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_tags",
			fieldLabel: __( "Tag feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_custom_taxonomies: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_custom_taxonomies",
			fieldLabel: __( "Custom taxonomy feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_feed_search: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_feed_search",
			fieldLabel: __( "Search results feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_atom_rdf_feeds: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_atom_rdf_feeds",
			fieldLabel: __( "Atom/RDF feeds", "wordpress-seo" ),
			keywords: [],
		},
		remove_emoji_scripts: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-remove_emoji_scripts",
			fieldLabel: __( "Emoji scripts", "wordpress-seo" ),
			keywords: [],
		},
		deny_wp_json_crawling: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-deny_wp_json_crawling",
			fieldLabel: __( "WP-JSON API", "wordpress-seo" ),
			keywords: [],
		},
		search_cleanup: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-search_cleanup",
			fieldLabel: __( "Filter search terms", "wordpress-seo" ),
			keywords: [],
		},
		search_character_limit: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-search_character_limit",
			fieldLabel: __( "Max number of characters to allow in searches", "wordpress-seo" ),
			keywords: [],
		},
		search_cleanup_emoji: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-search_cleanup_emoji",
			fieldLabel: __( "Filter searches with emojis and other special characters", "wordpress-seo" ),
			keywords: [],
		},
		search_cleanup_patterns: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-search_cleanup_patterns",
			fieldLabel: __( "Filter searches with common spam patterns", "wordpress-seo" ),
			keywords: [],
		},
		deny_search_crawling: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-deny_search_crawling",
			fieldLabel: __( "Prevent crawling of internal site search URLs", "wordpress-seo" ),
			keywords: [],
		},
		clean_campaign_tracking_urls: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-clean_campaign_tracking_urls",
			fieldLabel: __( "Google Analytics utm tracking parameters", "wordpress-seo" ),
			keywords: [],
		},
		clean_permalinks: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-clean_permalinks",
			fieldLabel: __( "Unregistered URL parameters", "wordpress-seo" ),
			keywords: [],
		},
		clean_permalinks_extra_variables: {
			route: "/crawl-optimization",
			routeLabel: __( "Crawl optimization", "wordpress-seo" ),
			fieldId: "input-wpseo-clean_permalinks_extra_variables",
			fieldLabel: __( "Additional URL parameters to allow", "wordpress-seo" ),
			keywords: [],
		},
	},
	wpseo_titles: {
		forcerewritetitles: {
			route: "/site-basics",
			routeLabel: __( "Site basics", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-forcerewritetitle",
			fieldLabel: __( "Force rewrite titles", "wordpress-seo" ),
			keywords: [],
		},
		separator: {
			route: "/site-basics",
			routeLabel: __( "Site basics", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-separator-sc-dash",
			fieldLabel: __( "Title separator", "wordpress-seo" ),
			keywords: [],
		},
		company_or_person: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-company_or_person-company",
			fieldLabel: __( "Organization or a person", "wordpress-seo" ),
			keywords: [],
		},
		company_name: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-company_name",
			fieldLabel: __( "Organization name", "wordpress-seo" ),
			keywords: [],
		},
		company_logo_id: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-company_logo-preview",
			fieldLabel: __( "Organization logo", "wordpress-seo" ),
			keywords: [],
		},
		company_or_person_user_id: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-company_or_person_user_id",
			fieldLabel: __( "User", "wordpress-seo" ),
			keywords: [],
		},
		person_logo_id: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-person_logo-preview",
			fieldLabel: __( "Personal logo or avatar", "wordpress-seo" ),
			keywords: [],
		},
		"title-home-wpseo": {
			route: "/homepage",
			routeLabel: __( "Homepage", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-title-home-wpseo",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		"metadesc-home-wpseo": {
			route: "/homepage",
			routeLabel: __( "Homepage", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-metadesc-home-wpseo",
			fieldLabel: __( "Meta description", "wordpress-seo" ),
			keywords: [],
		},
		open_graph_frontpage_image_id: {
			route: "/homepage",
			routeLabel: __( "Homepage", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-open_graph_frontpage_image-preview",
			fieldLabel: __( "Social image", "wordpress-seo" ),
			keywords: [],
		},
		open_graph_frontpage_title: {
			route: "/homepage",
			routeLabel: __( "Homepage", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-open_graph_frontpage_title",
			fieldLabel: __( "Social title", "wordpress-seo" ),
			keywords: [],
		},
		open_graph_frontpage_desc: {
			route: "/homepage",
			routeLabel: __( "Homepage", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-open_graph_frontpage_desc",
			fieldLabel: __( "Social description", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-sep": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-sep",
			fieldLabel: __( "Separator between breadcrumbs", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-home": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-home",
			fieldLabel: __( "Anchor text for the Homepage", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-prefix": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-prefix",
			fieldLabel: __( "Prefix for the breadcrumb path", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-archiveprefix": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-archiveprefix",
			fieldLabel: __( "Prefix for Archive breadcrumbs", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-searchprefix": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-searchprefix",
			fieldLabel: __( "Prefix for Search page breadcrumbs", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-404crumb": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-404crumb",
			fieldLabel: __( "Breadcrumb for 404 page", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-display-blog-page": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-display-blog-page",
			fieldLabel: __( "Show Blog page in breadcrumbs", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-boldlast": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-boldlast",
			fieldLabel: __( "Bold the last page", "wordpress-seo" ),
			keywords: [],
		},
		"breadcrumbs-enable": {
			route: "/breadcrumbs",
			routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-breadcrumbs-enable",
			fieldLabel: __( "Enable breadcrumbs for your theme", "wordpress-seo" ),
			keywords: [],
		},
		...reduce( postTypes, ( acc, postType ) => ( {
			...acc,
			[ `post_types-${ postType.name }-maintax` ]: {
				route: "/breadcrumbs",
				routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
				fieldId: `input-wpseo_titles-post_types-${ postType.name }-maintax`,
				// translators: %1$s expands to the post type plural, e.g. Posts.
				fieldLabel: sprintf( __( "Breadcrumbs for %1$s", "wordpress-seo" ), postType.label ),
				keywords: [],
			},
		} ), {} ),
		...reduce( taxonomies, ( acc, taxonomy ) => ( {
			...acc,
			[ `taxonomy-${ taxonomy.name }-ptparent` ]: {
				route: "/breadcrumbs",
				routeLabel: __( "Breadcrumbs", "wordpress-seo" ),
				fieldId: `input-wpseo_titles-taxonomy-${ taxonomy.name }-ptparent`,
				// translators: %1$s expands to the taxonomy plural, e.g. Categories.
				fieldLabel: sprintf( __( "Breadcrumbs for %1$s", "wordpress-seo" ), taxonomy.label ),
				keywords: [],
			},
		} ), {} ),
		// Author archives
		"disable-author": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-disable-author",
			fieldLabel: __( "Author archives", "wordpress-seo" ),
			keywords: [],
		},
		"noindex-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-noindex-author-wpseo",
			fieldLabel: __( "Show Author archives in search results", "wordpress-seo" ),
			keywords: [],
		},
		"noindex-author-noposts-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-noindex-author-noposts-wpseo",
			fieldLabel: __( "Show archives for authors without posts in search results", "wordpress-seo" ),
			keywords: [],
		},
		"title-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-title-author-wpseo",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		"metadesc-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-metadesc-author-wpseo",
			fieldLabel: __( "Meta description", "wordpress-seo" ),
			keywords: [],
		},
		"social-image-id-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-social-image-author-wpseo-preview",
			fieldLabel: __( "Social image", "wordpress-seo" ),
			keywords: [],
		},
		"social-title-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-title-author-wpseo",
			fieldLabel: __( "Social title", "wordpress-seo" ),
			keywords: [],
		},
		"social-description-author-wpseo": {
			route: "/author-archives",
			routeLabel: __( "Author archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-description-author-wpseo",
			fieldLabel: __( "Social description", "wordpress-seo" ),
			keywords: [],
		},
		// Date archives
		"disable-date": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-disable-date",
			fieldLabel: __( "Date archives", "wordpress-seo" ),
			keywords: [],
		},
		"noindex-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-noindex-archive-wpseo",
			fieldLabel: __( "Show Date archives in search results", "wordpress-seo" ),
			keywords: [],
		},
		"title-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-title-archive-wpseo",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		"metadesc-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-metadesc-archive-wpseo",
			fieldLabel: __( "Meta description", "wordpress-seo" ),
			keywords: [],
		},
		"social-image-id-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-social-image-archive-wpseo-preview",
			fieldLabel: __( "Social image", "wordpress-seo" ),
			keywords: [],
		},
		"social-title-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-title-archive-wpseo",
			fieldLabel: __( "Social title", "wordpress-seo" ),
			keywords: [],
		},
		"social-description-archive-wpseo": {
			route: "/date-archives",
			routeLabel: __( "Date archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-description-archive-wpseo",
			fieldLabel: __( "Social description", "wordpress-seo" ),
			keywords: [],
		},
		// Search pages
		"title-search-wpseo": {
			route: "/search-pages",
			routeLabel: __( "Search pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles.title-search-wpseo",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		// 404 pages
		"title-404-wpseo": {
			route: "/not-found-pages",
			routeLabel: __( "404 pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles.title-404-wpseo",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		// Media pages
		"disable-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-disable-attachment",
			fieldLabel: __( "Media pages", "wordpress-seo" ),
			keywords: [],
		},
		"noindex--attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-noindex-attachment",
			fieldLabel: __( "Show Media pages in search results", "wordpress-seo" ),
			keywords: [],
		},
		"title-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-title-attachment",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		"metadesc-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-metadesc-attachment",
			fieldLabel: __( "Meta description", "wordpress-seo" ),
			keywords: [],
		},
		"schema-page-type-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-schema-page-type-attachment",
			fieldLabel: __( "Page type", "wordpress-seo" ),
			keywords: [],
		},
		"schema-article-type-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-schema-article-type-attachment",
			fieldLabel: __( "Article type", "wordpress-seo" ),
			keywords: [],
		},
		"display-metabox-pt-attachment": {
			route: "/media",
			routeLabel: __( "Media pages", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-display-metabox-pt-attachment",
			fieldLabel: __( "Enable SEO controls and assessments", "wordpress-seo" ),
			keywords: [],
		},
		// Format archives
		"disable-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-disable-post_format",
			fieldLabel: __( "Format-based archives", "wordpress-seo" ),
			keywords: [],
		},
		"noindex-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-noindex-tax-post_format",
			fieldLabel: __( "Show Format archives in search results", "wordpress-seo" ),
			keywords: [],
		},
		"title-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-title-tax-post_format",
			fieldLabel: __( "SEO title", "wordpress-seo" ),
			keywords: [],
		},
		"metadesc-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-metadesc-tax-post_format",
			fieldLabel: __( "Meta description", "wordpress-seo" ),
			keywords: [],
		},
		"social-image-id-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "button-wpseo_titles-social-image-tax-post_format-preview",
			fieldLabel: __( "Social image", "wordpress-seo" ),
			keywords: [],
		},
		"social-title-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-title-tax-post_format",
			fieldLabel: __( "Social title", "wordpress-seo" ),
			keywords: [],
		},
		"social-description-tax-post_format": {
			route: "/format-archives",
			routeLabel: __( "Format archives", "wordpress-seo" ),
			fieldId: "input-wpseo_titles-social-description-tax-post_format",
			fieldLabel: __( "Social description", "wordpress-seo" ),
			keywords: [],
		},
		// RSS
		rssbefore: {
			route: "/rss",
			routeLabel: "RSS",
			fieldId: "input-wpseo_titles-rssbefore",
			fieldLabel: __( "Content to put before each post in the feed", "wordpress-seo" ),
			keywords: [],
		},
		rssafter: {
			route: "/rss",
			routeLabel: "RSS",
			fieldId: "input-wpseo_titles-rssafter",
			fieldLabel: __( "Content to put after each post in the feed", "wordpress-seo" ),
			keywords: [],
		},
		// Post types - Attachments are handled separately above.
		...reduce( omit( postTypes, [ "attachment" ] ), ( acc, postType ) => ( {
			...acc,
			...createPostTypeSearchIndex( postType ),
		} ), {} ),
		// Taxonomies
		...reduce( omit( taxonomies, [ "post_format" ] ), ( acc, taxonomy ) => ( {
			...acc,
			...createTaxonomySearchIndex( taxonomy ),
		} ), {} ),
	},
	wpseo_social: {
		opengraph: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo_social-opengraph",
			fieldLabel: __( "Open Graph data", "wordpress-seo" ),
			keywords: [],
		},
		twitter: {
			route: "/site-features",
			routeLabel: __( "Site features", "wordpress-seo" ),
			fieldId: "card-wpseo_social-twitter",
			fieldLabel: __( "Twitter card data", "wordpress-seo" ),
			keywords: [],
		},
		og_default_image_id: {
			route: "/site-basics",
			routeLabel: __( "Site basics", "wordpress-seo" ),
			fieldId: "button-wpseo_social-og_default_image-preview",
			fieldLabel: __( "Site image", "wordpress-seo" ),
			keywords: [],
		},
		og_default_image: {
			route: "/site-basics",
			routeLabel: __( "Site basics", "wordpress-seo" ),
			fieldId: "button-wpseo_social-og_default_image-preview",
			fieldLabel: __( "Site image", "wordpress-seo" ),
			keywords: [],
		},
		pinterestverify: {
			route: "/site-connections",
			routeLabel: __( "Site connections", "wordpress-seo" ),
			fieldId: "input-wpseo_social-pinterestverify",
			fieldLabel: __( "Pinterest", "wordpress-seo" ),
			keywords: [],
		},
		facebook_site: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-wpseo_social-facebook_site",
			fieldLabel: __( "Organization Facebook", "wordpress-seo" ),
			keywords: [],
		},
		twitter_site: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-wpseo_social-twitter_site",
			fieldLabel: __( "Organization Twitter", "wordpress-seo" ),
			keywords: [],
		},
		other_social_urls: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "fieldset-wpseo_social-other_social_urls",
			fieldLabel: __( "Other social profiles", "wordpress-seo" ),
			keywords: [],
			// Add 25 dummy other social URL search entries for when users add them.
			...times( 25, index => ( {
				route: "/site-representation",
				routeLabel: __( "Site representation", "wordpress-seo" ),
				fieldId: `input-wpseo_social-other_social_urls-${ index }`,
				// translators: %1$s exapnds to array index + 1.
				fieldLabel: sprintf( __( "Other profile %1$s", "wordpress-seo" ), index + 1 ),
			} ) ),
		},
	},
	person_social_profiles: {
		facebook: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-facebook",
			fieldLabel: __( "Person Facebook", "wordpress-seo" ),
			keywords: [],
		},
		instagram: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-instagram",
			fieldLabel: __( "Person Instagram", "wordpress-seo" ),
			keywords: [],
		},
		linkedin: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-linkedin",
			fieldLabel: __( "Person LinkedIn", "wordpress-seo" ),
			keywords: [],
		},
		myspace: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-myspace",
			fieldLabel: __( "Person MySpace", "wordpress-seo" ),
			keywords: [],
		},
		pinterest: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-pinterest",
			fieldLabel: __( "Person Pinterest", "wordpress-seo" ),
			keywords: [],
		},
		soundcloud: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-soundcloud",
			fieldLabel: __( "Person SoundCloud", "wordpress-seo" ),
			keywords: [],
		},
		tumblr: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-tumblr",
			fieldLabel: __( "Person Tumblr", "wordpress-seo" ),
			keywords: [],
		},
		twitter: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-twitter",
			fieldLabel: __( "Person Twitter", "wordpress-seo" ),
			keywords: [],
		},
		youtube: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-youtube",
			fieldLabel: __( "Person YouTube", "wordpress-seo" ),
			keywords: [],
		},
		wikipedia: {
			route: "/site-representation",
			routeLabel: __( "Site representation", "wordpress-seo" ),
			fieldId: "input-person_social_profiles-wikipedia",
			fieldLabel: __( "Person Wikipedia", "wordpress-seo" ),
			keywords: [],
		},
	},
} );
