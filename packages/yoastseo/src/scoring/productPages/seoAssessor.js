import { inherits } from "util";

import { Assessor, assessments, helpers } from "yoastseo";

// Product-specific assessments.
import ImageAltTagsAssessment from "../assessments/seo/ImageAltTagsAssessment";
import ProductIdentifiersAssessment from "../assessments/seo/ProductIdentifiersAssessment";
import ProductSKUAssessment from "../assessments/seo/ProductSKUAssessment";

const { createAnchorOpeningTag } = helpers;

const {
	IntroductionKeywordAssessment,
	KeyphraseLengthAssessment,
	KeywordDensityAssessment,
	MetaDescriptionKeywordAssessment,
	TextCompetingLinksAssessment,
	KeyphraseInSEOTitleAssessment,
	SlugKeywordAssessment,
	MetaDescriptionLengthAssessment,
	SubheadingsKeywordAssessment,
	ImageKeyphraseAssessment,
	ImageCountAssessment,
	TextLengthAssessment,
	PageTitleWidthAssessment,
	FunctionWordsInKeyphraseAssessment,
	SingleH1Assessment,
} = assessments.seo;

/**
 * Creates the Assessor
 *
 * @param {Researcher}  researcher   The researcher to use for the analysis.
 * @param {Object?}  options         The options for this assessor.
 *
 * @constructor
 */
const ProductSEOAssessor = function( researcher, options ) {
	Assessor.call( this, researcher, options );
	this.type = "productSEOAssessor";

	this._assessments = [
		new IntroductionKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( options.introductionKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.introductionKeyphraseCTAUrl ),
		} ),
		new KeyphraseLengthAssessment( {
			parameters: {
				recommendedMinimum: 4,
				recommendedMaximum: 6,
				acceptableMaximum: 8,
				acceptableMinimum: 2,
			},
			urlTitle: createAnchorOpeningTag( options.keyphraseLengthUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.keyphraseLengthCTAUrl ),
		}, true ),
		new KeywordDensityAssessment( {
			urlTitle: createAnchorOpeningTag( options.keyphraseDensityUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.keyphraseDensityCTAUrl ),
		} ),
		new MetaDescriptionKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( options.metaDescriptionKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.metaDescriptionKeyphraseCTAUrl ),
		} ),
		new MetaDescriptionLengthAssessment( {
			urlTitle: createAnchorOpeningTag( options.metaDescriptionLengthUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.metaDescriptionLengthCTAUrl ),
		} ),
		new SubheadingsKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( options.subheadingsKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.subheadingsKeyphraseCTAUrl ),
		} ),
		new TextCompetingLinksAssessment( {
			urlTitle: createAnchorOpeningTag( options.textCompetingLinksUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.textCompetingLinksCTAUrl ),
		} ),
		new TextLengthAssessment( {
			recommendedMinimum: 200,
			slightlyBelowMinimum: 150,
			belowMinimum: 100,
			veryFarBelowMinimum: 50,
			urlTitle: createAnchorOpeningTag( options.textLengthUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.textLengthCTAUrl ),
			customContentType: this.type,
		} ),
		new KeyphraseInSEOTitleAssessment( {
			urlTitle: createAnchorOpeningTag( options.titleKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.titleKeyphraseCTAUrl ),
		} ),
		new PageTitleWidthAssessment( {
			scores: {
				widthTooShort: 9,
			},
			urlTitle: createAnchorOpeningTag( options.titleWidthUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.titleWidthCTAUrl ),
		}, true ),
		new SlugKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( options.urlKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.urlKeyphraseCTAUrl ),
		} ),
		new FunctionWordsInKeyphraseAssessment( {
			urlTitle: createAnchorOpeningTag( options.functionWordsInKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.functionWordsInKeyphraseCTAUrl ),
		} ),
		new SingleH1Assessment( {
			urlTitle: createAnchorOpeningTag( options.singleH1UrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.singleH1CTAUrl ),
		} ),
		new ImageCountAssessment( {
			scores: {
				okay: 6,
			},
			recommendedCount: 4,
			urlTitle: createAnchorOpeningTag( options.imageCountUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.imageCountCTAUrl ),
		}, options.countVideos ),
		new ImageKeyphraseAssessment( {
			urlTitle: createAnchorOpeningTag( options.imageKeyphraseUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.imageKeyphraseCTAUrl ),
		} ),
		new ImageAltTagsAssessment( {
			urlTitle: createAnchorOpeningTag( options.imageAltTagsUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.imageAltTagsCTAUrl ),
		} ),
		new ProductIdentifiersAssessment( {
			urlTitle: createAnchorOpeningTag( options.productIdentifierUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.productIdentifierCTAUrl ),
			assessVariants: options.assessVariants,
			productIdentifierOrBarcode: options.productIdentifierOrBarcode,
			shouldShowEditButton: options.shouldShowEditButtons,
		} ),
		new ProductSKUAssessment( {
			urlTitle: createAnchorOpeningTag( options.productSKUUrlTitle ),
			urlCallToAction: createAnchorOpeningTag( options.productSKUCTAUrl ),
			assessVariants: options.assessVariants,
			addSKULocation: options.addSKULocation,
			shouldShowEditButton: options.shouldShowEditButtons,
		} ),
	];
};

inherits( ProductSEOAssessor, Assessor );

export default ProductSEOAssessor;
