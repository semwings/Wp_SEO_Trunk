<?php

namespace Yoast\WP\SEO\Routes;

use WP_REST_Request;
use WP_REST_Response;
use Yoast\WP\SEO\Conditionals\No_Conditionals;
use Yoast\WP\SEO\Helpers\Indexables_Page_Helper;
use Yoast\WP\SEO\Helpers\Options_Helper;
use Yoast\WP\SEO\Helpers\Post_Type_Helper;
use Yoast\WP\SEO\Main;
use Yoast\WP\SEO\Repositories\Indexable_Repository;
use Yoast\WP\SEO\Routes\Route_Interface;

/**
 * Indexables_Route class.
 */
class Indexables_Route implements Route_Interface {

	use No_Conditionals;

	/**
	 * Represents the route that retrieves the neccessary information for setting up the Indexables Page.
	 *
	 * @var string
	 */
	const SETUP_INFO = '/setup_info';

	/**
	 * Represents the least readability route.
	 *
	 * @var string
	 */
	const LEAST_READABILITY_ROUTE = '/least_readability';

	/**
	 * Represents the least SEO score route.
	 *
	 * @var string
	 */
	const LEAST_SEO_SCORE_ROUTE = '/least_seo_score';

	/**
	 * Represents the most linked route.
	 *
	 * @var string
	 */
	const MOST_LINKED_ROUTE = '/most_linked';

	/**
	 * Represents the least linked route.
	 *
	 * @var string
	 */
	const LEAST_LINKED_ROUTE = '/least_linked';

	/**
	 * Allows to mark an indexable to be ignored.
	 *
	 * @var string
	 */
	const IGNORE_INDEXABLE_ROUTE = '/ignore_indexable';

	/**
	 * Allows to restore an indexable previously ignored.
	 *
	 * @var string
	 */
	const RESTORE_INDEXABLE_ROUTE = '/restore_indexable';

	/**
	 * The indexable repository.
	 *
	 * @var Indexable_Repository
	 */
	private $indexable_repository;

	/**
	 * The indexables page helper.
	 *
	 * @var Indexables_Page_Helper
	 */
	private $indexables_page_helper;

	/**
	 * The post type helper.
	 *
	 * @var Post_Type_Helper
	 */
	private $post_type_helper;

	/**
	 * Indexables_Route constructor.
	 *
	 * @param Indexable_Repository   $indexable_repository   The indexable repository.
	 * @param Indexables_Page_Helper $indexables_page_helper The indexables page helper.
	 * @param Post_Type_Helper       $post_type_helper       The post type helper.
	 * @param Options_Helper         $options_helper         The options helper.
	 */
	public function __construct(
		Indexable_Repository $indexable_repository,
		Indexables_Page_Helper $indexables_page_helper,
		Post_Type_Helper $post_type_helper,
		Options_Helper $options_helper
	) {
		$this->indexable_repository   = $indexable_repository;
		$this->indexables_page_helper = $indexables_page_helper;
		$this->post_type_helper       = $post_type_helper;
		$this->options_helper         = $options_helper;
	}

	/**
	 * Registers routes with WordPress.
	 *
	 * @return void
	 */
	public function register_routes() {
		$edit_others_posts = static function() {
			return \current_user_can( 'edit_others_posts' );
		};

		$setup_info_route = [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_setup_info' ],
				'permission_callback' => $edit_others_posts,
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::SETUP_INFO, $setup_info_route );

		$least_readability_route = [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_least_readable' ],
				'permission_callback' => $edit_others_posts,
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::LEAST_READABILITY_ROUTE, $least_readability_route );

		$least_seo_score_route = [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_least_seo_score' ],
				'permission_callback' => $edit_others_posts,
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::LEAST_SEO_SCORE_ROUTE, $least_seo_score_route );

		$most_linked_route = [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_most_linked' ],
				'permission_callback' => $edit_others_posts,
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::MOST_LINKED_ROUTE, $most_linked_route );

		$least_linked_route = [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_least_linked' ],
				'permission_callback' => $edit_others_posts,
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::LEAST_LINKED_ROUTE, $least_linked_route );

		$ignore_indexable_route = [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'ignore_indexable' ],
				'permission_callback' => $edit_others_posts,
				// @TODO: add validation/sanitization.
				'args'                => [
					'id' => [
						'type'     => 'integer',
					],
					'type' => [
						'type'     => 'string',
					],
				],
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::IGNORE_INDEXABLE_ROUTE, $ignore_indexable_route );

		$restore_indexable_route = [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'restore_indexable' ],
				'permission_callback' => $edit_others_posts,
				// @TODO: add validation/sanitization.
				'args'                => [
					'id' => [
						'type'     => 'integer',
					],
					'type' => [
						'type'     => 'string',
					],
				],
			],
		];

		\register_rest_route( Main::API_V1_NAMESPACE, self::RESTORE_INDEXABLE_ROUTE, $restore_indexable_route );
	}

	/**
	 * Gets the neccessary information to set up the indexables page.
	 *
	 * @return WP_REST_Response The neccessary information to set up the indexables page.
	 */
	public function get_setup_info() {
		$is_seo_score_enabled   = $this->options_helper->get( 'keyword_analysis_active', true );
		$is_readability_enabled = $this->options_helper->get( 'content_analysis_active', true );
		$is_link_count_enabled  = $this->options_helper->get( 'enable_text_link_counter', true );

		if ( ! $is_seo_score_enabled && ! $is_readability_enabled && ! $is_link_count_enabled ) {
			return new WP_REST_Response(
				[
					'json' => [
						'enabledFeatures' => [
							'isSeoScoreEnabled'    => false,
							'isReadabilityEnabled' => false,
							'isLinkCountEnabled'   => false,
						],
						'enoughContent'   => false,
					],
				]
			);
		}

		$all_posts = $this->indexable_repository->query()
			->select( 'id' )
			->where_raw( '( post_status= \'publish\' OR post_status IS NULL )' )
			->where_in( 'object_type', [ 'post' ] )
			->where_in( 'object_sub_type', $this->get_sub_types() )
			->count();

		return new WP_REST_Response(
			[
				'json' => [
					'enabledFeatures' => [
						'isSeoScoreEnabled'    => $is_seo_score_enabled,
						'isReadabilityEnabled' => $is_readability_enabled,
						'isLinkCountEnabled'   => $is_link_count_enabled,
					],
					'enoughContent'   => $all_posts > $this->indexables_page_helper->get_minimum_posts_threshold(),
				],
			]
		);
	}

	/**
	 * Gets the posts with the smallest readability scores.
	 *
	 * @return WP_REST_Response The posts with the smallest readability scores.
	 */
	public function get_least_readable() {
		// where_not_equal needs the set to check against not to be empty.
		$ignore_list = empty( $this->options_helper->get( 'least_readability_ignore_list', [] ) ) ? [ -1 ] : $this->options_helper->get( 'least_readability_ignore_list', [] );
		$limit       = $this->indexables_page_helper->get_buffer_size();

		// @TODO: Improve query.
		$least_readable = $this->indexable_repository->query()
			->where_raw( '( post_status= \'publish\' OR post_status IS NULL )' )
			->where_in( 'object_type', [ 'post' ] )
			->where_in( 'object_sub_type', $this->get_sub_types() )
			->where_not_in( 'id', $ignore_list )
			->where_not_equal( 'readability_score', 0 )
			->order_by_asc( 'readability_score' )
			->limit( $limit )
			->find_many();

		$least_readable = \array_map( [ $this->indexable_repository, 'ensure_permalink' ], $least_readable );

		return new WP_REST_Response(
			[
				'json' => [
					'list' => $least_readable,
				],
			]
		);
	}

	/**
	 * Gets the posts with the smallest readability scores.
	 *
	 * @return WP_REST_Response The posts with the smallest readability scores.
	 */
	public function get_least_seo_score() {
		// where_not_equal needs the set to check against not to be empty.
		$ignore_list = empty( $this->options_helper->get( 'least_seo_score_ignore_list', [] ) ) ? [ -1 ] : $this->options_helper->get( 'least_seo_score_ignore_list', [] );
		$limit       = $this->indexables_page_helper->get_buffer_size();

		// @TODO: Improve query.
		$least_seo_score = $this->indexable_repository->query()
			->where_raw( '( post_status= \'publish\' OR post_status IS NULL )' )
			->where_in( 'object_type', [ 'post' ] )
			->where_in( 'object_sub_type', $this->get_sub_types() )
			->where_not_in( 'id', $ignore_list )
			->where_not_equal( 'primary_focus_keyword', 0 )
			->order_by_asc( 'primary_focus_keyword_score' )
			->limit( $limit )
			->find_many();

		$least_seo_score = \array_map( [ $this->indexable_repository, 'ensure_permalink' ], $least_seo_score );

		return new WP_REST_Response(
			[
				'json' => [
					'list' => $least_seo_score,
				],
			]
		);
	}

	/**
	 * Gets the most linked posts.
	 *
	 * @return WP_REST_Response The most linked posts.
	 */
	public function get_most_linked() {
		// where_not_equal needs the set to check against not to be empty.
		$ignore_list = empty( $this->options_helper->get( 'most_linked_ignore_list', [] ) ) ? [ -1 ] : $this->options_helper->get( 'most_linked_ignore_list', [] );
		$limit       = $this->indexables_page_helper->get_buffer_size();

		// @TODO: Improve query.
		$most_linked = $this->indexable_repository->query()
			->where_gt( 'incoming_link_count', 0 )
			->where_not_null( 'incoming_link_count' )
			->where_raw( '( post_status = \'publish\' OR post_status IS NULL )' )
			->where_in( 'object_sub_type', $this->get_sub_types() )
			->where_in( 'object_type', [ 'post' ] )
			->where_not_in( 'id', $ignore_list )
			->order_by_desc( 'incoming_link_count' )
			->limit( $limit )
			->find_many();
		$most_linked = \array_map( [ $this->indexable_repository, 'ensure_permalink' ], $most_linked );

		return new WP_REST_Response(
			[
				'json' => [
					'list' => $most_linked,
				],
			]
		);
	}

	/**
	 * Gets the least linked posts.
	 *
	 * @return WP_REST_Response The most linked posts.
	 */
	public function get_least_linked() {
		// where_not_equal needs the set to check against not to be empty.
		$ignore_list = empty( $this->options_helper->get( 'least_linked_ignore_list', [] ) ) ? [ -1 ] : $this->options_helper->get( 'least_linked_ignore_list', [] );
		$limit       = $this->indexables_page_helper->get_buffer_size();

		// @TODO: Improve query.
		$least_linked = $this->indexable_repository->query()
			->where_raw( '( post_status = \'publish\' OR post_status IS NULL )' )
			->where_in( 'object_sub_type', $this->get_sub_types() )
			->where_in( 'object_type', [ 'post' ] )
			->where_not_in( 'id', $ignore_list )
			->order_by_asc( 'incoming_link_count' )
			->limit( $limit )
			->find_many();
		$least_linked = \array_map( [ $this->indexable_repository, 'ensure_permalink' ], $least_linked );
		$least_linked = \array_map(
			function ( $indexable ) {
				$output = $indexable;
				if ( $indexable->incoming_link_count === null ) {
					$output->incoming_link_count = 0;
				}
				return $output;
			},
			$least_linked
		);

		return new WP_REST_Response(
			[
				'json' => [
					'list' => $least_linked,
				],
			]
		);
	}

	/**
	 * Adds an indexable id in the ignore list.
	 *
	 * @param WP_REST_Request $request The request object.
	 *
	 * @return WP_REST_Response The success or failure response.
	 */
	public function ignore_indexable( WP_REST_Request $request ) {
		$data = $this->add_indexable_to_ignore_list( $request->get_json_params() );

		return new WP_REST_Response(
			[ 'json' => $data ]
		);
	}

	/**
	 * Restores an indexable id from the ignore list.
	 *
	 * @param WP_REST_Request $request The request object.
	 *
	 * @return WP_REST_Response The success or failure response.
	 */
	public function restore_indexable( WP_REST_Request $request ) {
		$data = $this->remove_indexable_from_ignore_list( $request->get_json_params() );

		return new WP_REST_Response(
			[ 'json' => $data ]
		);
	}

	/**
	 * Get public sub types.
	 *
	 * @return array The subtypes.
	 */
	protected function get_sub_types() {
		$object_sub_types = \array_values(
			\array_merge(
				$this->post_type_helper->get_public_post_types()
			)
		);

		$excluded_post_types = \apply_filters( 'wpseo_indexable_excluded_post_types', [ 'attachment' ] );
		$object_sub_types    = \array_diff( $object_sub_types, $excluded_post_types );

		$wanted_sub_types = [];
		foreach ( $object_sub_types as $sub_type ) {
			if ( $this->post_type_helper->is_indexable( $sub_type ) && $this->post_type_helper->has_metabox( $sub_type ) ) {
				$wanted_sub_types[] = $sub_type;
			}
		}
		return $wanted_sub_types;
	}

	/**
	 * Stores an indexable in an ignore list.
	 *
	 * @param array $params The values to store.
	 *
	 * @return object The response object.
	 */
	protected function add_indexable_to_ignore_list( $params ) {
		$ignore_list_name = $params['type'] . '_ignore_list';
		$ignore_list      = $this->options_helper->get( $ignore_list_name, [] );
		$indexable_id     = intval( $params['id'] );

		if ( ! in_array( $indexable_id, $ignore_list, true ) ) {
			$ignore_list[] = $indexable_id;
		}

		$success = $this->options_helper->set( $ignore_list_name, $ignore_list );

		if ( ! $success ) {
			return (object) [
				'success' => false,
				'status'  => 500,
				'error'   => 'Could not save the option in the database',
			];
		}

		return (object) [
			'success' => true,
			'status'  => 200,
		];
	}

	/**
	 * Removes an indexable from its ignore list.
	 *
	 * @param array $params The values to store.
	 *
	 * @return object The response object.
	 */
	protected function remove_indexable_from_ignore_list( $params ) {
		$ignore_list_name        = $params['type'] . '_ignore_list';
		$ignore_list             = $this->options_helper->get( $ignore_list_name, [] );
		$indexable_to_be_removed = intval( $params['id'] );

		$ignore_list = \array_filter(
			$ignore_list,
			function( $indexable ) use ( $indexable_to_be_removed ) {
				return $indexable !== $indexable_to_be_removed;
			}
		);

		$success = $this->options_helper->set( $ignore_list_name, $ignore_list );

		if ( ! $success ) {
			return (object) [
				'success' => false,
				'status'  => 500,
				'error'   => 'Could not save the option in the database',
			];
		}

		return (object) [
			'success' => true,
			'status'  => 200,
		];
	}
}
