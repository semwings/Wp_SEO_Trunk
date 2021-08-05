import { inherits } from "util";
import { createAnchorOpeningTag } from "../../helpers/shortlinker";
import ImageAltTags from "../assessments/seo/ImageAltTagsAssessment";
import IntroductionKeywordAssessment from "../assessments/seo/IntroductionKeywordAssessment";
import KeyphraseLengthAssessment from "../assessments/seo/KeyphraseLengthAssessment";
import KeywordDensityAssessment from "../assessments/seo/KeywordDensityAssessment";
import MetaDescriptionKeywordAssessment from "../assessments/seo/MetaDescriptionKeywordAssessment";
import TextCompetingLinksAssessment from "../assessments/seo/TextCompetingLinksAssessment";
import TitleKeywordAssessment from "../assessments/seo/TitleKeywordAssessment";
import UrlKeywordAssessment from "../assessments/seo/UrlKeywordAssessment";
import Assessor from "../assessor";
import MetaDescriptionLength from "../assessments/seo/MetaDescriptionLengthAssessment";
import SubheadingsKeyword from "../assessments/seo/SubHeadingsKeywordAssessment";
import ImageKeyphrase from "../assessments/seo/KeyphraseInImageTextAssessment";
import ImageCount from "../assessments/seo/ImageCountAssessment";
import TextLength from "../assessments/seo/TextLengthAssessment";
import TitleWidth from "../assessments/seo/PageTitleWidthAssessment";
import FunctionWordsInKeyphrase from "../assessments/seo/FunctionWordsInKeyphraseAssessment";
import SingleH1Assessment from "../assessments/seo/SingleH1Assessment";


/**
 * Creates the Assessor
 *
 * @param {object}  i18n            The i18n object used for translations.
 * @param {object}  researcher      The researcher to use for the analysis.
 * @param {Object}  options         The options for this assessor.
 * @param {Object}  options.marker  The marker to pass the list of marks to.
 *
 * @constructor
 */
const ProductSEOAssessor = function( i18n, researcher, options ) {
	Assessor.call( this, i18n, researcher, options );
	this.type = "productSEOAssessor";

	this._assessments = [
		new IntroductionKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify8" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify9" ),
		} ),
		new KeyphraseLengthAssessment( {
			parameters: {
				recommendedMinimum: 4,
				recommendedMaximum: 6,
				acceptableMaximum: 8,
				acceptableMinimum: 2,
			},
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify10" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify11" ),
		}, true ),
		new KeywordDensityAssessment(),
		new MetaDescriptionKeywordAssessment(),
		new MetaDescriptionLength(),
		new SubheadingsKeyword(),
		new TextCompetingLinksAssessment(),
		new TextLength( {
			recommendedMinimum: 200,
			slightlyBelowMinimum: 150,
			belowMinimum: 100,
			veryFarBelowMinimum: 50,
		} ),
		new TitleKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify24" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify25" ),
		} ),
		new TitleWidth( {
			scores: {
				widthTooShort: 9,
			},
		}, true ),
		new UrlKeywordAssessment( {
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify26" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify27" ),
		} ),
		new FunctionWordsInKeyphrase(),
		new SingleH1Assessment(),
		new ImageCount( {
			scores: {
				okay: 6,
			},
			recommendedCount: 4,
		}, true ),
		new ImageKeyphrase(),
		new ImageAltTags( {
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify40" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify41" ),
		}
		),
	];
};

inherits( ProductSEOAssessor, Assessor );

export default ProductSEOAssessor;
