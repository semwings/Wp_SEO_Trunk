<?php

namespace Yoast\WP\SEO\Integrations;

use Closure;
use Yoast\WP\Lib\Model;
use Yoast\WP\SEO\Helpers\Author_Archive_Helper;
use Yoast\WP\SEO\Helpers\Post_Type_Helper;
use Yoast\WP\SEO\Helpers\Taxonomy_Helper;
use Yoast\WP\SEO\Repositories\Indexable_Repository;
use Yoast\WP\SEO\Repositories\Indexable_Cleanup_Repository;

/**
 * Adds cleanup hooks.
 */
class Cleanup_Integration implements Integration_Interface {

	/**
	 * Identifier used to determine the current task.
	 */
	const CURRENT_TASK_OPTION = 'wpseo-cleanup-current-task';

	/**
	 * Identifier for the cron job.
	 */
	const CRON_HOOK = 'wpseo_cleanup_cron';

	/**
	 * Identifier for starting the cleanup.
	 */
	const START_HOOK = 'wpseo_start_cleanup_indexables';

	/**
	 * The cleanup repository.
	 *
	 * @var Indexable_Cleanup_Repository
	 */
	private $cleanup_repository;

	/**
	 * The constructor.
	 *
	 * @param Indexable_Cleanup_Repository $cleanup_repository   The cleanup repository.
	 */
	public function __construct( Indexable_Cleanup_Repository $cleanup_repository ) {
		$this->cleanup_repository = $cleanup_repository;
	}

	/**
	 * Initializes the integration.
	 *
	 * This is the place to register hooks and filters.
	 *
	 * @return void
	 */
	public function register_hooks() {
		\add_action( self::START_HOOK, [ $this, 'run_cleanup' ] );
		\add_action( self::CRON_HOOK, [ $this, 'run_cleanup_cron' ] );
		\add_action( 'wpseo_deactivate', [ $this, 'reset_cleanup' ] );
	}

	/**
	 * Returns the conditionals based on which this loadable should be active.
	 *
	 * @return array The array of conditionals.
	 */
	public static function get_conditionals() {
		return [];
	}

	/**
	 * Starts the indexables cleanup.
	 *
	 * @return void
	 */
	public function run_cleanup() {
		$this->reset_cleanup();

		$cleanups = $this->get_cleanup_tasks();
		$limit    = $this->get_limit();

		foreach ( $cleanups as $name => $action ) {
			$items_cleaned = $action( $limit );

			if ( $items_cleaned === false ) {
				return;
			}

			if ( $items_cleaned < $limit ) {
				continue;
			}

			// There are more items to delete for the current cleanup job, start a cronjob at the specified job.
			$this->start_cron_job( $name );

			return;
		}
	}

	/**
	 * Returns an array of cleanup tasks.
	 *
	 * @return Closure[] The cleanup tasks.
	 */
	public function get_cleanup_tasks() {
		return \array_merge(
			[
				'clean_indexables_with_object_type_and_object_sub_type_shop_order' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_with_object_type_and_object_sub_type( 'post', 'shop_order', $limit );
				},
				'clean_indexables_by_post_status_auto-draft' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_with_post_status( 'auto-draft', $limit );
				},
				'clean_indexables_for_non_publicly_viewable_post' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_non_publicly_viewable_post( $limit );
				},
				'clean_indexables_for_non_publicly_viewable_taxonomies' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_non_publicly_viewable_taxonomies( $limit );
				},
				'clean_indexables_for_authors_archive_disabled' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_authors_archive_disabled( $limit );
				},
				'clean_indexables_for_authors_without_archive' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_authors_without_archive( $limit );
				},
				'update_indexables_author_to_reassigned' => function ( $limit ) {
					return $this->cleanup_repository->update_indexables_author_to_reassigned( $limit );
				},
				'clean_orphaned_user_indexables_without_wp_user' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_object_type_and_source_table( 'users', 'ID', 'user', $limit );
				},
				'clean_orphaned_user_indexables_without_wp_post' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_object_type_and_source_table( 'posts', 'ID', 'post', $limit );
				},
				'clean_orphaned_user_indexables_without_wp_term' => function ( $limit ) {
					return $this->cleanup_repository->clean_indexables_for_object_type_and_source_table( 'terms', 'term_id', 'term', $limit );
				},
			],
			$this->get_additional_tasks(),
			[
				/* These should always be the last ones to be called. */
				'clean_orphaned_content_indexable_hierarchy' => function ( $limit ) {
					return $this->cleanup_repository->cleanup_orphaned_from_table( 'Indexable_Hierarchy', 'indexable_id', $limit );
				},
				'clean_orphaned_content_seo_links_indexable_id' => function ( $limit ) {
					return $this->cleanup_repository->cleanup_orphaned_from_table( 'SEO_Links', 'indexable_id', $limit );
				},
				'clean_orphaned_content_seo_links_target_indexable_id' => function ( $limit ) {
					return $this->cleanup_repository->cleanup_orphaned_from_table( 'SEO_Links', 'target_indexable_id', $limit );
				},

			]
		);
	}

	/**
	 * Gets additional tasks from the 'wpseo_cleanup_tasks' filter.
	 *
	 * @return Closure[] Associative array of cleanup functions.
	 */
	private function get_additional_tasks() {

		/**
		 * Filter: Adds the possibility to add addition cleanup functions.
		 *
		 * @api array Associative array with unique keys. Value should be a cleanup function that receives a limit.
		 */
		$additional_tasks = \apply_filters( 'wpseo_cleanup_tasks', [] );

		if ( ! \is_array( $additional_tasks ) ) {
			return [];
		}

		foreach ( $additional_tasks as $key => $value ) {
			if ( \is_int( $key ) ) {
				return [];
			}
			if ( ( ! \is_object( $value ) ) || ! ( $value instanceof Closure ) ) {
				return [];
			}
		}

		return $additional_tasks;
	}

	/**
	 * Gets the deletion limit for cleanups.
	 *
	 * @return int The limit for the amount of entities to be cleaned.
	 */
	private function get_limit() {
		/**
		 * Filter: Adds the possibility to limit the number of items that are deleted from the database on cleanup.
		 *
		 * @api int $limit Maximum number of indexables to be cleaned up per query.
		 */
		$limit = \apply_filters( 'wpseo_cron_query_limit_size', 1000 );

		if ( ! \is_int( $limit ) ) {
			$limit = 1000;
		}

		return \abs( $limit );
	}

	/**
	 * Resets and stops the cleanup integration.
	 *
	 * @return void
	 */
	public function reset_cleanup() {
		\delete_option( self::CURRENT_TASK_OPTION );
		\wp_unschedule_hook( self::CRON_HOOK );
	}

	/**
	 * Starts the cleanup cron job.
	 *
	 * @param string $task_name The task name of the next cleanup task to run.
	 *
	 * @return void
	 */
	private function start_cron_job( $task_name ) {
		\update_option( self::CURRENT_TASK_OPTION, $task_name );
		\wp_schedule_event(
			( \time() + \HOUR_IN_SECONDS ),
			'hourly',
			self::CRON_HOOK
		);
	}

	/**
	 * The callback that is called for the cleanup cron job.
	 *
	 * @return void
	 */
	public function run_cleanup_cron() {
		$current_task_name = \get_option( self::CURRENT_TASK_OPTION );

		if ( $current_task_name === false ) {
			$this->reset_cleanup();

			return;
		}

		$limit = $this->get_limit();
		$tasks = $this->get_cleanup_tasks();

		// The task may have been added by a filter that has been removed, in that case just start over.
		if ( ! isset( $tasks[ $current_task_name ] ) ) {
			$current_task_name = \key( $tasks );
		}

		$current_task = \current( $tasks );
		while ( $current_task !== false ) {
			// Skip the tasks that have already been done.
			if ( \key( $tasks ) !== $current_task_name ) {
				$current_task = \next( $tasks );
				continue;
			}

			// Call the cleanup callback function that accompanies the current task.
			$items_cleaned = $current_task( $limit );

			if ( $items_cleaned === false ) {
				$this->reset_cleanup();

				return;
			}

			if ( $items_cleaned === 0 ) {
				// Check if we are finished with all tasks.
				if ( \next( $tasks ) === false ) {
					$this->reset_cleanup();

					return;
				}

				// Continue with the next task next time the cron job is run.
				\update_option( self::CURRENT_TASK_OPTION, \key( $tasks ) );

				return;
			}

			// There were items deleted for the current task, continue with the same task next cron call.
			return;
		}
	}
}

