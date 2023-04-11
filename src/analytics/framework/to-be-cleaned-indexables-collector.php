<?php

namespace Yoast\WP\SEO\Analytics\Framework;

use Yoast\WP\SEO\Repositories\Indexable_Cleanup_Repository;
use Yoast\WP\SEO\Analytics\Domain\To_Be_Cleaned_Indexable_Count;
use Yoast\WP\SEO\Analytics\Domain\To_Be_Cleaned_Indexable_Bucket;

/**
 * Collects data about to be clean indexables.
 */
class To_Be_Cleaned_Indexables_Collector implements \WPSEO_Collection {

	/**
	 * The cleanup query repository.
	 *
	 * @var \Yoast\WP\SEO\Repositories\Indexable_Cleanup_Repository
	 */
	private $indexable_cleanup_repository;

	/**
	 * The constructor.
	 *
	 * @param \Yoast\WP\SEO\Repositories\Indexable_Cleanup_Repository $indexable_cleanup_repository The Indexable
	 *                                                                                              cleanup repository.
	 */
	public function __construct( Indexable_Cleanup_Repository $indexable_cleanup_repository ) {
		$this->indexable_cleanup_repository = $indexable_cleanup_repository;
	}

	/**
	 * Gets the data for the collector.
	 */
	public function get(): array {
		$to_be_cleaned_indexable_bucket = new To_Be_Cleaned_Indexable_Bucket();
		$cleanup_tasks                  = [
			'indexables_with_object_type_and_object_sub_type'   => $this->indexable_cleanup_repository->count_indexables_with_object_type_and_object_sub_type( 'post', 'shop_order' ),
			'indexables_with_post_status'                       => $this->indexable_cleanup_repository->count_indexables_with_post_status( 'auto-draft' ),
			'indexables_for_non_publicly_viewable_post'         => $this->indexable_cleanup_repository->count_indexables_for_non_publicly_viewable_post(),
			'indexables_for_non_publicly_viewable_taxonomies'   => $this->indexable_cleanup_repository->count_indexables_for_non_publicly_viewable_taxonomies(),
			'indexables_for_authors_archive_disabled'           => $this->indexable_cleanup_repository->count_indexables_for_authors_archive_disabled(),
			'indexables_for_authors_without_archive'            => $this->indexable_cleanup_repository->count_indexables_for_authors_without_archive(),
			'indexables_for_object_type_and_source_table_users' => $this->indexable_cleanup_repository->count_indexables_for_object_type_and_source_table( 'users', 'ID', 'user' ),
			'indexables_for_object_type_and_source_table_posts' => $this->indexable_cleanup_repository->count_indexables_for_object_type_and_source_table( 'posts', 'ID', 'post' ),
			'indexables_for_object_type_and_source_table_terms' => $this->indexable_cleanup_repository->count_indexables_for_object_type_and_source_table( 'terms', 'term_id', 'term' ),
			'orphaned_from_table_indexable_hierarchy'           => $this->indexable_cleanup_repository->count_orphaned_from_table( 'Indexable_Hierarchy', 'indexable_id' ),
			'orphaned_from_table_indexable_id'                  => $this->indexable_cleanup_repository->count_orphaned_from_table( 'SEO_Links', 'indexable_id' ),
			'orphaned_from_table_target_indexable_id'           => $this->indexable_cleanup_repository->count_orphaned_from_table( 'SEO_Links', 'target_indexable_id' ),
		];

		foreach ( $cleanup_tasks as $name => $count ) {
			$count_object = new To_Be_Cleaned_Indexable_Count( $name, $count );
			$to_be_cleaned_indexable_bucket->add_to_be_cleaned_indexable_count( $count_object );
		}

		$this->get_additional_counts( $to_be_cleaned_indexable_bucket );

		return $to_be_cleaned_indexable_bucket->to_array();
	}

	/**
	 * Gets additional tasks from the 'wpseo_cleanup_counts' filter.
	 *
	 * @param \Yoast\WP\SEO\Analytics\Domain\To_Be_Cleaned_Indexable_Bucket $to_be_cleaned_indexable_bucket The current bucket with data.
	 *
	 * @return void
	 */
	private function get_additional_counts( To_Be_Cleaned_Indexable_Bucket $to_be_cleaned_indexable_bucket ) {

		/**
		 * Filter: Adds the possibility to add additional to be cleaned objects.
		 *
		 * @api To_Be_Cleaned_Indexable_Bucket An indexable cleanup bucket. New values are instances of To_Be_Cleaned_Indexable_Count.
		 */
		\apply_filters( 'wpseo_cleanup_counts', $to_be_cleaned_indexable_bucket );
	}
}
