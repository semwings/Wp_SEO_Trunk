import { __, sprintf } from "@wordpress/i18n";
import { SelectField, TextField, ToggleField } from "@yoast/ui-library";
import { Field } from "formik";
import { map } from "lodash";
import { addLinkToString } from "../../helpers/stringHelpers";
import { FieldsetLayout, FormikValueChangeField, FormLayout, RouteLayout } from "../components";
import { useSelectSettings } from "../hooks";

/**
 * @returns {JSX.Element} The breadcrumbs route.
 */
const Breadcrumbs = () => {
	const headerBreadcrumbsLink = useSelectSettings( "selectLink", [], "https://yoa.st/header-breadcrumbs" );
	const breadcrumbsLink = useSelectSettings( "selectLink", [], "https://yoa.st/breadcrumbs" );
	const breadcrumbsForPostTypes = useSelectSettings( "selectBreadcrumbsForPostTypes" );
	const breadcrumbsForTaxonomies = useSelectSettings( "selectBreadcrumbsForTaxonomies" );
	const hasPageForPosts = useSelectSettings( "selectHasPageForPosts" );

	return (
		<RouteLayout
			title={ __( "Breadcrumbs", "wordpress-seo" ) }
			description={ addLinkToString(
				sprintf(
				// translators: %1$s and %2$s are replaced by opening and closing <a> tags.
					__( "Configure the appearance and behavior of %1$syour breadcrumbs%2$s.", "wordpress-seo" ),
					"<a>",
					"</a>"
				),
				headerBreadcrumbsLink,
				"link-header-breadcrumbs"
			) }
		>
			<FormLayout>
				<div className="yst-max-w-5xl">
					<FieldsetLayout
						title={ __( "Breadcrumb appearance", "wordpress-seo" ) }
						description={ __( "Choose the general appearance of your breadcrumbs.", "wordpress-seo" ) }
					>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-sep"
							id="input-wpseo_titles-breadcrumbs-sep"
							label={ __( "Separator between breadcrumbs", "wordpress-seo" ) }
							placeholder={ __( "Add separator", "wordpress-seo" ) }
						/>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-home"
							id="input-wpseo_titles-breadcrumbs-home"
							label={ __( "Anchor text for the Homepage", "wordpress-seo" ) }
							placeholder={ __( "Add anchor text", "wordpress-seo" ) }
						/>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-prefix"
							id="input-wpseo_titles-breadcrumbs-prefix"
							label={ __( "Prefix for the breadcrumb path", "wordpress-seo" ) }
							placeholder={ __( "Add prefix", "wordpress-seo" ) }
						/>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-archiveprefix"
							id="input-wpseo_titles-breadcrumbs-archiveprefix"
							label={ __( "Prefix for Archive breadcrumbs", "wordpress-seo" ) }
							placeholder={ __( "Add prefix", "wordpress-seo" ) }
						/>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-searchprefix"
							id="input-wpseo_titles-breadcrumbs-searchprefix"
							label={ __( "Prefix for Search page breadcrumbs", "wordpress-seo" ) }
							placeholder={ __( "Add prefix", "wordpress-seo" ) }
						/>
						<Field
							as={ TextField }
							type="text"
							name="wpseo_titles.breadcrumbs-404crumb"
							id="input-wpseo_titles-breadcrumbs-404crumb"
							label={ __( "Breadcrumb for 404 page", "wordpress-seo" ) }
							placeholder={ __( "Add separator", "wordpress-seo" ) }
						/>
						{ hasPageForPosts && <FormikValueChangeField
							as={ ToggleField }
							type="checkbox"
							name="wpseo_titles.breadcrumbs-display-blog-page"
							data-id="input-wpseo_titles-breadcrumbs-display-blog-page"
							label={ __( "Show Blog page in breadcrumbs", "wordpress-seo" ) }
						/> }
						<FormikValueChangeField
							as={ ToggleField }
							type="checkbox"
							name="wpseo_titles.breadcrumbs-boldlast"
							data-id="input-wpseo_titles-breadcrumbs-boldlast"
							label={ __( "Bold the last page", "wordpress-seo" ) }
						/>
					</FieldsetLayout>
					<hr className="yst-my-8" />
					<FieldsetLayout
						title={ __( "Breadcrumbs for Post types", "wordpress-seo" ) }
						description={ __( "Choose which Taxonomy you wish to show in the breadcrumbs for Post types.", "wordpress-seo" ) }
					>
						{ map( breadcrumbsForPostTypes, ( postTypes, postTypeName ) => <FormikValueChangeField
							key={ postTypeName }
							as={ SelectField }
							name={ `wpseo_titles.post_types-${ postTypeName }-maintax` }
							data-id={ `input-wpseo_titles-post_types-${ postTypeName }-maintax` }
							label={ postTypes.label }
							options={ postTypes.options }
						/> ) }
					</FieldsetLayout>
					<hr className="yst-my-8" />
					<FieldsetLayout
						title={ __( "Breadcrumbs for Taxonomies", "wordpress-seo" ) }
						description={ __( "Choose which Post type you wish to show in the breadcrumbs for Taxonomies.", "wordpress-seo" ) }
					>
						{ map( breadcrumbsForTaxonomies, ( { name, label, options } ) => (
							<FormikValueChangeField
								key={ name }
								as={ SelectField }
								name={ `wpseo_titles.taxonomy-${ name }-ptparent` }
								data-id={ `input-wpseo_titles-taxonomy-${ name }-ptparent` }
								label={ label }
								options={ options }
							/>
						) ) }
					</FieldsetLayout>
					<hr className="yst-my-8" />
					<FieldsetLayout title={ __( "How to insert breadcrumbs in your theme", "wordpress-seo" ) }>
						<p>
							{ addLinkToString(
								sprintf(
								// translators: %1$s and %2$s are replaced by opening and closing <a> tags. %3$s expands to "Yoast SEO".
									__( "Not sure how to implement the %3$s breadcrumbs on your site? Read %1$sour help article on breadcrumbs implementation%2$s.", "wordpress-seo" ),
									"<a>",
									"</a>",
									"Yoast SEO"
								),
								breadcrumbsLink,
								"link-breadcrumbs-help-article"
							) }
						</p>
						<p>
							{ __( "You can always choose to enable/disable them for your theme below. This setting will not apply to breadcrumbs inserted through a widget, a block or a shortcode.", "wordpress-seo" ) }
						</p>
						<FormikValueChangeField
							as={ ToggleField }
							type="checkbox"
							name="wpseo_titles.breadcrumbs-enable"
							id="input-wpseo_titles-breadcrumbs-enable"
							label={ __( "Enable breadcrumbs for your theme", "wordpress-seo" ) }
						/>
					</FieldsetLayout>
				</div>
			</FormLayout>
		</RouteLayout>
	);
};

export default Breadcrumbs;
