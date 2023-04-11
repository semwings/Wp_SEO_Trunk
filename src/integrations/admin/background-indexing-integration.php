<?php

namespace Yoast\WP\SEO\Integrations\Admin;

use Yoast\WP\SEO\Actions\Indexing\Indexable_General_Indexation_Action;
use Yoast\WP\SEO\Actions\Indexing\Indexable_Indexing_Complete_Action;
use Yoast\WP\SEO\Actions\Indexing\Indexable_Post_Indexation_Action;
use Yoast\WP\SEO\Actions\Indexing\Indexable_Post_Type_Archive_Indexation_Action;
use Yoast\WP\SEO\Actions\Indexing\Indexable_Term_Indexation_Action;
use Yoast\WP\SEO\Actions\Indexing\Post_Link_Indexing_Action;
use Yoast\WP\SEO\Actions\Indexing\Term_Link_Indexing_Action;
use Yoast\WP\SEO\Conditionals\Get_Request_Conditional;
use Yoast\WP\SEO\Conditionals\Migrations_Conditional;
use Yoast\WP\SEO\Conditionals\WP_CRON_Enabled_Conditional;
use Yoast\WP\SEO\Conditionals\Yoast_Admin_And_Dashboard_Conditional;
use Yoast\WP\SEO\Helpers\Indexable_Helper;
use Yoast\WP\SEO\Helpers\Indexing_Helper;
use Yoast\WP\SEO\Integrations\Integration_Interface;

/**
 * Class Background_Indexing_Integration.
 *
 * @package Yoast\WP\SEO\Integrations\Admin
 */
class Background_Indexing_Integration implements Integration_Interface {

	/**
	 * The post indexing action.
	 *
	 * @var Indexable_Post_Indexation_Action
	 */
	protected $post_indexation;

	/**
	 * The term indexing action.
	 *
	 * @var Indexable_Term_Indexation_Action
	 */
	protected $term_indexation;

	/**
	 * The post type archive indexing action.
	 *
	 * @var Indexable_Post_Type_Archive_Indexation_Action
	 */
	protected $post_type_archive_indexation;

	/**
	 * Represents the general indexing.
	 *
	 * @var Indexable_General_Indexation_Action
	 */
	protected $general_indexation;

	/**
	 * Represents the indexing completed action.
	 *
	 * @var Indexable_Indexing_Complete_Action
	 */
	protected $complete_indexation_action;

	/**
	 * The post link indexing action.
	 *
	 * @var Post_Link_Indexing_Action
	 */
	protected $post_link_indexing_action;

	/**
	 * The term link indexing action.
	 *
	 * @var Term_Link_Indexing_Action
	 */
	protected $term_link_indexing_action;

	/**
	 * Represents the indexing helper.
	 *
	 * @var Indexing_Helper
	 */
	protected $indexing_helper;

	/**
	 * An object that checks if we are on the Yoast admin or on the dashboard page.
	 *
	 * @var Yoast_Admin_And_Dashboard_Conditional
	 */
	protected $yoast_admin_and_dashboard_conditional;

	/**
	 * An object that checks if we are handling a GET request.
	 *
	 * @var Get_Request_Conditional
	 */
	private $get_request_conditional;

	/**
	 * An object that checks if WP_CRON is enabled.
	 *
	 * @var WP_CRON_Enabled_Conditional
	 */
	private $wp_cron_enabled_conditional;

	/**
	 * The indexable helper
	 *
	 * @var Indexable_Helper
	 */
	private $indexable_helper;

	/**
	 * Returns the conditionals based on which this integration should be active.
	 *
	 * @return array The array of conditionals.
	 */
	public static function get_conditionals() {
		return [
			Migrations_Conditional::class,
		];
	}

	/**
	 * Shutdown_Indexing_Integration constructor.
	 *
	 * @param Indexable_Post_Indexation_Action              $post_indexation                       The post indexing action.
	 * @param Indexable_Term_Indexation_Action              $term_indexation                       The term indexing action.
	 * @param Indexable_Post_Type_Archive_Indexation_Action $post_type_archive_indexation          The post type archive indexing action.
	 * @param Indexable_General_Indexation_Action           $general_indexation                    The general indexing action.
	 * @param Indexable_Indexing_Complete_Action            $complete_indexation_action            The complete indexing action.
	 * @param Post_Link_Indexing_Action                     $post_link_indexing_action             The post indexing action.
	 * @param Term_Link_Indexing_Action                     $term_link_indexing_action             The term indexing action.
	 * @param Indexing_Helper                               $indexing_helper                       The indexing helper.
	 * @param Indexable_Helper                              $indexable_helper                      The indexable helper.
	 * @param Yoast_Admin_And_Dashboard_Conditional         $yoast_admin_and_dashboard_conditional An object that checks if we are on the Yoast admin or on the dashboard page.
	 * @param Get_Request_Conditional                       $get_request_conditional               An object that checks if we are handling a GET request.
	 * @param WP_CRON_Enabled_Conditional                   $wp_cron_enabled_conditional           An object that checks if WP_CRON is enabled.
	 */
	public function __construct(
		Indexable_Post_Indexation_Action $post_indexation,
		Indexable_Term_Indexation_Action $term_indexation,
		Indexable_Post_Type_Archive_Indexation_Action $post_type_archive_indexation,
		Indexable_General_Indexation_Action $general_indexation,
		Indexable_Indexing_Complete_Action $complete_indexation_action,
		Post_Link_Indexing_Action $post_link_indexing_action,
		Term_Link_Indexing_Action $term_link_indexing_action,
		Indexing_Helper $indexing_helper,
		Indexable_Helper $indexable_helper,
		Yoast_Admin_And_Dashboard_Conditional $yoast_admin_and_dashboard_conditional,
		Get_Request_Conditional $get_request_conditional,
		WP_CRON_Enabled_Conditional $wp_cron_enabled_conditional
	) {
		$this->post_indexation                       = $post_indexation;
		$this->term_indexation                       = $term_indexation;
		$this->post_type_archive_indexation          = $post_type_archive_indexation;
		$this->general_indexation                    = $general_indexation;
		$this->complete_indexation_action            = $complete_indexation_action;
		$this->post_link_indexing_action             = $post_link_indexing_action;
		$this->term_link_indexing_action             = $term_link_indexing_action;
		$this->indexing_helper                       = $indexing_helper;
		$this->indexable_helper                      = $indexable_helper;
		$this->yoast_admin_and_dashboard_conditional = $yoast_admin_and_dashboard_conditional;
		$this->get_request_conditional               = $get_request_conditional;
		$this->wp_cron_enabled_conditional           = $wp_cron_enabled_conditional;
	}

	/**
	 * Register hooks.
	 */
	public function register_hooks() {
		\add_action( 'admin_init', [ $this, 'register_shutdown_indexing' ] );
		\add_action( 'wpseo_indexable_index_batch', [ $this, 'index' ] );
		// phpcs:ignore WordPress.WP.CronInterval -- The sniff doesn't understand values with parentheses. https://github.com/WordPress/WordPress-Coding-Standards/issues/2025
		\add_filter( 'cron_schedules', [ $this, 'add_cron_schedule' ] );
		\add_action( 'admin_init', [ $this, 'schedule_cron_indexing' ], 11 );

		$this->add_limit_filters();
	}

	/**
	 * Adds the filters that change the indexing limits.
	 *
	 * @return void.
	 */
	protected function add_limit_filters() {
		\add_filter( 'wpseo_post_indexation_limit', [ $this, 'throttle_cron_indexing' ] );
		\add_filter( 'wpseo_post_type_archive_indexation_limit', [ $this, 'throttle_cron_indexing' ] );
		\add_filter( 'wpseo_term_indexation_limit', [ $this, 'throttle_cron_indexing' ] );
		\add_filter( 'wpseo_prominent_words_indexation_limit', [ $this, 'throttle_cron_indexing' ] );
		\add_filter( 'wpseo_link_indexing_limit', [ $this, 'throttle_cron_link_indexing' ] );
	}

	/**
	 * Enqueues the required scripts.
	 *
	 * @return void
	 */
	public function register_shutdown_indexing() {
		if ( $this->should_index_on_shutdown( $this->get_shutdown_limit() ) ) {
			$this->register_shutdown_function( 'index' );
		}
	}

	/**
	 * Run a single indexing pass of each indexing action. Intended for use as a shutdown function.
	 *
	 * @return void
	 */
	public function index() {
		if ( \wp_doing_cron() && ! $this->should_index_on_cron( true ) ) {
			$this->unschedule_cron_indexing();

			return;
		}

		$this->post_indexation->index();
		$this->term_indexation->index();
		$this->general_indexation->index();
		$this->post_type_archive_indexation->index();
		$this->post_link_indexing_action->index();
		$this->term_link_indexing_action->index();

		if ( $this->indexing_helper->get_limited_filtered_unindexed_count_background( 1 ) > 0 ) {
			// We set this as complete, even though prominent words might not be complete. But that's the way we always treated that.
			$this->complete_indexation_action->complete();
		}
	}

	/**
	 * Adds the 'Every fifteen minutes' cron schedule to WP-Cron.
	 *
	 * @param array $schedules The existing schedules.
	 *
	 * @return array The schedules containing the fifteen_minutes schedule.
	 */
	public function add_cron_schedule( $schedules ) {
		if ( ! is_array( $schedules ) ) {
			return $schedules;
		}

		$schedules['fifteen_minutes'] = [
			'interval' => ( 15 * MINUTE_IN_SECONDS ),
			'display'  => esc_html__( 'Every fifteen minutes', 'wordpress-seo' ),
		];

		return $schedules;
	}

	/**
	 * Schedule background indexing every 15 minutes if the index isn't already up to date.
	 *
	 * @return void
	 */
	public function schedule_cron_indexing() {
		if ( ! \wp_next_scheduled( 'wpseo_indexable_index_batch' ) && $this->should_index_on_cron() ) {
			\wp_schedule_event( \time(), 'fifteen_minutes', 'wpseo_indexable_index_batch' );
		}
	}

	/**
	 * Limit cron indexing to 15 indexables per batch instead of 25.
	 *
	 * @param int $indexation_limit The current limit (filter input).
	 *
	 * @return int The new batch limit.
	 */
	public function throttle_cron_indexing( $indexation_limit ) {
		if ( \wp_doing_cron() ) {
			/**
			 * Filter: Adds the possibility to limit the number of items that are indexed when in cron action.
			 *
			 * @api int $limit Maximum number of indexables to be indexed per indexing action.
			 */
			return \apply_filters( 'wpseo_cron_indexing_limit_size', 15 );
		}

		return $indexation_limit;
	}

	/**
	 * Limit cron indexing to 3 links per batch instead of 5.
	 *
	 * @param int $link_indexation_limit The current limit (filter input).
	 *
	 * @return int The new batch limit.
	 */
	public function throttle_cron_link_indexing( $link_indexation_limit ) {
		if ( \wp_doing_cron() ) {
			/**
			 * Filter: Adds the possibility to limit the number of links that are indexed when in cron action.
			 *
			 * @api int $limit Maximum number of link indexables to be indexed per link indexing action.
			 */
			return \apply_filters( 'wpseo_cron_link_indexing_limit_size', 3 );
		}

		return $link_indexation_limit;
	}

	/**
	 * Determine whether cron indexation should be performed.
	 *
	 * @return bool Should cron indexation be performed.
	 */
	protected function should_index_on_cron() {
		if ( ! $this->indexable_helper->should_index_indexables() ) {
			return false;
		}

		// The filter supersedes everything when preventing cron indexation.
		if ( apply_filters( 'Yoast\WP\SEO\enable_cron_indexing', true ) !== true ) {
			return false;
		}

		return $this->indexing_helper->get_limited_filtered_unindexed_count_background( 1 ) > 0;
	}

	/**
	 * Determine whether background indexation should be performed.
	 *
	 * @param int $shutdown_limit The shutdown limit used to determine whether indexation should be run.
	 *
	 * @return bool Should background indexation be performed.
	 */
	protected function should_index_on_shutdown( $shutdown_limit ) {
		if ( ! $this->yoast_admin_and_dashboard_conditional->is_met() || ! $this->get_request_conditional->is_met() ) {
			return false;
		}

		if ( ! $this->indexable_helper->should_index_indexables() ) {
			return false;
		}

		$total_unindexed = $this->indexing_helper->get_limited_filtered_unindexed_count_background( $shutdown_limit );
		if ( $total_unindexed === 0 || $total_unindexed > $shutdown_limit ) {
			return false;
		}

		return ! $this->wp_cron_enabled_conditional->is_met();
	}

	/**
	 * Retrieves the shutdown limit. This limit is the amount of indexables that is generated in the background.
	 *
	 * @return int The shutdown limit.
	 */
	protected function get_shutdown_limit() {
		/**
		 * Filter 'wpseo_shutdown_indexation_limit' - Allow filtering the number of objects that can be indexed during shutdown.
		 *
		 * @api int The maximum number of objects indexed.
		 */
		return \apply_filters( 'wpseo_shutdown_indexation_limit', 25 );
	}

	/**
	 * Removes the cron indexing job from the scheduled event queue.
	 *
	 * @return void
	 */
	protected function unschedule_cron_indexing() {
		$scheduled = \wp_next_scheduled( 'wpseo_indexable_index_batch' );
		if ( $scheduled ) {
			\wp_unschedule_event( $scheduled, 'wpseo_indexable_index_batch' );
		}
	}

	/**
	 * Registers a method to be executed on shutdown.
	 * This wrapper mostly exists for making this class more unittestable.
	 *
	 * @param string $method_name The name of the method on the current instance to register.
	 *
	 * @return void
	 */
	protected function register_shutdown_function( $method_name ) {
		\register_shutdown_function( [ $this, $method_name ] );
	}
}
