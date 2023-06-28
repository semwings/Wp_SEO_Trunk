<?php

namespace Yoast\WP\SEO\Tests\Unit\Indexables\Domain;

use Brain\Monkey;
use Mockery;
use Yoast\WP\SEO\Conditionals\Admin_Conditional;
use Yoast\WP\SEO\Helpers\Options_Helper;
use Yoast\WP\SEO\Indexables\Application\Commands\Verify_Non_Timestamp_Indexables_Command_Handler;
use Yoast\WP\SEO\Indexables\Application\Cron_Verification_Gate;
use Yoast\WP\SEO\Indexables\Application\Next_Verification_Action_Handler;
use Yoast\WP\SEO\Indexables\Application\Verification_Cron_Batch_Handler;
use Yoast\WP\SEO\Indexables\Application\Verification_Cron_Schedule_Handler;
use Yoast\WP\SEO\Indexables\User_Interface\Mark_Deactivation_Integration;
use Yoast\WP\SEO\Indexables\User_Interface\Verification_No_Timestamp_Cron_Callback_Integration;
use Yoast\WP\SEO\Tests\Unit\TestCase;

/**
 * The Verification_No_Timestamp_Cron_Callback_Integration_Test class.
 *
 * @group indexables
 *
 * @coversDefaultClass \Yoast\WP\SEO\Indexables\User_Interface\Verification_No_Timestamp_Cron_Callback_Integration
 */
class Verification_No_Timestamp_Cron_Callback_Integration_Test extends TestCase {

	/**
	 * @var \Yoast\WP\SEO\Indexables\User_Interface\Verification_No_Timestamp_Cron_Callback_Integration
	 */
	private $instance;

	/**
	 * @var \Mockery\MockInterface|\Yoast\WP\SEO\Helpers\Options_Helper
	 */
	private $options_helper;

	/**
	 * @var \Mockery\MockInterface|Verification_Cron_Schedule_Handler
	 */
	private $cron_schedule_handler;

	/**
	 * @var \Mockery\MockInterface|Cron_Verification_Gate
	 */
	private $cron_verification_gate;

	/**
	 * @var \Mockery\MockInterface|Verification_Cron_Batch_Handler
	 */
	private $verification_cron_batch_handler;

	/**
	 * @var \Mockery\MockInterface|Verify_Non_Timestamp_Indexables_Command_Handler
	 */
	private $verify_non_timestamp_indexables_command_handler;

	/**
	 * @var \Mockery\MockInterface|Next_Verification_Action_Handler
	 */
	private $next_verification_action_handler;

	/**
	 * The setup function.
	 *
	 * @return void
	 */
	protected function setUp(): void {
		parent::setUp();

		$this->cron_verification_gate                          = Mockery::mock( Cron_Verification_Gate::class );
		$this->cron_schedule_handler                           = Mockery::mock( Verification_Cron_Schedule_Handler::class );
		$this->options_helper                                  = Mockery::mock( Options_Helper::class );
		$this->verification_cron_batch_handler                 = Mockery::mock( Verification_Cron_Batch_Handler::class );
		$this->verify_non_timestamp_indexables_command_handler = Mockery::mock( Verify_Non_Timestamp_Indexables_Command_Handler::class );
		$this->next_verification_action_handler                = Mockery::mock( Next_Verification_Action_Handler::class );

		$this->instance = new Verification_No_Timestamp_Cron_Callback_Integration( $this->cron_verification_gate, $this->cron_schedule_handler, $this->options_helper, $this->verification_cron_batch_handler, $this->verify_non_timestamp_indexables_command_handler, $this->next_verification_action_handler );
	}

	/**
	 * Tests the register_hooks function.
	 *
	 * @covers ::register_hooks
	 * @return void
	 */
	public function test_register_hooks() {
		Monkey\Functions\expect( 'add_action' )
			->with(
				Verification_Cron_Schedule_Handler::INDEXABLE_VERIFY_NON_TIMESTAMPED_INDEXABLES_NAME,
				[
					$this->instance,
					'start_verify_non_timestamped_indexables',
				]
			);

		$this->instance->register_hooks();
	}

	/**
	 * Tests the get function.
	 *
	 * @covers ::get_conditionals
	 * @return void
	 */
	public function test_get_conditionals() {
		$this->assertEquals(
			[
				Admin_Conditional::class,
			],
			Verification_No_Timestamp_Cron_Callback_Integration::get_conditionals()
		);
	}

	/**
	 * Tests the `start_verify_non_timestamped_indexables` while a cron is already running.
	 *
	 * @covers ::start_verify_non_timestamped_indexables
	 *
	 * @return void
	 */
	public function test_start_verify_non_timestamped_indexables_doing_cron() {
		Monkey\Functions\expect( 'wp_doing_cron' )->andReturnTrue();
		$this->cron_schedule_handler->expects( 'unschedule_verify_non_timestamped_indexables_cron' )->once();
		$this->instance->start_verify_non_timestamped_indexables();
	}

	/**
	 * Tests the `start_verify_non_timestamped_indexables` when no cron is running and indexables are enabled.
	 *
	 * @covers ::start_verify_non_timestamped_indexables
	 *
	 * @return void
	 */
	public function test_start_verify_non_timestamped_indexables_indexables_disabled() {
		Monkey\Functions\expect( 'wp_doing_cron' )->andReturnFalse();
		$this->cron_verification_gate->expects( 'should_verify_on_cron' )->andReturnFalse();
		$this->cron_schedule_handler->expects( 'unschedule_verify_non_timestamped_indexables_cron' )->once();
		$this->instance->start_verify_non_timestamped_indexables();
	}

	/**
	 * Tests the `start_verify_non_timestamped_indexables` in a normal flow.
	 *
	 * @covers ::start_verify_non_timestamped_indexables
	 *
	 * @return void
	 */
	public function test_start_verify_non_timestamped_indexables() {
		Monkey\Functions\expect( 'wp_doing_cron' )->andReturnFalse();
		$this->cron_verification_gate->expects( 'should_verify_on_cron' )->andReturnTrue();
		$this->cron_schedule_handler->expects( 'unschedule_verify_non_timestamped_indexables_cron' )->never();

		$this->verification_cron_batch_handler->expects( 'get_current_non_timestamped_indexables_batch' )->andReturn( 10 );
		$this->options_helper->expects( 'get' )
			->with( Mark_Deactivation_Integration::PLUGIN_DEACTIVATED_AT_OPTION, \time() )->andReturn( \time() );
		$this->next_verification_action_handler->expects( 'get_current_verification_action' )->andReturn( 'term' );

		$this->verify_non_timestamp_indexables_command_handler->expects( 'handle' );

		$this->instance->start_verify_non_timestamped_indexables();
	}
}
