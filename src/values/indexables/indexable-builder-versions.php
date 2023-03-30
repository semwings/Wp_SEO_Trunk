<?php

namespace Yoast\WP\SEO\Values\Indexables;

/**
 * Class Indexable_Builder_Versions
 */
class Indexable_Builder_Versions {

	const DEFAULT_INDEXABLE_BUILDER_VERSION = 1;

	/**
	 * The list of indexable builder versions defined by Yoast SEO Free.
	 * If the key is not in this list, the indexable type will not be managed.
	 * These numbers should be increased if one of the builders implements a new feature.
	 *
	 * Whenever a version is increased, we must delete the indexation transients on an upgrade routine, so that Indexing_Helper's `is_background_index_up_to_date` can get the correct data.
	 *
	 * @var array
	 */
	protected $indexable_builder_versions_by_type = [
		'date-archive'      => self::DEFAULT_INDEXABLE_BUILDER_VERSION,
		'general'           => self::DEFAULT_INDEXABLE_BUILDER_VERSION,
		'home-page'         => 2,
		'post'              => 2,
		'post-type-archive' => 2,
		'term'              => 2,
		'user'              => 2,
		'system-page'       => self::DEFAULT_INDEXABLE_BUILDER_VERSION,
	];

	/**
	 * Provides the most recent version number for an Indexable's object type.
	 *
	 * @param string $object_type The Indexable type for which you want to know the most recent version.
	 *
	 * @return int The most recent version number for the type, or 1 if the version doesn't exist.
	 */
	public function get_latest_version_for_type( $object_type ) {
		if ( ! \array_key_exists( $object_type, $this->indexable_builder_versions_by_type ) ) {
			return self::DEFAULT_INDEXABLE_BUILDER_VERSION;
		}

		return $this->indexable_builder_versions_by_type[ $object_type ];
	}

	/**
	 * Get a unique key for the current state of all combined indexable versions.
	 *
	 * @return string a unique key for the current state of all combined indexable versions.
	 */
	public function get_combined_version_key() {
		return implode( '-', array_values( $this->indexable_builder_versions_by_type ) );
	}
}
