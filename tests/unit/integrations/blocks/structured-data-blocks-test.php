<?php

namespace Yoast\WP\SEO\Tests\Unit\Integrations\Blocks;

use Mockery;
use Yoast\WP\SEO\Integrations\Blocks\Structured_Data_Blocks;
use WPSEO_Admin_Asset_Manager;
use Yoast\WP\SEO\Helpers\Image_Helper;
use Yoast\WP\SEO\Tests\Unit\TestCase;

/**
 * Class Structure_Data_Blocks_Test.
 *
 * @coversDefaultClass \Yoast\WP\SEO\Integrations\Blocks\Structured_Data_Blocks
 *
 * @group integrations
 */
class Structured_Data_Blocks_Test extends TestCase {

	/**
	 * Represents the instance we are testing.
	 *
	 * @var Mockery\MockInterface|Structured_Data_Blocks
	 */
	protected $instance;

	/**
	 * Holds the WPSEO_Admin_Asset_Manager.
	 *
	 * @var Mockery\MockInterface|WPSEO_Admin_Asset_Manager
	 */
	protected $asset_manager;

	/**
	 * The mocked image helper.
	 *
	 * @var Mockery\MockInterface|Image_Helper
	 */
	protected $image_helper;

	/**
	 * Sets an instance for test purposes.
	 */
	protected function set_up() {
		parent::set_up();

		$this->stubTranslationFunctions();

		$this->asset_manager = Mockery::mock( WPSEO_Admin_Asset_Manager::class );
		$this->image_helper  = Mockery::mock( Image_Helper::class );

		$this->instance = new Structured_Data_Blocks(
			$this->asset_manager,
			$this->image_helper
		);
	}

	/**
	 * Tests __construct method.
	 *
	 * @covers ::__construct
	 */
	public function test_construct() {
		static::assertInstanceOf(
			Structured_Data_Blocks::class,
			new Structured_Data_Blocks(
				$this->asset_manager,
				$this->image_helper
			)
		);
	}

	/**
	 * Data provider for the test_optimize_how_to_images method.
	 *
	 * @return array[]
	 */
	public function how_to_block_provider() {
		return [
			[
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">The amount of time it will take:&nbsp;</span>2 hours and 20 minutes</p>',
				[
					'durationText'        => 'The amount of time it will take:',
					'defaultDurationText' => 'Time needed:',
					'hours'               => 2,
					'minutes'             => 20,
				],
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>2 hours and 20 minutes</p>',
				'A test case for when the non-default duration text is available',
			],
			[
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>1 hour and 20 minutes</p>',
				[
					'defaultDurationText' => 'Time needed:',
					'hours'               => 1,
					'minutes'             => 20,
				],
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>1 hour and 20 minutes</p>',
				'A test case for when the non-default duration text is not available',
			],
			[
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>2 days, 1 hour and 20 minutes</p>',
				[
					'defaultDurationText' => 'Time needed:',
					'days'                => 2,
					'hours'               => 1,
					'minutes'             => 20,
				],
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>2 days, 1 hour and 20 minutes</p>',
				'A test case for when the time units for days, hours and minutes are available',
			],
			[
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>3 hours</p>',
				[
					'defaultDurationText' => 'Time needed:',
					'days'                => 0,
					'hours'               => 3,
					'minutes'             => 0,
				],
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>3 hours</p>',
				'A test case for when the time units are only available for hours',
			],
			[
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>45 minutes</p>',
				[
					'defaultDurationText' => 'Time needed:',
					'days'                => 0,
					'hours'               => 0,
					'minutes'             => 45,
				],
				'<p class="schema-how-to-total-time"><span class="schema-how-to-duration-time-text">Time needed:&nbsp;</span>45 minutes</p>',
				'A test case for when the time units are only available for minutes',
			],
			[
				'<p>The <b>Norwegian Forest cat</b> (Norwegian: <i lang="no"><b>Norsk skogskatt</b></i> and <b><span title="Norwegian-language text"><i lang="no">Norsk skaukatt</i></span></b>) is a breed of domestic cat originating in Northern Europe.',
				[
					'defaultDurationText' => 'Time needed:',
					'days'                => 0,
					'hours'               => 0,
					'minutes'             => 0,
				],
				'<p>The <b>Norwegian Forest cat</b> (Norwegian: <i lang="no"><b>Norsk skogskatt</b></i> and <b><span title="Norwegian-language text"><i lang="no">Norsk skaukatt</i></span></b>) is a breed of domestic cat originating in Northern Europe.',
				'A test case for when the element with "schema-how-to-total-time" class name is not output in the content',
			],
		];
	}

	/**
	 * Tests that present returns the expected content.
	 *
	 * @covers       ::present_duration_text
	 * @dataProvider how_to_block_provider
	 *
	 * @param string $expected The expected content.
	 * @param array  $attributes The block attributes.
	 * @param string $content The post content.
	 * @param string $message The error message if the assert fails.
	 */
	public function test_present_duration_text( $expected, $attributes, $content, $message ) {
		$this->assertSame(
			$expected,
			$this->instance->present_duration_text(
				$attributes,
				$content
			),
			$message
		);
	}
}
