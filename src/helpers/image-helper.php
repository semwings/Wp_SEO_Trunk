<?php

namespace Yoast\WP\SEO\Helpers;

use DOMDocument;
use WP_Post;
use WP_Query;
use WPSEO_Image_Utils;
use Yoast\WP\SEO\Models\SEO_Links;
use Yoast\WP\SEO\Repositories\Indexable_Repository;
use Yoast\WP\SEO\Values\Schema\Image;

/**
 * A helper object for images.
 */
class Image_Helper {

	/**
	 * Image types that are supported by Open Graph.
	 *
	 * @var array
	 */
	protected static $valid_image_types = [ 'image/jpeg', 'image/gif', 'image/png', 'image/webp' ];

	/**
	 * Image extensions that are supported by Open Graph.
	 *
	 * @var array
	 */
	protected static $valid_image_extensions = [ 'jpeg', 'jpg', 'gif', 'png', 'webp' ];

	/**
	 * Represents the indexables repository.
	 *
	 * @var Indexable_Repository
	 */
	protected $indexable_repository;

	/**
	 * The options helper.
	 *
	 * @var Options_Helper
	 */
	private $options_helper;

	/**
	 * The URL helper.
	 *
	 * @var Url_Helper
	 */
	private $url_helper;

	/**
	 * Image_Helper constructor.
	 *
	 * @param Indexable_Repository $indexable_repository The indexable repository.
	 * @param Options_Helper       $options              The options helper.
	 * @param Url_Helper           $url_helper           The URL helper.
	 */
	public function __construct(
		Indexable_Repository $indexable_repository,
		Options_Helper $options,
		Url_Helper $url_helper
	) {
		$this->indexable_repository = $indexable_repository;
		$this->options_helper       = $options;
		$this->url_helper           = $url_helper;
	}

	/**
	 * Determines whether the wanted attachment is considered valid.
	 *
	 * @param int $attachment_id The attachment ID to get the attachment by.
	 *
	 * @return bool Whether the attachment is valid.
	 */
	public function is_valid_attachment( $attachment_id ) {
		if ( ! \wp_attachment_is_image( $attachment_id ) ) {
			return false;
		}

		$post_mime_type = \get_post_mime_type( $attachment_id );
		if ( $post_mime_type === false ) {
			return false;
		}

		return $this->is_valid_image_type( $post_mime_type );
	}

	/**
	 * Checks if the given extension is a valid extension
	 *
	 * @param string $image_extension The image extension.
	 *
	 * @return bool True when valid.
	 */
	public function is_extension_valid( $image_extension ) {
		return \in_array( $image_extension, static::$valid_image_extensions, true );
	}

	/**
	 * Determines whether the passed mime type is a valid image type.
	 *
	 * @param string $mime_type The detected mime type.
	 *
	 * @return bool Whether the attachment is a valid image type.
	 */
	public function is_valid_image_type( $mime_type ) {
		return \in_array( $mime_type, static::$valid_image_types, true );
	}

	/**
	 * Retrieves the image source for an attachment.
	 *
	 * @param int    $attachment_id The attachment.
	 * @param string $image_size    The image size to retrieve.
	 *
	 * @return string The image url or an empty string when not found.
	 */
	public function get_attachment_image_source( $attachment_id, $image_size = 'full' ) {
		$attachment = \wp_get_attachment_image_src( $attachment_id, $image_size );

		if ( ! $attachment ) {
			return '';
		}

		return $attachment[0];
	}

	/**
	 * Retrieves the ID of the featured image.
	 *
	 * @param int $post_id The post id to get featured image id for.
	 *
	 * @return int|bool ID when found, false when not.
	 */
	public function get_featured_image_id( $post_id ) {
		if ( ! \has_post_thumbnail( $post_id ) ) {
			return false;
		}

		return \get_post_thumbnail_id( $post_id );
	}

	/**
	 * Gets the image url from the content.
	 *
	 * @param int $post_id The post id to extract the images from.
	 *
	 * @return string The image url or an empty string when not found.
	 */
	public function get_post_content_image( $post_id ) {
		$image_url = $this->get_first_usable_content_image_for_post( $post_id );

		if ( $image_url === null ) {
			return '';
		}

		return $image_url;
	}

	/**
	 * Gets the first image url of a gallery.
	 *
	 * @param int $post_id Post ID to use.
	 *
	 * @return string The image url or an empty string when not found.
	 */
	public function get_gallery_image( $post_id ) {
		$post = \get_post( $post_id );
		if ( \strpos( $post->post_content, '[gallery' ) === false ) {
			return '';
		}

		$images = \get_post_gallery_images( $post );
		if ( empty( $images ) ) {
			return '';
		}

		return \reset( $images );
	}

	/**
	 * Gets the image url from the term content.
	 *
	 * @param int $term_id The term id to extract the images from.
	 *
	 * @return string The image url or an empty string when not found.
	 */
	public function get_term_content_image( $term_id ) {
		$image_url = $this->get_first_content_image_for_term( $term_id );

		if ( $image_url === null ) {
			return '';
		}

		return $image_url;
	}

	/**
	 * Retrieves the caption for an attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 *
	 * @return string The caption when found, empty string when no caption is found.
	 */
	public function get_caption( $attachment_id ) {
		$caption = \wp_get_attachment_caption( $attachment_id );
		if ( ! empty( $caption ) ) {
			return $caption;
		}

		$caption = \get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
		if ( ! empty( $caption ) ) {
			return $caption;
		}

		return '';
	}

	/**
	 * Retrieves the attachment metadata.
	 *
	 * @param int $attachment_id Attachment ID.
	 *
	 * @return array The metadata, empty array when no metadata is found.
	 */
	public function get_metadata( $attachment_id ) {
		$metadata = \wp_get_attachment_metadata( $attachment_id );
		if ( ! $metadata || ! \is_array( $metadata ) ) {
			return [];
		}

		return $metadata;
	}

	/**
	 * Retrieves the attachment image url.
	 *
	 * @param int          $attachment_id Attachment ID.
	 * @param string|array $size          The size to get.
	 *
	 * @return string The url when found, empty string otherwise.
	 */
	public function get_attachment_image_url( $attachment_id, $size ) {
		$url = \wp_get_attachment_image_url( $attachment_id, $size );
		if ( ! $url ) {
			return '';
		}

		return $url;
	}

	/**
	 * Find the right version of an image based on size.
	 *
	 * @codeCoverageIgnore - We have to write test when this method contains own code.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $size          Size name.
	 *
	 * @return array|false Returns an array with image data on success, false on failure.
	 */
	public function get_image( $attachment_id, $size ) {
		return WPSEO_Image_Utils::get_image( $attachment_id, $size );
	}

	/**
	 * Retrieves the best attachment variation for the given attachment.
	 *
	 * @codeCoverageIgnore - We have to write test when this method contains own code.
	 *
	 * @param int $attachment_id The attachment id.
	 *
	 * @return bool|string The attachment url or false when no variations found.
	 */
	public function get_best_attachment_variation( $attachment_id ) {
		$variations = WPSEO_Image_Utils::get_variations( $attachment_id );
		$variations = WPSEO_Image_Utils::filter_usable_file_size( $variations );

		// If we are left without variations, there is no valid variation for this attachment.
		if ( empty( $variations ) ) {
			return false;
		}

		// The variations are ordered so the first variations is by definition the best one.
		return \reset( $variations );
	}

	/**
	 * Find an attachment ID for a given URL.
	 *
	 * @param string $url The URL to find the attachment for.
	 *
	 * @return int The found attachment ID, or 0 if none was found.
	 */
	public function get_attachment_by_url( $url ) {
		// Strip out the size part of an image URL.
		$url = \preg_replace( '/(.*)-\d+x\d+\.(jpeg|jpg|png|gif)$/', '$1.$2', $url );

		// Don't try to do this for external URLs.
		if ( $this->url_helper->get_link_type( $url ) === SEO_Links::TYPE_EXTERNAL ) {
			return 0;
		}

		$indexable = $this->indexable_repository->find_by_permalink( $url );

		if ( $indexable && $indexable->object_type === 'post' && $indexable->object_sub_type === 'attachment' ) {
			return $indexable->object_id;
		}

		$post_id = WPSEO_Image_Utils::get_attachment_by_url( $url );

		if ( $post_id !== 0 ) {
			// Find the indexable, this triggers creating it so it can be found next time.
			$this->indexable_repository->find_by_id_and_type( $post_id, 'post' );
		}

		return $post_id;
	}

	/**
	 * Retrieves an attachment ID for an image uploaded in the settings.
	 *
	 * Due to self::get_attachment_by_url returning 0 instead of false.
	 * 0 is also a possibility when no ID is available.
	 *
	 * @codeCoverageIgnore - We have to write test when this method contains own code.
	 *
	 * @param string $setting The setting the image is stored in.
	 *
	 * @return int|bool The attachment id, or false or 0 if no ID is available.
	 */
	public function get_attachment_id_from_settings( $setting ) {
		return WPSEO_Image_Utils::get_attachment_id_from_settings( $setting );
	}

	/**
	 * Based on and image ID return array with the best variation of that image. If it's not saved to the DB,  save it to an option.
	 *
	 * @param string $setting The setting name. Should be company or person.
	 *
	 * @return array|bool Array with image details when the image is found, boolean when it's not found.
	 */
	public function get_attachment_meta_from_settings( $setting ) {
		$image_meta = $this->options_helper->get( $setting . '_meta', false );
		if ( ! $image_meta ) {
			$image_id = $this->options_helper->get( $setting . '_id', false );
			if ( $image_id ) {
				// There is not an option to put a URL in an image field in the settings anymore, only to upload it through the media manager.
				// This means an attachment always exists, so doing this is only needed once.
				$image_meta = $this->get_best_attachment_variation( $image_id );
				if ( $image_meta ) {
					$this->options_helper->set( $setting . '_meta', $image_meta );
				}
			}
		}

		return $image_meta;
	}

	/**
	 * Retrieves the first usable content image for a post.
	 *
	 * @codeCoverageIgnore - We have to write test when this method contains own code.
	 *
	 * @param int $post_id The post id to extract the images from.
	 *
	 * @return string|null
	 */
	protected function get_first_usable_content_image_for_post( $post_id ) {
		return WPSEO_Image_Utils::get_first_usable_content_image_for_post( $post_id );
	}

	/**
	 * Gets the term's first usable content image. Null if none is available.
	 *
	 * @codeCoverageIgnore - We have to write test when this method contains own code.
	 *
	 * @param int $term_id The term id.
	 *
	 * @return string|null The image URL.
	 */
	protected function get_first_content_image_for_term( $term_id ) {
		return WPSEO_Image_Utils::get_first_content_image_for_term( $term_id );
	}

	/**
	 * Get the image width and height from the image src attribute (for WordPress images).
	 *
	 * @param string $src The image src attribute.
	 * @return array|null Either an array with a 'width' and 'height' key or null when no image size was found.
	 */
	protected function get_image_size( $src ) {
		$matches = [];
		$match   = \preg_match( '/^.+-(?<width>\d+)x(?<height>\d+)\.(?<extension>[^.]+)$/', $src, $matches );

		if ( $match !== 1 ) {
			return null;
		}

		return [
			'width'  => intval( $matches['width'] ),
			'height' => intval( $matches['height'] ),
		];
	}

	/**
	 * Generate an Image object from the id of an image.
	 *
	 * @param int $id The ID of the image.
	 * @return Image|null The generated Image object.
	 */
	protected function create_image_object_from_id( $id ) {
		$src = $this->get_attachment_image_url( $id, 'full' );
		return $this->create_image_object_from_source( $src );
	}

	/**
	 * Generate an Image object from the source of an image.
	 *
	 * @param string $src The src attribute of an img tag.
	 * @return Image|null The generated Image object.
	 */
	protected function create_image_object_from_source( $src ) {
		$width  = null;
		$height = null;

		// Extract image ID.
		$id = $this->get_attachment_by_url( $src );

		if ( $id !== 0 ) {
			// Extract image size if present in src.
			$image_size = $this->get_image_size( $src );
			if ( ! \is_null( $image_size ) ) {
				$width  = $image_size['width'];
				$height = $image_size['height'];
			}

			$query_params = \wp_parse_url( $src, PHP_URL_QUERY );
			$size         = ! \is_null( $width ) && ! \is_null( $height ) ? [ $width, $height ] : 'full';
			$src          = $this->get_attachment_image_url( $id, $size );

			if ( empty( $src ) ) {
				return null;
			}

			if ( $query_params ) {
				$src = $src . '?' . $query_params;
			}
		}

		$src = $this->url_helper->ensure_absolute_url( $src );
		if ( $src !== \esc_url( $src, null, 'attribute' ) ) {
			return null;
		}

		return new Image( $src, $id, $width, $height );
	}

	/**
	 * Parse `<img />` tags in content.
	 *
	 * @param string $content Content string to parse.
	 *
	 * @return Image[]
	 */
	public function get_images_from_post_content( $content ) {
		$images = [];

		if ( ! class_exists( 'DOMDocument' ) ) {
			return $images;
		}

		if ( empty( $content ) ) {
			return $images;
		}

		// Prevent DOMDocument from bubbling warnings about invalid HTML.
		libxml_use_internal_errors( true );

		$charset = \esc_attr( \get_bloginfo( 'charset' ) );

		$post_dom = new DOMDocument();
		$post_dom->loadHTML( '<?xml encoding="' . $charset . '">' . $content );

		// Clear the errors, so they don't get kept in memory.
		libxml_clear_errors();

		foreach ( $post_dom->getElementsByTagName( 'img' ) as $img ) {
			$src = $img->getAttribute( 'src' );

			if ( empty( $src ) ) {
				continue;
			}

			$image_obj = $this->create_image_object_from_source( $src );

			if ( ! \is_null( $image_obj ) ) {
				$images[] = $image_obj;
			}
		}

		$gallery_images = $this->get_gallery_images_from_post_content( $content );

		foreach ( $gallery_images as $image ) {
			$image_src = $this->get_attachment_image_url( $image->ID, 'full' );
			if ( ! \is_null( $image_src ) ) {
				$image_obj = $this->create_image_object_from_source( $image_src );
				if ( ! \is_null( $image_obj ) ) {
					$images[] = $image_obj;
				}
			}
		}

		$gutenberg_images = $this->get_images_from_gutenberg_blocks( $content );
		return \array_merge( $images, $gutenberg_images );
	}

	/**
	 * Generate an Image object from a site logo block.
	 *
	 * @param array $block The site logo block.
	 * @return Image|null An Image object generated from the site logo block.
	 */
	protected function get_image_from_site_logo_block( $block ) {
		if ( $block['blockName'] !== 'core/site-logo' ) {
			return null;
		}
		$custom_logo_id = \intval( \get_theme_mod( 'custom_logo' ) );
		return $this->create_image_object_from_id( $custom_logo_id );
	}

	/**
	 * Get site logo images from the post content.
	 *
	 * @param string $content The post content.
	 * @return Image[] Found site logo blocks in the blocks array.
	 */
	protected function get_images_from_gutenberg_blocks( $content ) {
		$site_logos = [];
		$blocks     = \parse_blocks( $content );
		foreach ( $blocks as $block ) {
			if ( $block['blockName'] === 'core/site-logo' ) {
				$image_obj      = $this->get_image_from_site_logo_block( $block );
				if ( ! \is_null( $image_obj ) ) {
					$site_logos[] = $image_obj;
				}
			}
		}
		return $site_logos;
	}

	/**
	 * Parse gallery shortcodes in a given content.
	 *
	 * @param string $content Content string.
	 * @param int    $post_id Optional. ID of post being parsed.
	 *
	 * @return WP_Post[] Set of attachment objects.
	 */
	public function get_gallery_images_from_post_content( $content, $post_id = 0 ) {
		$attachments = [];
		$galleries   = $this->get_content_galleries( $content );

		foreach ( $galleries as $gallery ) {

			$id = $post_id;

			if ( ! empty( $gallery['id'] ) ) {
				$id = intval( $gallery['id'] );
			}

			// Forked from core gallery_shortcode() to have exact same logic. R.
			if ( ! empty( $gallery['ids'] ) ) {
				$gallery['include'] = $gallery['ids'];
			}

			$gallery_attachments = $this->get_gallery_attachments( $id, $gallery );

			$attachments = \array_merge( $attachments, $gallery_attachments );
		}

		return \array_unique( $attachments, SORT_REGULAR );
	}

	/**
	 * Retrieves galleries from the passed content.
	 *
	 * Forked from core to skip executing shortcodes for performance.
	 *
	 * @param string $content Content to parse for shortcodes.
	 *
	 * @return array A list of arrays, each containing gallery data.
	 */
	protected function get_content_galleries( $content ) {
		$galleries = [];

		if ( ! preg_match_all( '/' . get_shortcode_regex( [ 'gallery' ] ) . '/s', $content, $matches, PREG_SET_ORDER ) ) {
			return $galleries;
		}

		foreach ( $matches as $shortcode ) {

			$attributes = shortcode_parse_atts( $shortcode[3] );

			if ( $attributes === '' ) { // Valid shortcode without any attributes. R.
				$attributes = [];
			}

			$galleries[] = $attributes;
		}

		return $galleries;
	}

	/**
	 * Returns the attachments for a gallery.
	 *
	 * @param int   $id      The post ID.
	 * @param array $gallery The gallery config.
	 *
	 * @return array The selected attachments.
	 */
	protected function get_gallery_attachments( $id, $gallery ) {

		// When there are attachments to include.
		if ( ! empty( $gallery['include'] ) ) {
			return $this->get_gallery_attachments_for_included( $gallery['include'] );
		}

		// When $id is empty, just return empty array.
		if ( empty( $id ) ) {
			return [];
		}

		return $this->get_gallery_attachments_for_parent( $id, $gallery );
	}

	/**
	 * Returns the attachments for the given ID.
	 *
	 * @param int   $id      The post ID.
	 * @param array $gallery The gallery config.
	 *
	 * @return array The selected attachments.
	 */
	protected function get_gallery_attachments_for_parent( $id, $gallery ) {
		$query = [
			'posts_per_page' => -1,
			'post_parent'    => $id,
		];

		// When there are posts that should be excluded from result set.
		if ( ! empty( $gallery['exclude'] ) ) {
			$query['post__not_in'] = wp_parse_id_list( $gallery['exclude'] );
		}

		return $this->get_attachments( $query );
	}

	/**
	 * Returns an array with attachments for the post IDs that will be included.
	 *
	 * @param array $included_ids Array with IDs to include.
	 *
	 * @return array The found attachments.
	 */
	protected function get_gallery_attachments_for_included( $included_ids ) {
		$ids_to_include = wp_parse_id_list( $included_ids );
		$attachments    = $this->get_attachments(
			[
				'posts_per_page' => count( $ids_to_include ),
				'post__in'       => $ids_to_include,
			]
		);

		$gallery_attachments = [];
		foreach ( $attachments as $key => $val ) {
			$gallery_attachments[ $val->ID ] = $val;
		}

		return $gallery_attachments;
	}

	/**
	 * Returns the attachments.
	 *
	 * @param array $args Array with query args.
	 *
	 * @return array The found attachments.
	 */
	protected function get_attachments( $args ) {
		$default_args = [
			'post_status'         => 'inherit',
			'post_type'           => 'attachment',
			'post_mime_type'      => 'image',

			// Defaults taken from function get_posts.
			'orderby'             => 'date',
			'order'               => 'DESC',
			'meta_key'            => '',
			'meta_value'          => '',
			'suppress_filters'    => true,
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		];

		$args = wp_parse_args( $args, $default_args );

		$get_attachments = new WP_Query();
		return $get_attachments->query( $args );
	}

	/**
	 * Get attached image URL with filters applied. Adapted from core (wp_get_attachment_image_url) for speed. Used for the sitemap image parser.
	 *
	 * @param int $post_id ID of the post.
	 *
	 * @return string|null
	 */
	public function image_url( $post_id ) {
		$uploads = \wp_upload_dir();

		if ( $uploads['error'] !== false ) {
			return null;
		}

		$file = \get_post_meta( $post_id, '_wp_attached_file', true );

		if ( empty( $file ) ) {
			return null;
		}

		// Check that the upload base exists in the file location.
		if ( \strpos( $file, $uploads['basedir'] ) === 0 ) {
			return \str_replace( $uploads['basedir'], $uploads['baseurl'], $file );
		}
		elseif ( \strpos( $file, 'wp-content/uploads' ) !== false ) {
			return $uploads['baseurl'] . \substr( $file, ( \strpos( $file, 'wp-content/uploads' ) + 18 ) );
		}
		else {
			// It's a newly uploaded file, therefore $file is relative to the baseurl.
			return $uploads['baseurl'] . '/' . $file;
		}
	}
}
