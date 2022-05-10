<?php
/**
 * WPSEO plugin test file.
 *
 * @package Yoast\Tests\Admin
 */

/**
 * Class Yoast_Form_Double.
 */
class Yoast_Form_Double extends Yoast_Form {

	/**
	 * Wrapper calling the parent method to make it public and unit-testable.
	 *
	 * @param string $variable The variable within the option to check whether its control should be disabled.
	 *
	 * @return bool True if control should be disabled, false otherwise.
	 */
	public function is_control_disabled( $variable ) {
		return parent::is_control_disabled( $variable );
	}
}
