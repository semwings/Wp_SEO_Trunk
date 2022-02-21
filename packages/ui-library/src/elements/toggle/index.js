import classNames from "classnames";
import PropTypes from "prop-types";
import { noop } from "lodash";
import { Switch, Transition } from "@headlessui/react";
import { CheckIcon, XIcon } from "@heroicons/react/solid";

/**
 * @param {string|JSX.Element} [as="button"] Base component.
 * @param {string} id Identifier.
 * @param {boolean} [checked] Default state.
 * @param {Function} onChange Change callback.
 * @param {boolean} [disabled] Disabled flag.
 * @param {string} [className] CSS class.
 * @returns {JSX.Element} Toggle component.
 */
const Toggle = ( {
	as: Component,
	id,
	checked,
	onChange,
	disabled,
	className,
	...props
} ) => (
	<Switch
		as={ Component }
		id={ id }
		checked={ checked }
		aria-disabled={ disabled }
		onChange={ disabled ? noop : onChange }
		className={ classNames(
			"yst-toggle",
			checked && "yst-toggle--checked",
			disabled && "yst-toggle--disabled",
			className,
		) }
		{ ...props }
	>
		<span className="yst-toggle__handle">
			<Transition
				show={ checked }
				unmount={ false }
				as="span"
				aria-hidden={ ! checked }
				enter=""
				enterFrom="yst-opacity-0 yst-hidden"
				enterTo="yst-opacity-100"
				leaveFrom="yst-opacity-100"
				leaveTo="yst-opacity-0 yst-hidden"
			>
				<CheckIcon className="yst-toggle__icon yst-toggle__icon--check" />
			</Transition>
			<Transition
				show={ ! checked }
				unmount={ false }
				as="span"
				aria-hidden={ checked }
				enterFrom="yst-opacity-0 yst-hidden"
				enterTo="yst-opacity-100"
				leaveFrom="yst-opacity-100"
				leaveTo="yst-opacity-0 yst-hidden"
			>
				<XIcon className="yst-toggle__icon yst-toggle__icon--x" />
			</Transition>
		</span>
	</Switch>
);

Toggle.propTypes = {
	as: PropTypes.elementType,
	id: PropTypes.string.isRequired,
	checked: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

Toggle.defaultProps = {
	as: "button",
	checked: false,
	disabled: false,
	className: "",
};

export default Toggle;
