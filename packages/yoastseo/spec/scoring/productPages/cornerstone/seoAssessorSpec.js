import EnglishResearcher from "../../../../src/languageProcessing/languages/en/Researcher";
import Assessor from "../../../../src/scoring/productPages/cornerstone/seoAssessor.js";
import Paper from "../../../../src/values/Paper.js";
import getResults from "../../../specHelpers/getAssessorResults";
import { checkAssessmentAvailability } from "../../../specHelpers/scoring/seoAssessorTests";

const mockPaper = new Paper( "" );
const assessor = new Assessor( new EnglishResearcher( mockPaper ), {
	assessVariants: true,
	introductionKeyphraseUrlTitle: "https://yoast.com/1",
	introductionKeyphraseCTAUrl: "https://yoast.com/2",
	keyphraseLengthUrlTitle: "https://yoast.com/3",
	keyphraseLengthCTAUrl: "https://yoast.com/4",
	keyphraseDensityUrlTitle: "https://yoast.com/5",
	keyphraseDensityCTAUrl: "https://yoast.com/6",
	metaDescriptionKeyphraseUrlTitle: "https://yoast.com/7",
	metaDescriptionKeyphraseCTAUrl: "https://yoast.com/8",
	metaDescriptionLengthUrlTitle: "https://yoast.com/9",
	metaDescriptionLengthCTAUrl: "https://yoast.com/10",
	subheadingsKeyphraseUrlTitle: "https://yoast.com/11",
	subheadingsKeyphraseCTAUrl: "https://yoast.com/12",
	textCompetingLinksUrlTitle: "https://yoast.com/13",
	textCompetingLinksCTAUrl: "https://yoast.com/14",
	textLengthUrlTitle: "https://yoast.com/15",
	textLengthCTAUrl: "https://yoast.com/16",
	titleKeyphraseUrlTitle: "https://yoast.com/17",
	titleKeyphraseCTAUrl: "https://yoast.com/18",
	titleWidthUrlTitle: "https://yoast.com/19",
	titleWidthCTAUrl: "https://yoast.com/20",
	urlKeyphraseUrlTitle: "https://yoast.com/21",
	urlKeyphraseCTAUrl: "https://yoast.com/22",
	functionWordsInKeyphraseUrlTitle: "https://yoast.com/23",
	functionWordsInKeyphraseCTAUrl: "https://yoast.com/24",
	singleH1UrlTitle: "https://yoast.com/25",
	singleH1CTAUrl: "https://yoast.com/26",
	imageCountUrlTitle: "https://yoast.com/27",
	imageCountCTAUrl: "https://yoast.com/28",
	imageKeyphraseUrlTitle: "https://yoast.com/29",
	imageKeyphraseCTAUrl: "https://yoast.com/30",
	imageAltTagsUrlTitle: "https://yoast.com/31",
	imageAltTagsCTAUrl: "https://yoast.com/32",
	keyphraseDistributionUrlTitle: "https://yoast.com/33",
	keyphraseDistributionCTAUrl: "https://yoast.com/34",
	productIdentifierUrlTitle: "https://yoast.com/35",
	productIdentifierCTAUrl: "https://yoast.com/36",
	productSKUUrlTitle: "https://yoast.com/37",
	productSKUCTAUrl: "https://yoast.com/38",
} );

describe( "running assessments in the product page cornerstone SEO assessor", function() {
	checkAssessmentAvailability( assessor, true );

	it( "runs the productSKUAssessments when applicable (canRetrieveVariantSkus is true) that require the SKU to be detectable, " +
		"and that shouldn't be applicable if the product has variants and we don't want to assess variants", function() {
		const customData = {
			canRetrieveGlobalSku: true,
			canRetrieveVariantSkus: true,
			hasVariants: true,
			productType: "variable",
		};
		assessor.assess( new Paper( "", { customData } ) );
		const AssessmentResults = assessor.getValidResults();
		const assessments = getResults( AssessmentResults );

		expect( assessments ).toContain( "productSKU" );
	} );

	it( "runs the productIdentifierAssessment when it is applicable (it has variants and assessVariants is True)", function() {
		const customData = {
			hasVariants: true,
			productType: "variable",
		};
		assessor.assess( new Paper( "", { customData } ) );
		const AssessmentResults = assessor.getValidResults();
		const assessments = getResults( AssessmentResults );

		expect( assessments ).toContain( "productIdentifier" );
	} );
} );

describe( "has configuration overrides", () => {
	test( "IntroductionKeywordAssessment", () => {
		const assessment = assessor.getAssessment( "introductionKeyword" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/1' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/2' target='_blank'>" );
	} );

	test( "KeyphraseLengthAssessment", () => {
		const assessment = assessor.getAssessment( "keyphraseLength" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.parameters.recommendedMinimum ).toBe( 4 );
		expect( assessment._config.parameters.recommendedMaximum ).toBe( 6 );
		expect( assessment._config.parameters.acceptableMaximum ).toBe( 8 );
		expect( assessment._config.parameters.acceptableMinimum ).toBe( 2 );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/3' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/4' target='_blank'>" );
	} );

	test( "KeywordDensityAssessment", () => {
		const assessment = assessor.getAssessment( "keywordDensity" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/5' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/6' target='_blank'>" );
	} );

	test( "MetaDescriptionKeywordAssessment", () => {
		const assessment = assessor.getAssessment( "metaDescriptionKeyword" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/7' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/8' target='_blank'>" );
	} );

	test( "MetaDescriptionLengthAssessment", () => {
		const assessment = assessor.getAssessment( "metaDescriptionLength" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.scores ).toBeDefined();
		expect( assessment._config.scores.tooLong ).toBe( 3 );
		expect( assessment._config.scores.tooShort ).toBe( 3 );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/9' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/10' target='_blank'>" );
	} );

	test( "SubheadingsKeyword", () => {
		const assessment = assessor.getAssessment( "subheadingsKeyword" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/11' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/12' target='_blank'>" );
	} );

	test( "TextCompetingLinksAssessment", () => {
		const assessment = assessor.getAssessment( "textCompetingLinks" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/13' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/14' target='_blank'>" );
	} );

	test( "TextLengthAssessment", () => {
		const assessment = assessor.getAssessment( "textLength" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.recommendedMinimum ).toBe( 400 );
		expect( assessment._config.slightlyBelowMinimum ).toBe( 300 );
		expect( assessment._config.belowMinimum ).toBe( 200 );
		expect( assessment._config.scores ).toBeDefined();
		expect( assessment._config.scores.belowMinimum ).toBe( -20 );
		expect( assessment._config.scores.farBelowMinimum ).toBe( -20 );
		expect( assessment._config.cornerstoneContent ).toBeDefined();
		expect( assessment._config.cornerstoneContent ).toBeTruthy();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/15' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/16' target='_blank'>" );
	} );

	test( "KeyphraseInSEOTitleAssessment", () => {
		const assessment = assessor.getAssessment( "keyphraseInSEOTitle" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/17' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/18' target='_blank'>" );
	} );

	test( "PageTitleWidthAssesment", () => {
		const assessment = assessor.getAssessment( "titleWidth" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.scores ).toBeDefined();
		expect( assessment._config.scores.widthTooShort ).toBe( 9 );
		expect( assessment._allowShortTitle ).toBe( true );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/19' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/20' target='_blank'>" );
	} );

	test( "SlugKeywordAssessment", () => {
		const assessment = assessor.getAssessment( "slugKeyword" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.scores ).toBeDefined();
		expect( assessment._config.scores.okay ).toBe( 3 );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/21' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/22' target='_blank'>" );
	} );

	test( "FunctionWordsInKeyphrase", () => {
		const assessment = assessor.getAssessment( "functionWordsInKeyphrase" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/23' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/24' target='_blank'>" );
	} );

	test( "SingleH1Assessment", () => {
		const assessment = assessor.getAssessment( "singleH1" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/25' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/26' target='_blank'>" );
	} );

	test( "ImageCount", () => {
		const assessment = assessor.getAssessment( "images" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.scores.okay ).toBe( 6 );
		expect( assessment._config.recommendedCount ).toBe( 4 );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/27' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/28' target='_blank'>" );
	} );

	test( "ImageKeyphrase", () => {
		const assessment = assessor.getAssessment( "imageKeyphrase" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.scores ).toBeDefined();
		expect( assessment._config.scores.withAltNonKeyword ).toBe( 3 );
		expect( assessment._config.scores.withAlt ).toBe( 3 );
		expect( assessment._config.scores.noAlt ).toBe( 3 );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/29' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/30' target='_blank'>" );
	} );

	test( "ImageAltTags", () => {
		const assessment = assessor.getAssessment( "imageAltTags" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/31' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/32' target='_blank'>" );
	} );

	test( "KeyphraseDistribution", () => {
		const assessment = assessor.getAssessment( "keyphraseDistribution" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/33' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/34' target='_blank'>" );
	} );

	test( "ProductIdentifierAssessment", () => {
		const assessment = assessor.getAssessment( "productIdentifier" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.assessVariants ).toBe( true );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/35' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/36' target='_blank'>" );
	} );

	test( "ProductSKUAssessment", () => {
		const assessment = assessor.getAssessment( "productSKU" );

		expect( assessment ).toBeDefined();
		expect( assessment._config ).toBeDefined();
		expect( assessment._config.assessVariants ).toBe( true );
		expect( assessment._config.urlTitle ).toBe( "<a href='https://yoast.com/37' target='_blank'>" );
		expect( assessment._config.urlCallToAction ).toBe( "<a href='https://yoast.com/38' target='_blank'>" );
	} );
} );
