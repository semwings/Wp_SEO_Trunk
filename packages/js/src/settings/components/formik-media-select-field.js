/* eslint-disable complexity */
import { sprintf, __ } from "@wordpress/i18n";
import { useState, useCallback, useEffect, useMemo } from "@wordpress/element";
import { Field, useFormikContext } from "formik";
import { get, keys } from "lodash";
import PropTypes from "prop-types";
import classNames from "classnames";
import { PhotographIcon } from "@heroicons/react/outline";
import { Button, Label, Link, useDescribedBy } from "@yoast/ui-library";

const classNameMap = {
	variant: {
		square: "yst-h-48 yst-w-48",
		landscape: "yst-h-48 yst-w-96",
		portrait: "yst-h-96 yst-w-48",
	},
};

const getSupportedFormats = () => ( {
	image: __( "JPG, PNG, WEBP and GIF", "wordpress-seo" ),
} );

/**
 * @param {string} [label] Label.
 * @param {string} [description] Description.
 * @param {JSX.Element} [icon] Icon to show in select.
 * @param {string} id Id.
 * @param {boolean} [disabled] Disabled.
 * @param {string} [libraryType] Media type that should show in WP library, ie. "image" or "video".
 * @param {string} [variant] Variant.
 * @param {string} mediaUrlName Name for the hidden image url field.
 * @param {string} mediaIdName Name for the hidden image id field.
 * @param {string} previewLabel Label for the preview button.
 * @param {string} [selectLabel] Label for the select button.
 * @param {string} [replaceLabel] Label for the replace button.
 * @param {string} [removeLabel] Label for the remove button.
 * @param {string} [className] Classname.
 * @returns {JSX.Element} The Formik compatible media select element.
 */
const FormikMediaSelectField = ( {
	label = "",
	description = "",
	icon: Icon = PhotographIcon,
	id,
	disabled = false,
	libraryType = "image",
	variant = "landscape",
	mediaUrlName,
	mediaIdName,
	previewLabel = "",
	selectLabel = __( "Select image", "wordpress-seo" ),
	replaceLabel = __( "Replace image", "wordpress-seo" ),
	removeLabel = __( "Remove image", "wordpress-seo" ),
	className = "",
} ) => {
	const { values, setFieldValue, setFieldTouched, setFieldError, errors } = useFormikContext();
	const [ wpMediaLibrary, setWpMediaLibrary ] = useState( null );
	const [ mediaMeta, setMediaMeta ] = useState( {} );
	const mediaUrl = useMemo( () => get( values, mediaUrlName, "" ), [ errors ] );
	const error = useMemo( () => get( errors, mediaIdName, "" ), [ errors ] );
	const { ids, describedBy } = useDescribedBy( id, { description, error } );
	const supportedFormats = useMemo( () => getSupportedFormats(), [] );

	const handleSelectMediaClick = useCallback( () => wpMediaLibrary?.open(), [ wpMediaLibrary ] );
	const handleRemoveMediaClick = useCallback( () => {
		// Update local image meta state.
		setMediaMeta( {} );

		// Update Formik state.
		setFieldTouched( mediaUrlName, true, false );
		setFieldValue( mediaUrlName, "" );

		setFieldTouched( mediaIdName, true, false );
		setFieldValue( mediaIdName, "" );
	}, [ setFieldTouched, setFieldValue, setMediaMeta, mediaUrlName, mediaIdName ] );

	useEffect( () => {
		const wpMedia = get( window, "wp.media", null );

		if ( wpMedia ) {
			// Use or create WordPress media library instance.
			const mediaLibrary = wpMediaLibrary || wpMedia( {
				title: label,
				multiple: false,
				library: { type: libraryType },
			} );

			// Attach media select event listener.
			mediaLibrary.on( "select", () => {
				const media = mediaLibrary.state().get( "selection" ).first().toJSON();

				// Update local image meta state.
				setMediaMeta( { alt: media.alt } );

				// Update Formik state.
				setFieldTouched( mediaUrlName, true, false );
				setFieldValue( mediaUrlName, media.url, false );

				setFieldTouched( mediaIdName, true, false );
				setFieldValue( mediaIdName, media.id, false );

				// Clear or add error based on accepted media types.
				setFieldError( mediaIdName, libraryType === media?.type ? "" : sprintf(
					__( "The selected media type is not valid. Supported formats are: %1$s.", "wordpress-seo" ),
					supportedFormats[ libraryType ]
				) );
			} );

			setWpMediaLibrary( mediaLibrary );
		}
	}, [ setFieldTouched, setFieldValue, setMediaMeta, mediaUrlName, mediaIdName, libraryType, label ] );

	return (
		<fieldset className={ classNames( "yst-w-96", disabled && "yst-opacity-50" ) }>
			<Field
				type="hidden"
				name={ mediaUrlName }
				id={ `input-${ mediaUrlName }` }
				aria-describedby={ describedBy }
			/>
			<Field
				type="hidden"
				name={ mediaIdName }
				id={ `input-${ mediaIdName }` }
				aria-describedby={ describedBy }
			/>
			{ label && <Label as="legend" className="yst-mb-2">{ label }</Label> }
			<button
				type="button"
				id={ `button-${ id }-preview` }
				onClick={ handleSelectMediaClick }
				className={ classNames(
					"yst-overflow-hidden yst-flex yst-justify-center yst-items-center yst-rounded-md yst-mb-4",
					mediaUrl ? "yst-bg-gray-50" : "yst-border-2 yst-border-gray-300 yst-border-dashed",
					classNameMap.variant[ variant ],
					className
				) }
			>
				{ mediaUrl ? (
					<>
						<span className="yst-sr-only">{ replaceLabel }</span>
						<img src={ mediaUrl } alt={ mediaMeta.alt || "" } className="yst-object-cover yst-object-center yst-min-h-full yst-min-w-full" />
					</>
				) : (
					<div className="yst-w-48">
						<span className="yst-sr-only">{ selectLabel }</span>
						<Icon className="yst-mx-auto yst-h-12 yst-w-12 yst-text-gray-400 yst-stroke-1" />
						{ previewLabel && (
							<p className="yst-text-xs yst-text-gray-500 yst-text-center yst-mt-1 yst-px-8">
								{ previewLabel }
							</p>
						) }
					</div>
				) }
			</button>
			<div className="yst-flex yst-gap-4">
				{ mediaUrl ? (
					<Button id={ `button-${ id }-replace` } variant="secondary" onClick={ handleSelectMediaClick }>
						{ replaceLabel }
					</Button>
				) : (
					<Button id={ `button-${ id }-select` } variant="secondary" onClick={ handleSelectMediaClick }>
						{ selectLabel }
					</Button>
				) }
				{ mediaUrl && (
					<Link id={ `button-${ id }-remove` } as="button" type="button" variant="error" onClick={ handleRemoveMediaClick }>
						{ removeLabel }
					</Link>
				) }
			</div>
			{ error && <p id={ ids.error } className="yst-mt-2 yst-text-sm yst-text-red-600">{ error }</p> }
			{ description && <p id={ ids.description } className="yst-mt-2">{ description }</p> }
		</fieldset>
	);
};

FormikMediaSelectField.propTypes = {
	label: PropTypes.string,
	description: PropTypes.node,
	icon: PropTypes.elementType,
	id: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	libraryType: PropTypes.string,
	variant: PropTypes.oneOf( keys( classNameMap.variant ) ),
	mediaUrlName: PropTypes.string.isRequired,
	mediaIdName: PropTypes.string.isRequired,
	previewLabel: PropTypes.node,
	selectLabel: PropTypes.string,
	replaceLabel: PropTypes.string,
	removeLabel: PropTypes.string,
	className: PropTypes.string,
};

export default FormikMediaSelectField;
