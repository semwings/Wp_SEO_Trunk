import classNames from "classnames";
import PropTypes from "prop-types";
import { forwardRef } from "@wordpress/element";

const classNameMap = {
	variant: {
		"default": "",
		block: "yst-code--block",
	},
};

/**
 * @param {JSX.node} children The content.
 * @param {string} [variant] Optional variant. See `classNameMap.variant`.
 * @param {string} [className] Optional extra className.
 * @param {Object} [props] Optional extra props.
 * @returns {JSX.Element} The Code element.
 */
const Code = forwardRef( ( { children, variant = "default", className = "", ...props }, ref ) => (
	<code
		ref={ ref }
		className={ classNames( "yst-code", classNameMap.variant[ variant ], className ) }
		{ ...props }
	>
		{ children }
	</code>
) );

Code.propTypes = {
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf( Object.keys( classNameMap.variant ) ),
	className: PropTypes.string,
};

export default Code;
