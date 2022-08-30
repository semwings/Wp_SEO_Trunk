<?php

namespace Yoast\WP\SEO\Values\Schema;

/**
 * Class Iage
 *
 * Value object for a schema Image
 */
class Image {

	/**
	 * The source of the image.
	 *
	 * @var string
	 */
	private $src;

	/**
	 * The ID of the image.
	 *
	 * @var int|null
	 */
	private $id;

	/**
	 * Construct an Image.
	 *
	 * @param string   $src The source of the image.
	 * @param int|null $id The ID of the image.
	 */
	public function __construct( $src, $id = null ) {
		$this->src = $src;
		$this->id  = $id;
	}

	/**
	 * Get the src attribute.
	 *
	 * @return string
	 */
	public function get_src() {
		return $this->src;
	}

	/**
	 * Set the src attribute.
	 *
	 * @param string $src The new src attribute.
	 * @return void
	 */
	public function set_src( $src ) {
		$this->src = $src;
	}

	/**
	 * Get the id attribute.
	 *
	 * @return int|null
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Set the id attribute.
	 *
	 * @param int $id The new id attribute.
	 * @return void
	 */
	public function set_id( $id ) {
		$this->id = $id;
	}

	/**
	 * Check whether this image has an id set.
	 *
	 * @return bool True when this image has an id set.
	 */
	public function has_id() {
		return isset( $this->id );
	}
}
