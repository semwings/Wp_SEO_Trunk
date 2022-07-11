import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import { Root } from "@yoast/ui-library";
import { Formik } from "formik";
import { forEach, get, isObject } from "lodash";
import { HashRouter } from "react-router-dom";
import { StyleSheetManager } from "styled-components";
import App from "./app";
import registerStore from "./store";

/**
 * Retrieves the initial settings.
 * @returns {Object} The settings.
 */
const getInitialValues = () => get( window, "wpseoScriptData.settings", {} );

/**
 * Handles the form submit.
 * @param {Object} values The values.
 * @returns {Promise<boolean>} Promise of save result.
 */
const handleSubmit = async( values ) => {
	const { endpoint, nonce } = get( window, "wpseoScriptData", {} );
	const formData = new FormData();

	console.warn( "values", values );

	formData.set( "option_page", "wpseo_settings" );
	formData.set( "action", "update" );
	formData.set( "_wpnonce", nonce );

	forEach( values, ( value, name ) => {
		if ( isObject( value ) ) {
			forEach( value, ( nestedValue, nestedName ) => formData.set( `${ name }[${ nestedName }]`, nestedValue ) );
			return;
		}
		formData.set( name, value );
	} );

	try {
		await fetch( endpoint, {
			method: "POST",
			body: new URLSearchParams( formData ),
		} );

		return true;
	} catch ( error ) {
		console.error( error.message );
		return false;
	}
};

domReady( () => {
	const root = document.getElementById( "yoast-seo-settings" );
	if ( ! root ) {
		return;
	}

	registerStore();

	// Prevent Styled Components' styles by adding the stylesheet to a div that is not on the page.
	const styleDummy = document.createElement( "div" );

	render(
		<Root>
			<StyleSheetManager target={ styleDummy }>
				<HashRouter>
					<Formik initialValues={ getInitialValues() } onSubmit={ handleSubmit }>
						<App />
					</Formik>
				</HashRouter>
			</StyleSheetManager>
		</Root>,
		root
	);
} );
