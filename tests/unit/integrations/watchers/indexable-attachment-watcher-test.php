<?php

namespace Yoast\WP\SEO\Tests\Unit\Integrations\Watchers;

use Brain\Monkey;
use Mockery;
use Yoast_Notification_Center;
use Yoast\WP\SEO\Tests\Unit\TestCase;
use Yoast\WP\SEO\Config\Indexing_Reasons;
use Yoast\WP\SEO\Helpers\Indexing_Helper;
use Yoast\WP\SEO\Integrations\Cleanup_Integration;
use Yoast\WP\SEO\Helpers\Attachment_Cleanup_Helper;
use Yoast\WP\SEO\Conditionals\Migrations_Conditional;
use Yoast\WP\SEO\Actions\Indexing\Indexable_Post_Indexation_Action;
use Yoast\WP\SEO\Integrations\Watchers\Indexable_Attachment_Watcher;


/**
 * Class Indexable_Attachment_Watcher_Test.
 *
 * @group indexables
 * @group integrations
 * @group watchers
 *
 * @coversDefaultClass Yoast\WP\SEO\Integrations\Watchers\Indexable_Attachment_Watcher
 * @covers Yoast\WP\SEO\Integrations\Watchers\Indexable_Attachment_Watcher
 */
class Indexable_Attachment_Watcher_Test extends TestCase {

	/**
	 * The indexing helper.
	 *
	 * @var Indexing_Helper
	 */
	protected $indexing_helper;

	/**
	 * The attachment cleanup helper.
	 *
	 * @var Attachment_Cleanup_Helper
	 */
	protected $attachment_cleanup;

	/**
	 * The notifications center.
	 *
	 * @var Yoast_Notification_Center
	 */
	protected $notification_center;

	/**
	 * The Indexable_Attachment_Watcher instance.
	 *
	 * @var Indexable_Attachment_Watcher
	 */
	protected $instance;

	/**
	 * Sets up the tests.
	 */
	protected function set_up() {
		parent::set_up();

		$this->indexing_helper     = Mockery::mock( Indexing_Helper::class );
		$this->attachment_cleanup  = Mockery::mock( Attachment_Cleanup_Helper::class );
		$this->notification_center = Mockery::mock( Yoast_Notification_Center::class );

		$this->instance = new Indexable_Attachment_Watcher(
			$this->indexing_helper,
			$this->attachment_cleanup,
			$this->notification_center
		);
	}

	/**
	 * Tests the get_conditionals method.
	 *
	 * @covers ::get_conditionals
	 */
	public function test_get_conditionals() {
		$this->assertSame( [ Migrations_Conditional::class ], $this->instance->get_conditionals() );
	}

	/**
	 * Tests the register_hooks method.
	 *
	 * @covers ::register_hooks
	 */
	public function test_register_hooks() {

		Monkey\Actions\expectAdded( 'update_option_wpseo_titles' )
			->with( [ $this->instance, 'check_option' ] )
			->once();

		$this->instance->register_hooks();
	}

	/**
	 * Data provider for test_check_option.
	 *
	 * @return array $old_value,$new_value, $delete_transient_times, $set_reason_times, $attachment_cleanup_times, wp_next_scheduled, $schedule_event_times.
	 */
	public function check_option_provider() {
		return [

			'Old and new values are not arrays' => [
				'old_value'                => 1,
				'new_value'                => 2,
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],

			'Old and new values are empty arrays' => [
				'old_value'                => [],
				'new_value'                => [],
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old value is empty array and new doesnt have disable-attachment key' => [
				'old_value'                => [],
				'new_value'                => [ 'test' => 'test' ],
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old value doesnt have disable-attachment key and new value is empty array' => [
				'old_value'                => [ 'test' => 'test' ],
				'new_value'                => [],
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old and new values doesnt have disable-attachment key' => [
				'old_value'                => [ 'test' => 'test' ],
				'new_value'                => [ 'test' => 'test' ],
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old value is false and new value doesnt have disable-attachment key' => [
				'old_value'                => false,
				'new_value'                => [ 'test' => 'test' ],
				'delete_transient_times'   => 0,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old and new values have disable-attachment key, old true, new false' => [
				'old_value'                => [ 'disable-attachment' => true ],
				'new_value'                => [ 'disable-attachment' => false ],
				'delete_transient_times'   => 1,
				'set_reason_times'         => 1,
				'attachment_cleanup_times' => 0,
				'wp_next_scheduled'        => null,
				'schedule_event_times'     => 0,
			],
			'Old and new values have disable-attachment key, old false, new true' => [
				'old_value'                => [ 'disable-attachment' => false ],
				'new_value'                => [ 'disable-attachment' => true ],
				'delete_transient_times'   => 1,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 1,
				'wp_next_scheduled'        => true,
				'schedule_event_times'     => 0,
			],
			'Old and new values have disable-attachment key, old false, new true' => [
				'old_value'                => [ 'disable-attachment' => false ],
				'new_value'                => [ 'disable-attachment' => true ],
				'delete_transient_times'   => 1,
				'set_reason_times'         => 0,
				'attachment_cleanup_times' => 1,
				'wp_next_scheduled'        => false,
				'schedule_event_times'     => 1,
			],
		];
	}

	/**
	 * Tests the check_option method.
	 *
	 * @covers ::check_option
	 *
	 * @dataProvider check_option_provider
	 *
	 * @param mixed $old_value                Old value.
	 * @param mixed $new_value                New value.
	 * @param int   $delete_transient_times   Number of times delete_transient should be called.
	 * @param int   $set_reason_times         Number of times set_reason should be called.
	 * @param int   $attachment_cleanup_times Number of times attachment_cleanup should be called.
	 * @param mixed $wp_next_scheduled        Value of wp_next_scheduled.
	 * @param int   $schedule_event_times     Number of times schedule_event should be called.
	 */
	public function test_check_option( $old_value, $new_value, $delete_transient_times, $set_reason_times, $attachment_cleanup_times, $wp_next_scheduled, $schedule_event_times ) {

		Monkey\Functions\expect( 'delete_transient' )
			->with( Indexable_Post_Indexation_Action::UNINDEXED_COUNT_TRANSIENT )
			->times( $delete_transient_times );

		Monkey\Functions\expect( 'delete_transient' )
			->with( Indexable_Post_Indexation_Action::UNINDEXED_LIMITED_COUNT_TRANSIENT )
			->times( $delete_transient_times );

		$this->indexing_helper
			->expects( 'set_reason' )
			->with( Indexing_Reasons::REASON_ATTACHMENTS_MADE_ENABLED )
			->times( $set_reason_times );

		$this->attachment_cleanup
			->expects( 'remove_attachment_indexables' )
			->with( false )
			->times( $attachment_cleanup_times );

		$this->attachment_cleanup
			->expects( 'clean_attachment_links_from_target_indexable_ids' )
			->with( false )
			->times( $attachment_cleanup_times );

		Monkey\Functions\expect( 'wp_next_scheduled' )
			->with( Cleanup_Integration::START_HOOK )
			->times( $attachment_cleanup_times )
			->andReturn( $wp_next_scheduled );

			Monkey\Functions\expect( 'wp_schedule_single_event' )
				->with( ( time() + ( \MINUTE_IN_SECONDS * 5 ) ), Cleanup_Integration::START_HOOK )
				->times( $schedule_event_times );

		$this->instance->check_option( $old_value, $new_value );
	}
}
