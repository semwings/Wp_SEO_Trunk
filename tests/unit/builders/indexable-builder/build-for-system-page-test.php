<?php

namespace Yoast\WP\SEO\Tests\Unit\Builders\Indexable_Builder;

use Yoast\WP\SEO\Tests\Unit\Builders\Indexable_Builder\Abstract_Indexable_Builder_TestCase;

/**
 * Build_For_System_Page_Test.
 *
 * @group indexables
 * @group builders
 *
 * @coversDefaultClass \Yoast\WP\SEO\Builders\Indexable_Builder
 */
class Build_For_System_Page_Test extends Abstract_Indexable_Builder_TestCase {

	/**
	 * Sets up the test.
	 */
	protected function set_up() {
		parent::set_up();

		$this->indexable->object_type     = 'system-page';
		$this->indexable->object_sub_type = '404';

		$this->instance->set_indexable_repository( $this->indexable_repository );
	}

	/**
	 * Tests building an indexable for a system page.
	 *
	 * @covers ::build_for_system_page
	 * @covers ::ensure_indexable
	 * @covers ::build
	 * @covers ::save_indexable
	 */
	public function test_build_for_system_page() {

		$defaults = [
			'object_type'     => 'system-page',
			'object_sub_type' => '404',
		];
		$this->expect_build( $defaults );

		$this->assertSame( $this->indexable, $this->instance->build_for_system_page( '404' ) );
	}

	/**
	 * Expectation for build method.
	 *
	 * @param array $defaults The defaults to expect.
	 */
	public function expect_build( $defaults ) {

		$this->expect_ensure_indexable( $defaults, $this->indexable );

		$this->system_page_builder
			->expects( 'build' )
			->once()
			->with( '404', $this->indexable )
			->andReturn( $this->indexable );

		// Saving is outside the scope of this test.
		$this->expect_save_indexable_skip();
	}
}
