import { Fragment, useMemo } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { makeOutboundLink } from "@yoast/helpers";
import { get } from "lodash";
import PropTypes from "prop-types";

import createInterpolateElement from "../../helpers/createInterpolateElement";

const OutboundLink = makeOutboundLink();

/**
 * TextFormality component.
 *
 * @param {string} location The location of this component.
 *
 * @returns {JSX.Element} The element.
 */
const TextFormalityUpsell = ( { location } ) => {
	const upsellLink = useMemo( () => get( window, `wpseoAdminL10n.shortlinks-insights-upsell-${ location }-text_formality`, "" ), [ location ] );
	const infoLinkFree = get( window, "wpseoAdminL10n.shortlinks-insights-text_formality_info_free", "" );

	const upsellDescription = useMemo( () => {
		return createInterpolateElement(
			sprintf(
				// Translators: %1$s expands to a starting `b` tag, %2$s expands to a closing `b` tag and %3$s expands to `Yoast SEO Premium`.
				__( "%1$s%3$s%2$s will help you assess the formality level of your text.", "wordpress-seo" ),
				"<b>",
				"</b>",
				"Yoast SEO Premium"
			),
			{
				b: <b />,
			}
		);
	}, [] );

	const textFormalityInfo = useMemo( () => {
		return createInterpolateElement(
			sprintf(
				// Translators: %1$s expands to a link on yoast.com, %2$s expands to the anchor end tag.
				__( "%1$sRead more about text formality.%2$s", "wordpress-seo" ),
				"<a>",
				"</a>"
			),
			{
				a: <OutboundLink href={ infoLinkFree } />,
			}
		);
	}, [] );

	return (
		<Fragment>
			<div>
				<p>{ upsellDescription }</p>
				<OutboundLink href={ upsellLink } className="yoast-button yoast-button-upsell">
					{ sprintf(
						// Translators: %s expands to `Premium` (part of add-on name).
						__( "Unlock with %s", "wordpress-seo" ),
						"Premium"
					) }
					<span aria-hidden="true" className="yoast-button-upsell__caret" />
				</OutboundLink>
			</div>
			<p>{ textFormalityInfo }</p>
		</Fragment>
	);
};

TextFormalityUpsell.propTypes = {
	location: PropTypes.string.isRequired,
};

export default TextFormalityUpsell;

