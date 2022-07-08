import { ChevronDownIcon, ChevronUpIcon, MenuAlt2Icon, XIcon } from "@heroicons/react/outline";
import { createContext, useContext } from "@wordpress/element";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useToggleState } from "../../hooks";

const NavigationContext = createContext( { activePath: "" } );

/**
 * @returns {Object} The navigation context.
 */
export const useNavigationContext = () => useContext( NavigationContext );

/**
 * @param {string} label The label.
 * @param {JSX.ElementClass} [as] The field component.
 * @param {string} [pathProp] The key of the path in the props. Defaults to `href`.
 * @param {Object} [props] Extra props.
 * @returns {JSX.Element} The submenu item element.
 */
const SubmenuItem = ( { as: Component = "a", pathProp = "href", label, ...props } ) => {
	const { activePath } = useNavigationContext();

	return (
		<li>
			<Component
				className={ classNames(
					"yst-group yst-flex yst-items-center yst-px-3 yst-py-2 yst-text-sm yst-font-medium yst-rounded-md hover:yst-text-gray-900 hover:yst-bg-gray-50 yst-no-underline focus:yst-outline-none",
					activePath === props[ pathProp ] ? "yst-bg-gray-200 yst-text-gray-900" : "yst-text-gray-600",
				) }
				{ ...props }
			>
				{ label }
			</Component>
		</li>
	);
};

SubmenuItem.propTypes = {
	as: PropTypes.elementType,
	pathProp: PropTypes.string,
	label: PropTypes.node.isRequired,
	isActive: PropTypes.bool,
};

/**
 * @param {string} label The label.
 * @param {JSX.Element} [icon] Optional icon to put before the label.
 * @param {JSX.node} [children] Optional sub menu.
 * @param {boolean} [defaultOpen] Whether the sub menu starts opened.
 * @param {Object} [props] Extra props.
 * @returns {JSX.Element} The menu item element.
 */
const MenuItem = ( { label, icon: Icon = null, children = null, defaultOpen = true, ...props } ) => {
	const [ isOpen, toggleOpen ] = useToggleState( defaultOpen );
	const ChevronIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

	return (
		<div>
			<button
				className="yst-group yst-flex yst-w-full yst-items-center yst-justify-between yst-text-sm yst-font-medium yst-text-gray-800 yst-rounded-md yst-no-underline yst-px-3 yst-py-2 yst-mb-1 hover:yst-text-gray-900 hover:yst-bg-gray-50 focus:yst-outline-none focus:yst-ring-2 focus:yst-ring-primary-500"
				onClick={ toggleOpen }
				{ ...props }
			>
				<span className="yst-flex yst-items-center">
					{ Icon &&
						<Icon className="yst-flex-shrink-0 yst--ml-1 yst-mr-3 yst-h-6 yst-w-6 yst-text-gray-400 group-hover:yst-text-gray-500" />
					}
					{ label }
				</span>
				<ChevronIcon className="yst-h-4 yst-w-4 yst-text-gray-400 group-hover:yst-text-gray-500 yst-stroke-3" />
			</button>
			{ isOpen && children && <ul className="yst-ml-8 yst-space-y-1">
				{ children }
			</ul> }
		</div>
	);
};

MenuItem.propTypes = {
	label: PropTypes.string.isRequired,
	icon: PropTypes.elementType,
	defaultOpen: PropTypes.bool,
	children: PropTypes.node,
};

/**
 * @param {JSX.node} children The menu items.
 * @param {string} [openButtonScreenReaderText] The open button screen reader text.
 * @param {string} [closeButtonScreenReaderText] The close button screen reader text.
 * @returns {JSX.Element} The mobile element.
 */
const Mobile = ( { children, openButtonScreenReaderText = "Open", closeButtonScreenReaderText = "Close" } ) => {
	const [ isOpen, toggleOpen ] = useToggleState( false );

	return <>
		{ isOpen && <>
			<div role="dialog" aria-modal="true" className="yst-fixed yst-inset-0 yst-flex yst-z-40">
				<div className="yst-relative yst-max-w-xs yst-w-full yst-bg-white yst-p-4 yst-flex-1 yst-flex yst-flex-col">
					<div className="yst-absolute yst-top-0 yst-right-0 yst--mr-14 yst-p-1">
						<button
							className="yst-flex yst-h-12 yst-w-12 yst-items-center yst-justify-center yst-rounded-full focus:yst-outline-none focus:yst-bg-gray-600"
							onClick={ toggleOpen }
						>
							<span className="yst-sr-only">{ closeButtonScreenReaderText }</span>
							<XIcon className="yst-h-6 yst-w-6 yst-text-white" />
						</button>
					</div>
					<div className="yst-flex-1 yst-h-0 yst-overflow-y-auto">
						<div className="yst-h-full yst-flex yst-flex-col">
							{ children }
						</div>
					</div>
				</div>
				<div className="flex-shrink-0 w-14"></div>
			</div>
			<div className="yst-fixed yst-inset-0 yst-bg-gray-600 yst-bg-opacity-75 yst-z-30"></div>
		</> }
		<div className="yst-fixed yst-top-0 yst-w-full md:yst-hidden yst-z-10">
			<div className="yst-flex yst-relative yst-flex-shrink-0 yst-h-16 yst-z-10 yst-bg-white yst-border-b yst-border-gray-200">
				<button
					className="yst-px-4 yst-border-r yst-border-gray-200 yst-text-gray-500 focus:yst-outline-none focus:yst-ring-2 focus:yst-ring-inset focus:yst-ring-primary-500"
					onClick={ toggleOpen }
				>
					<span className="yst-sr-only">{ openButtonScreenReaderText }</span>
					<MenuAlt2Icon className="yst-w-6 yst-h-6" />
				</button>
			</div>
		</div>
	</>;
};

Mobile.propTypes = {
	children: PropTypes.node.isRequired,
	openButtonScreenReaderText: PropTypes.string,
	closeButtonScreenReaderText: PropTypes.string,
};

/**
 * @param {JSX.node} children The menu items.
 * @returns {JSX.Element} The sidebar element.
 */
const Sidebar = ( { children } ) => (
	<nav className="yst-space-y-6">{ children }</nav>
);

Sidebar.propTypes = {
	children: PropTypes.node.isRequired,
};

/**
 * @param {string} activePath The path of the active menu item.
 * @param {JSX.node} children The menu(s).
 * @returns {JSX.Element} The navigation element.
 */
const Navigation = ( { activePath = "", children } ) => (
	<NavigationContext.Provider value={ { activePath } }>
		{ children }
	</NavigationContext.Provider>
);

Navigation.propTypes = {
	activePath: PropTypes.string,
	children: PropTypes.node.isRequired,
};

Navigation.Sidebar = Sidebar;
Navigation.Mobile = Mobile;
Navigation.MenuItem = MenuItem;
Navigation.SubmenuItem = SubmenuItem;

export default Navigation;
