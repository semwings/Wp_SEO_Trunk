<?php
/**
 * WPSEO plugin file.
 *
 * @package WPSEO\Admin
 */

/**
 * Represents the notice for the Inclusive language feature.
 *
 * @deprecated 19.7
 */
class WPSEO_Inclusive_Language_Notice {

	/**
	 * Holds the name of the user meta key.
	 *
	 * The value of this database field holds whether the user has dismissed this notice or not.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @var string
	 */
	const USER_META_DISMISSED = 'wpseo-remove-inclusive-language-notice';

	/**
	 * Holds the option name.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @var string
	 */
	const OPTION_NAME = 'wpseo';

	/**
	 * The Premium version in which the Inclusive language feature was added.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 */
	const PREMIUM_VERSION_ADDED = '19.2-RC1';

	/**
	 * Holds the notification center.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @var Yoast_Notification_Center
	 */
	protected $notification_center;

	/**
	 * WPSEO_Inclusive_Language_Notice constructor.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @param Yoast_Notification_Center $notification_center The notification center to add notifications to.
	 */
	public function __construct( Yoast_Notification_Center $notification_center ) {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		$this->notification_center = $notification_center;
	}

	/**
	 * Listener for the notice.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 */
	public function dismiss_notice_listener() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		if ( filter_input( INPUT_GET, 'yoast_dismiss' ) !== 'upsell' ) {
			return;
		}

		$this->dismiss_notice();

		wp_safe_redirect( admin_url( 'admin.php?page=wpseo_dashboard' ) );
		exit;
	}

	/**
	 * Adds a notification to the notification center.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 */
	public function add_notification() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		$this->notification_center->add_notification( $this->get_notification() );
	}

	/**
	 * Removes a notification from the notification center.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 */
	public function remove_notification() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		$this->notification_center->remove_notification( $this->get_notification() );
	}

	/**
	 * Whether the notification should be shown.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @return bool Whether or not the notification should be shown.
	 */
	public function should_show_notification() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		$availability = new WPSEO_Metabox_Analysis_Inclusive_Language();

		return YoastSEO()->helpers->product->is_premium()
			&& YoastSEO()->helpers->language->has_inclusive_language_support( \WPSEO_Language_Utils::get_language( \get_locale() ) )
			&& ! $availability->is_globally_enabled()
			&& \version_compare( YoastSEO()->helpers->product->get_premium_version(), self::PREMIUM_VERSION_ADDED, '>=' );
	}

	/**
	 * Gets the notification value.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 *
	 * @return Yoast_Notification
	 */
	protected function get_notification() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		if ( is_multisite() && get_site_option( 'wpseo_ms' )['allow_inclusive_language_analysis_active'] === false ) {
			$message = sprintf(
			/* translators: %1$s is a link to the Features tab on the Yoast SEO Dashboard page, %2$s is a link to the blog post about this feature, %3$s is the link closing tag. */
				__(
					'<strong>New in Yoast SEO Premium 19.2:</strong> Did you know that you can now get feedback on the use of inclusive language? This feature is disabled by default. Please contact your Network admin if you want to enable it. %2$sLearn more about this feature%3$s.',
					'wordpress-seo'
				),
				'<a href="' . admin_url( 'admin.php?page=wpseo_dashboard#top#features' ) . '">',
				'<a href="' . WPSEO_Shortlinker::get( 'https://yoa.st/inclusive-language-notification' ) . '" target="_blank">',
				'</a>'
			);
		}
		else {
			$message = sprintf(
			/* translators: %1$s is a link to the Features tab on the Yoast SEO Dashboard page, %2$s is a link to the blog post about this feature, %3$s is the link closing tag. */
				__(
					'<strong>New in Yoast SEO Premium 19.2:</strong> Did you know that you can now %1$senable the beta version of our inclusive language feature%3$s to get feedback on the use of inclusive language? This feature is disabled by default. %2$sLearn more about this feature%3$s.',
					'wordpress-seo'
				),
				'<a href="' . admin_url( 'admin.php?page=wpseo_dashboard#top#features' ) . '">',
				'<a href="' . WPSEO_Shortlinker::get( 'https://yoa.st/inclusive-language-notification' ) . '" target="_blank">',
				'</a>'
			);
		}

		$notification = new Yoast_Notification(
			$message,
			[
				'type'         => Yoast_Notification::WARNING,
				'id'           => 'wpseo-inclusive-language-notice',
				'capabilities' => 'wpseo_manage_options',
				'priority'     => 0.8,
			]
		);

		return $notification;
	}

	/**
	 * Dismisses the notice.
	 *
	 * @deprecated 19.7
	 * @codeCoverageIgnore
	 */
	protected function dismiss_notice() {
		_deprecated_function( __METHOD__, 'WPSEO 19.7' );

		update_user_meta( get_current_user_id(), self::USER_META_DISMISSED, true );
	}
}
