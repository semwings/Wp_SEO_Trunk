<?php

namespace Yoast\WP\SEO\Tests\Unit\Admin;

use Brain\Monkey;
use Mockery;
use WP_User;
use WPSEO_Admin;
use WPSEO_Primary_Term_Admin;
use Yoast\WP\SEO\Helpers\Current_Page_Helper;
use Yoast\WP\SEO\Helpers\Options_Helper;
use Yoast\WP\SEO\Helpers\Product_Helper;
use Yoast\WP\SEO\Helpers\Short_Link_Helper;

use Yoast\WP\SEO\Helpers\Url_Helper;
use Yoast\WP\SEO\Tests\Unit\Doubles\Helpers\Short_Link_Helper_Double;

use Yoast\WP\SEO\Tests\Unit\TestCase;
use Yoast_Dashboard_Widget;

/**
 * Class Admin_Features.
 *
 * @coversDefaultClass WPSEO_Admin
 */
class Admin_Features_Test extends TestCase {

	/**
	 * The options helper.
	 *
	 * @var Mockery\MockInterface
	 */
	private $options_helper;

	/**
	 * The product helper.
	 *
	 * @var Mockery\MockInterface
	 */
	private $product_helper;

	/**
	 * Sets up the class under test and mock objects.
	 */
	public function set_up() {
		parent::set_up();

		$this->options_helper = Mockery::mock( Options_Helper::class );
		$this->product_helper = Mockery::mock( Product_Helper::class );
	}

	/**
	 * Returns an instance with set expectations for the dependencies.
	 *
	 * @return WPSEO_Admin Instance to test against.
	 */
	private function get_admin_with_expectations() {
		$shortlinker = new Short_Link_Helper_Double(
			$this->options_helper,
			$this->product_helper
		);

		Monkey\Functions\expect( 'admin_url' )
			->once()
			->with( '?page=' . WPSEO_Admin::PAGE_IDENTIFIER . '&yoast_dismiss=upsell' )
			->andReturn( 'https://example.org' );

		Monkey\Functions\expect( 'wp_nonce_url' )
			->once()
			->with( 'https://example.org', 'dismiss-5star-upsell' )
			->andReturn( 'https://example.org?_wpnonce=test-nonce' );

			Monkey\Functions\expect( 'wp_get_current_user' )
				->once()
				->andReturn( Mockery::mock( WP_User::class ) );

		return new WPSEO_Admin();
	}

	/**
	 * Sets up the YoastSEO function with the right expectations.
	 */
	private function setup_yoastseo_with_expectations() {
		$this->stubTranslationFunctions();

		$current_page_helper = Mockery::mock( Current_Page_Helper::class );
		$current_page_helper->expects( 'is_yoast_seo_page' )->once()->andReturn( true );

		$product_helper = Mockery::mock( Product_Helper::class );
		$product_helper->expects( 'is_premium' )->once()->andReturn( false );

		$short_link = Mockery::mock( Short_Link_Helper::class );
		$short_link->expects( 'get' )->times( 3 )->andReturn( 'https://www.example.com?some=var' );

		$url_helper = Mockery::mock( Url_Helper::class );
		$url_helper->expects( 'is_plugin_network_active' )->twice()->andReturn( false );

		$container = $this->create_container_with(
			[
				Current_Page_Helper::class => $current_page_helper,
				Product_Helper::class      => $product_helper,
				Short_Link_Helper::class   => $short_link,
				Url_Helper::class          => $url_helper,
			]
		);

		Monkey\Functions\expect( 'YoastSEO' )
			->times( 7 )
			->andReturn( (object) [ 'helpers' => $this->create_helper_surface( $container ) ] );

		Monkey\Functions\expect( 'get_user_locale' )
			->andReturn( 'en_US' );
	}

	/**
	 * Test that admin_features returns the correct array when we're editing/creating a post.
	 *
	 * @covers ::get_admin_features
	 */
	public function test_get_admin_features_ON_post_edit() {
		global $pagenow;
		$pagenow = 'post.php';

		$this->setup_yoastseo_with_expectations();

		$class_instance = $this->get_admin_with_expectations();

		$admin_features = [
			'primary_category' => new WPSEO_Primary_Term_Admin(),
			'dashboard_widget' => new Yoast_Dashboard_Widget(),
		];

		$this->assertEquals( $admin_features, $class_instance->get_admin_features() );
	}

	/**
	 * When we're not on a post edit page, the primary category should not be added to the array.
	 *
	 * @covers ::get_admin_features
	 */
	public function test_get_admin_features_NOT_ON_post_edit() {
		global $pagenow;
		$pagenow = 'index.php';

		$this->setup_yoastseo_with_expectations();

		$class_instance = $this->get_admin_with_expectations();

		$admin_features = [
			'dashboard_widget' => new Yoast_Dashboard_Widget(),
		];

		$this->assertEquals( $admin_features, $class_instance->get_admin_features() );
	}

	/**
	 * Tests the update of contactmethods.
	 *
	 * @covers ::update_contactmethods
	 */
	public function test_update_contactmethods() {
		$this->setup_yoastseo_with_expectations();

		$class_instance = $this->get_admin_with_expectations();
		$result         = $class_instance->update_contactmethods( [] );
		\ksort( $result );

		$this->assertSame(
			[
				'facebook'   => 'Facebook profile URL',
				'instagram'  => 'Instagram profile URL',
				'linkedin'   => 'LinkedIn profile URL',
				'myspace'    => 'MySpace profile URL',
				'pinterest'  => 'Pinterest profile URL',
				'soundcloud' => 'SoundCloud profile URL',
				'tumblr'     => 'Tumblr profile URL',
				'twitter'    => 'Twitter username (without @)',
				'wikipedia'  => 'Wikipedia page about you<br/><small>(if one exists)</small>',
				'youtube'    => 'YouTube profile URL',
			],
			$result
		);
	}
}
