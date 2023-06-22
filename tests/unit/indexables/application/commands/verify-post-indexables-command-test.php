<?php

namespace Yoast\WP\SEO\Tests\Unit\Indexables\Application\Commands;

use Yoast\WP\SEO\Indexables\Application\Commands\Verify_Non_Timestamp_Indexables_Command;
use Yoast\WP\SEO\Indexables\Application\Commands\Verify_Post_Indexables_Command;
use Yoast\WP\SEO\Indexables\Domain\Batch_Size;
use Yoast\WP\SEO\Indexables\Domain\Current_Verification_Action;
use Yoast\WP\SEO\Indexables\Domain\Last_Batch_Count;
use Yoast\WP\SEO\Indexables\Domain\Plugin_Deactivated_Timestamp;
use Yoast\WP\SEO\Tests\Unit\TestCase;

/**
 * The Verify_Non_Timestamp_Indexables_Command_Test class.
 *
 * @group indexables
 *
 * @coversDefaultClass \Yoast\WP\SEO\Indexables\Application\Commands\Verify_Post_Indexables_Command
 */
class Verify_Post_Indexables_Command_Test extends TestCase {

	/**
	 * @var \Yoast\WP\SEO\Indexables\Application\Commands\Verify_Post_Indexables_Command
	 */
	private $instance;

	/**
	 * @return void
	 */
	protected function setUp(): void {
		parent::setUp();

		$this->instance = new Verify_Post_Indexables_Command( 10, 10, \time() );
	}

	/**
	 * Tests the last batch count object.
	 * @covers ::get_last_batch_count
	 *
	 * @return void
	 */
	public function test_get_last_batch_count() {
		$this->assertEquals( new Last_Batch_Count( 10 ), $this->instance->get_last_batch_count() );
	}

	/**
	 * Tests getting the plugin deactivated at object.
	 *
	 * @covers ::get_plugin_deactivated_at
	 * @return void
	 */
	public function test_get_plugin_deactivated_at() {
		$this->assertEquals( new Plugin_Deactivated_Timestamp( \time() ), $this->instance->get_plugin_deactivated_at() );
	}

	/**
	 * Test getting the batch size object.
	 *
	 * @covers ::get_batch_size
	 * @return void
	 */
	public function test_get_batch_size() {
		$this->assertEquals( new Batch_Size( 10 ), $this->instance->get_batch_size() );
	}

}
