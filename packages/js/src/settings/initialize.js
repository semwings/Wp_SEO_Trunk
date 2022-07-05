import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Root } from "@yoast/ui-library";
import { Formik } from "formik";
import { forEach, get, isObject } from "lodash";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import {
	AuthorArchives,
	Breadcrumbs,
	DateArchives,
	Formats,
	Media,
	NotFoundPages,
	Rss,
	SearchPages,
	SiteDefaults,
	SitePreferences,
	SiteRepresentation,
} from "./routes";

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

	render(
		<Root>
			<HashRouter>
				<Formik
					initialValues={ getInitialValues() }
					onSubmit={ handleSubmit }
				>
					<div className="yst-flex md:yst-gap-4 yst-mt-16 md:yst-mt-0 yst-p-4 md:yst-p-8">
						<aside className="yst-hidden md:yst-block yst-flex-shrink-0 yst-w-56 lg:yst-w-64">
							<nav>
								<Link to="site-preferences">
									{ __( "Site preferences", "wordpress-seo" ) }
								</Link>
								<br />
								<Link to="other">
									{ __( "Other", "wordpress-seo" ) }
								</Link>
							</nav>
						</aside>
						<main className="yst-flex-grow">
							<Routes>
								<Route path="author-archives" element={ <AuthorArchives /> } />
								<Route path="breadcrumbs" element={ <Breadcrumbs /> } />
								<Route path="date-archives" element={ <DateArchives /> } />
								<Route path="formats" element={ <Formats /> } />
								<Route path="media" element={ <Media /> } />
								<Route path="not-found-pages" element={ <NotFoundPages /> } />
								<Route path="rss" element={ <Rss /> } />
								<Route path="search-pages" element={ <SearchPages /> } />
								<Route path="site-defaults" element={ <SiteDefaults /> } />
								<Route path="site-representation" element={ <SiteRepresentation /> } />
								<Route path="site-preferences" element={ <SitePreferences /> } />
								<Route path="/" element={ <SitePreferences /> } />
							</Routes>
						</main>
					</div>
				</Formik>
			</HashRouter>
		</Root>,
		root
	);
} );
