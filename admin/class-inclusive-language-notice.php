<?php
/**
 * WPSEO plugin file.
 *
 * @package WPSEO\Admin
 */

/**
 * Represents the notice for the Inclusive language feature.
 */
class WPSEO_Inclusive_Language_Notice {

	/**
	 * Holds the name of the user meta key.
	 *
	 * The value of this database field holds whether the user has dismissed this notice or not.
	 *
	 * @var string
	 */
	const USER_META_DISMISSED = 'wpseo-remove-inclusive-language-notice';

	/**
	 * Holds the option name.
	 *
	 * @var string
	 */
	const OPTION_NAME = 'wpseo';

	/**
	 * Holds the options.
	 *
	 * @var array
	 */
	protected $options;

	/**
	 * Holds the notification center.
	 *
	 * @var Yoast_Notification_Center
	 */
	protected $notification_center;

	/**
	 * Sets the options, because they always have to be there on instance.
	 *
	 * @param Yoast_Notification_Center $notification_center  The notification center to add notifications to.
	 */
	public function __construct( Yoast_Notification_Center $notification_center ) {
		$this->options              = $this->get_options();
		$this->notification_center  = $notification_center;
	}

	/**
	 * Listener for the upsell notice.
	 */
	public function dismiss_notice_listener() {
		if ( filter_input( INPUT_GET, 'yoast_dismiss' ) !== 'upsell' ) {
			return;
		}

		$this->dismiss_notice();

		wp_safe_redirect( admin_url( 'admin.php?page=wpseo_dashboard' ) );
		exit;
	}

	/**
	 * Adds a notification to the notification center.
	 */
	public function add_notification() {
		$this->notification_center->add_notification( $this->get_notification() );
	}

	/**
	 * Removes a notification from the notification center.
	 */
	public function remove_notification() {
		$this->notification_center->remove_notification( $this->get_notification() );
	}

	/**
	 * Gets the notification value.
	 *
	 * @return Yoast_Notification
	 */
	protected function get_notification() {
		$message = sprintf(
			/* translators: %1$s is a link to the Features tab on the Yoast Dashboard page, %2$s is a link to the blog post about this feature, %3$s is the link closing tag. */
				__( '<strong>New in Yoast SEO Premium 19.2:</strong> Did you know that you can now enable the %1$sinclusive language feature%3$s to retrieve feedback on inclusive language use? %2$sLearn more about this feature%3$s.', 'wordpress-seo' ),
				'<a href="' . admin_url( 'admin.php?page=wpseo_dashboard#top#features' ) . '">',
				'<a href="' . WPSEO_Shortlinker::get( 'https://yoa.st/inclusive-language-analysis' ) . '">',
				'</a>'
			);

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
	 */
	protected function dismiss_notice() {
		update_user_meta( get_current_user_id(), self::USER_META_DISMISSED, true );
	}

	/**
	 * Returns the set options.
	 *
	 * @return mixed
	 */
	protected function get_options() {
		return get_option( self::OPTION_NAME );
	}

	/**
	 * Saves the options to the database.
	 */
	protected function save_options() {
		update_option( self::OPTION_NAME, $this->options );
	}
}
