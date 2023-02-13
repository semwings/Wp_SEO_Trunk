<?php
/**
 * WPSEO plugin file.
 *
 * @package WPSEO\Admin
 */

/**
 * Class WPSEO_HelpScout
 *
 * @codeCoverageIgnore
 * @deprecated 20.3
 */
class WPSEO_HelpScout implements WPSEO_WordPress_Integration {

	/**
	 * Whether to asks the user's consent before loading in HelpScout.
	 *
	 * @var bool
	 */
	protected $ask_consent;

	/**
	 * WPSEO_HelpScout constructor.
	 *
	 * @codeCoverageIgnore
	 * @deprecated 20.3
	 *
	 * @param string $beacon_id   The beacon id.
	 * @param array  $pages       The pages where the beacon is loaded.
	 * @param array  $products    The products the beacon is loaded for.
	 * @param bool   $ask_consent Optional. Whether to ask for consent before loading in HelpScout.
	 */
	public function __construct( $beacon_id, array $pages, array $products, $ask_consent = false ) {
		_deprecated_function( __METHOD__, 'WPSEO 20.3' );
	}

	/**
	 * {@inheritDoc}
	 *
	 * @codeCoverageIgnore
	 * @deprecated 20.3
	 */
	public function register_hooks() {
		if ( ! $this->is_beacon_page() ) {
			return;
		}

		_deprecated_function( __METHOD__, 'WPSEO 20.3' );
	}

	/**
	 * Enqueues the HelpScout script.
	 *
	 * @codeCoverageIgnore
	 * @deprecated 20.3
	 */
	public function enqueue_help_scout_script() {
		_deprecated_function( __METHOD__, 'WPSEO 20.3' );
	}

	/**
	 * Outputs a small piece of javascript for the beacon.
	 *
	 * @codeCoverageIgnore
	 * @deprecated 20.3
	 */
	public function output_beacon_js() {
		_deprecated_function( __METHOD__, 'WPSEO 20.3' );
	}
}
