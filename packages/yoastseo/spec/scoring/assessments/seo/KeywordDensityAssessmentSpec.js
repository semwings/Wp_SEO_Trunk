/* eslint-disable capitalized-comments, spaced-comment */
import KeywordDensityAssessment from "../../../../src/scoring/assessments/seo/KeywordDensityAssessment";
import EnglishResearcher from "../../../../src/languageProcessing/languages/en/Researcher";
import GermanResearcher from "../../../../src/languageProcessing/languages/de/Researcher";
import DefaultResearcher from "../../../../src/languageProcessing/languages/_default/Researcher";
import JapaneseResearcher from "../../../../src/languageProcessing/languages/ja/Researcher";
import Paper from "../../../../src/values/Paper.js";
import Mark from "../../../../src/values/Mark.js";
import getMorphologyData from "../../../specHelpers/getMorphologyData";
import buildTree from "../../../specHelpers/parse/buildTree";

const morphologyData = getMorphologyData( "en" );
const morphologyDataDe = getMorphologyData( "de" );
const morphologyDataJA = getMorphologyData( "ja" );
const nonkeyword = "nonkeyword, ";
const keyword = "keyword, ";
const shortTextJapanese = "熱".repeat( 199 );
const longTextJapanese = "熱".repeat( 200 );

// Test data for language without morphology.
const testDataWithDefaultResearcher = [
	{
		description: "runs the keywordDensity on the paper without keyword in the text",
		paper: new Paper( "<p>" + nonkeyword.repeat( 1000 ) + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 0 times. That's less than the recommended minimum of 5 times for a text of this length." +
				" <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
	{
		description: "runs the keywordDensity on the paper with a low keyphrase density (0.1%)",
		paper: new Paper( "<p>" + nonkeyword.repeat( 999 ) + keyword + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 1 time. That's less than the recommended minimum of 5 times for a text of this length." +
				" <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
	{
		description: "runs the keywordDensity on the paper with a good keyphrase density (0.5%)",
		paper: new Paper( "<p>" + nonkeyword.repeat( 995 ) + keyword.repeat( 5 ) + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: 9,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 5 times. This is great!",
		},
	},
	{
		description: "runs the keywordDensity on the paper with a good keyphrase density (2%)",
		paper: new Paper( "<p>" + nonkeyword.repeat( 980 ) + keyword.repeat( 20 ) + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: 9,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 20 times. This is great!",
		},
	},
	{
		description: "runs the keywordDensity on the paper with a slightly too high keyphrase density (3.5%)",
		paper: new Paper( "<p>" + nonkeyword.repeat( 965 ) + keyword.repeat( 35 ) + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: -10,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 35 times. That's more than the recommended maximum of 29 times " +
				"for a text of this length. <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!",
		},
	},
	{
		description: "runs the keywordDensity on the paper with a very high keyphrase density (10%)",
		paper: new Paper( "<p>" + nonkeyword.repeat( 900 ) + keyword.repeat( 100 ) + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: -50,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 100 times. That's way more than the recommended maximum of 29 times " +
				"for a text of this length. <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!",
		},
	},
	{
		description: "adjusts the keyphrase density based on the length of the keyword with the actual density remaining at 2% - short keyphrase",
		paper: new Paper( "<p>" + nonkeyword.repeat( 960 ) + "b c, ".repeat( 20 ) + "</p>", { keyword: "b c" } ),
		expectedResult: {
			score: 9,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 20 times. This is great!",
		},
	},
	{
		description: "does not count text inside elements we want to exclude from the analysis when calculating the recommended" +
			"number of keyphrase usages",
		paper: new Paper( "<p>" + nonkeyword.repeat( 101 ) + "<blockquote>" + nonkeyword.repeat( 859 ) +
			"</blockquote>" + "b c, ".repeat( 20 ) + "</p>", { keyword: "b c" } ),
		expectedResult: {
			score: -50,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 20 times. That's way more than the recommended maximum of 3 times for a text of this length." +
				" <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!",
		},
	},
	{
		description: "adjusts the keyphrase density based on the length of the keyword with the actual density remaining at 2% - long keyphrase",
		paper: new Paper( "<p>" + nonkeyword.repeat( 900 ) + "b c d e f, ".repeat( 20 ) + "</p>", { keyword: "b c d e f" } ),
		expectedResult: {
			score: -50,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 20 times. That's way more than the recommended maximum of 12 times for a text of this length." +
				" <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!",
		},
	},
	{
		description: "returns a bad result if the keyword is only used once, regardless of the density",
		paper: new Paper( "<p>" + nonkeyword.repeat( 100 ) + keyword + "</p>", { keyword: "keyword" } ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 1 time. That's less than the recommended minimum of 2 times " +
				"for a text of this length. <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
	{
		description: "returns a good result if the keyword is used twice and " +
			"the recommended count is smaller than or equal to 2, regardless of the density",
		paper: new Paper( "<p>" + nonkeyword.repeat( 100 ) + "a b c, a b c</p>", { keyword: "a b c", locale: "xx_XX" } ),
		expectedResult: {
			score: 9,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 2 times. This is great!",
		},
	},
];

describe.each( testDataWithDefaultResearcher )( "a kephrase density test for languages without morphology", ( {
	description,
	paper,
	expectedResult,
} ) => {
	const researcher = new DefaultResearcher( paper );
	buildTree( paper, researcher );
	it( description, () => {
		const result = new KeywordDensityAssessment().getResult( paper, researcher );

		expect( result.getScore() ).toBe( expectedResult.score );
		expect( result.getText() ).toBe( expectedResult.text );
	} );
} );

const testDataForApplicability = [
	{
		description: "applies to a paper with a keyword and a text of at least 100 words",
		paper: new Paper( "<p>" + nonkeyword.repeat( 100 ) + "</p>", { keyword: "keyword" } ),
		researcher: new DefaultResearcher(),
		expectedResult: true,
	},
	{
		description: "does not apply to a paper with a keyword and a text of at least 100 words when the text is inside an element" +
			"we want to exclude from the analysis",
		paper: new Paper( "<blockquote>" + nonkeyword.repeat( 100 ) + "</blockquote>", { keyword: "keyword" } ),
		researcher: new DefaultResearcher(),
		expectedResult: false,
	},
	{
		description: "does not apply to a paper with text of 100 words but without a keyword",
		paper: new Paper( "<p>" + nonkeyword.repeat( 100 ) + "</p>", { keyword: "" } ),
		researcher: new DefaultResearcher(),
		expectedResult: false,
	},
	{
		description: "does not apply to a paper with a text containing less than 100 words and with a keyword",
		paper: new Paper( "<p>" + nonkeyword.repeat( 99 ) + "</p>", { keyword: "keyword" } ),
		researcher: new DefaultResearcher(),
		expectedResult: false,
	},
	{
		description: "does not apply to a paper with a text containing less than 100 words and without a keyword",
		paper: new Paper( "<p>" + nonkeyword.repeat( 99 ) + "</p>", { keyword: "" } ),
		researcher: new DefaultResearcher(),
		expectedResult: false,
	},
	{
		description: "applies to a Japanese paper with a keyword and a text of at least 200 characters",
		paper: new Paper( "<p>" + longTextJapanese + "</p>", { keyword: "keyword" } ),
		researcher: new JapaneseResearcher(),
		expectedResult: true,
	},
	{
		description: "does not apply to a Japanese paper with text of less than 200 characters",
		paper: new Paper( "<p>" + shortTextJapanese + "</p>", { keyword: "keyword" } ),
		researcher: new JapaneseResearcher(),
		expectedResult: false,
	},
];
describe.each( testDataForApplicability )( "assessment applicability test", ( {
	description,
	paper,
	researcher,
	expectedResult,
} ) => {
	researcher.setPaper( paper );
	buildTree( paper, researcher );
	it( description, () => {
		expect( new KeywordDensityAssessment().isApplicable( paper, researcher ) ).toBe( expectedResult );
	} );
} );

describe( "Tests for the keywordDensity assessment for languages with morphology", function() {
	it( "gives a GOOD result when keyword density is between 3 and 3.5%", function() {
		const paper = new Paper( nonkeyword.repeat( 968 ) + keyword.repeat( 32 ), { keyword: "keyword", locale: "en_EN" } );
		const researcher = new EnglishResearcher( paper );
		researcher.addResearchData( "morphology", morphologyData );
		buildTree( paper, researcher );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 9 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 32 times. This is great!" );
	} );

	it( "gives a GOOD result when keyword density is between 3 and 3.5%, also for other languages with morphology support", function() {
		const paper = new Paper( nonkeyword.repeat( 968 ) + keyword.repeat( 32 ), { keyword: "keyword", locale: "de_DE" } );
		const researcher = new GermanResearcher( paper );
		buildTree( paper, researcher );

		researcher.addResearchData( "morphology", morphologyDataDe );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 9 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 32 times. This is great!" );
	} );

	it( "gives a BAD result when keyword density is between 3 and 3.5%, if morphology support is added, but there is no morphology data", function() {
		const paper = new Paper( nonkeyword.repeat( 968 ) + keyword.repeat( 32 ), { keyword: "keyword", locale: "de_DE" } );
		const researcher = new GermanResearcher( paper );
		buildTree( paper, researcher );

		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( -10 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 32 times. That's more than the recommended maximum of 29 times for a text of this length. " +
			"<a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!" );
	} );
} );

describe( "A test for marking the keyword", function() {
	it( "returns markers", function() {
		const keywordDensityAssessment = new KeywordDensityAssessment();
		const paper = new Paper( "<p>This is a very interesting paper with a keyword and another keyword.</p>", { keyword: "keyword" }  );
		const researcher = new DefaultResearcher( paper );
		buildTree( paper, researcher );

		keywordDensityAssessment.getResult( paper, researcher );
		const expected = [
			new Mark( {
				marked: "This is a very interesting paper with a " +
					"<yoastmark class='yoast-text-mark'>keyword</yoastmark> and another " +
					"<yoastmark class='yoast-text-mark'>keyword</yoastmark>.",
				original: "This is a very interesting paper with a keyword and another keyword.",
				position: { endOffset: 50, startOffset: 43 },
			} ),
			new Mark( {
				marked: "This is a very interesting paper with a " +
					"<yoastmark class='yoast-text-mark'>keyword</yoastmark> and another " +
					"<yoastmark class='yoast-text-mark'>keyword</yoastmark>.",
				original: "This is a very interesting paper with a keyword and another keyword.",
				position: { endOffset: 70, startOffset: 63 },
			} ) ];
		expect( keywordDensityAssessment.getMarks() ).toEqual( expected );
	} );

	it( "returns markers for a keyphrase containing numbers", function() {
		const keywordDensityAssessment = new KeywordDensityAssessment();
		const paper = new Paper( "<p>This is the release of YoastSEO 9.3.</p>", { keyword: "YoastSEO 9.3" }  );

		const researcher = new DefaultResearcher( paper );
		buildTree( paper, researcher );

		keywordDensityAssessment.getResult( paper, researcher );
		const expected = [
			new Mark( { marked: "This is the release of <yoastmark class='yoast-text-mark'>YoastSEO 9.3</yoastmark>.",
				original: "This is the release of YoastSEO 9.3.",
				position: { startOffset: 26, endOffset: 38 } } ) ];
		expect( keywordDensityAssessment.getMarks() ).toEqual( expected );
	} );

	it( "returns markers for a keyphrase found in image caption", function() {
		const keywordDensityAssessment = new KeywordDensityAssessment();
		const paper = new Paper( "<p><img class='size-medium wp-image-33' src='http://basic.wordpress.test/wp-content/uploads/2021/08/" +
			"cat-3957861_1280-211x300.jpeg' alt='a different cat with toy' width='211' height='300'></img> " +
			"A flamboyant cat with a toy<br></br>\n" +
			"</p>",
		{ keyword: "cat toy" } );
		const researcher = new EnglishResearcher( paper );
		buildTree( paper, researcher );

		keywordDensityAssessment.getResult( paper, researcher );
		const expected = [
			new Mark( {
				marked: " A flamboyant <yoastmark class='yoast-text-mark'>cat</yoastmark> with a <yoastmark class='yoast-text-mark'>" +
					"toy</yoastmark>\n",
				original: " A flamboyant cat with a toy\n",
				position: { endOffset: 204, startOffset: 201 } } ),
			new Mark( {
				marked: " A flamboyant <yoastmark class='yoast-text-mark'>cat</yoastmark> with a <yoastmark class='yoast-text-mark'>" +
					"toy</yoastmark>\n",
				original: " A flamboyant cat with a toy\n", position: { endOffset: 215, startOffset: 212 } } ),
		];
		expect( keywordDensityAssessment.getMarks() ).toEqual( expected );
	} );

	// it( "returns markers for a Japanese keyphrase enclosed in double quotes", function() {
	// 	const paper = new Paper( japaneseSentenceWithKeyphraseExactMatch.repeat( 3 ), {
	// 		keyword: "『一冊の本を読む』",
	// 		locale: "ja",
	// 	} );
	// 	const researcher = new JapaneseResearcher( paper );
	// 	const assessment = new KeywordDensityAssessment();
	// 	researcher.addResearchData( "morphology", morphologyDataJA );
	//
	// 	const result = assessment.getResult( paper, researcher );
	// 	const marks = [
	// 		new Mark( {
	// 			marked: "一日<yoastmark class='yoast-text-mark'>一冊の本を読む</yoastmark>のはできるかどうかやってみます。",
	// 			original: "一日一冊の本を読むのはできるかどうかやってみます。",
	// 		} ),
	// 		new Mark( {
	// 			marked: "一日<yoastmark class='yoast-text-mark'>一冊の本を読む</yoastmark>のはできるかどうかやってみます。",
	// 			original: "一日一冊の本を読むのはできるかどうかやってみます。",
	// 		} ),
	// 		new Mark( {
	// 			marked: "一日<yoastmark class='yoast-text-mark'>一冊の本を読む</yoastmark>のはできるかどうかやってみます。",
	// 			original: "一日一冊の本を読むのはできるかどうかやってみます。",
	// 		} ),
	// 	];
	//
	// 	expect( result.getScore() ).toBe( -50 );
	// 	expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
	// 		"The keyphrase was found 3 times." +
	// 		" That's way more than the recommended maximum of 2 times for a text of this length. <a href='https://yoa.st/33w' target='_blank'>Don't" +
	// 		" overoptimize</a>!" );
	// 	expect( assessment.getMarks() ).toEqual( marks );
	// } );
} );

const japaneseSentence = "私の猫はかわいいです。小さくて可愛い花の刺繍に関する一般一般の記事です。".repeat( 20 );
const japaneseSentenceWithKeyphrase = "一日一冊の面白い本を買って読んでるのはできるかどうかやってみます。";
const japaneseSentenceWithKeyphraseExactMatch = "一日一冊の本を読むのはできるかどうかやってみます。";

const testDataJapanese = [
	{
		description: "shouldn't return NaN/infinity times of keyphrase occurrence when the keyphrase contains only function words " +
			"and there is no match in the text",
		paper: new Paper( "<p>" + japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 32 ) + "</p>", {
			keyword: "ばっかり",
			locale: "ja",
		} ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 0 times. That's less than the recommended minimum of 6 times for a text of this length. " +
				"<a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
	{
		description: "shouldn't return NaN/infinity times of synonym occurrence when the synonym contains only function words " +
			"and there is no match in the text",
		paper: new Paper( "<p>" + japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 32 ) + "</p>", {
			keyword: "",
			synonyms: "ばっかり",
			locale: "ja",
		} ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 0 times. That's less than the recommended minimum of 6 times for a text of this length. " +
				"<a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
	{
		description: "shouldn't return NaN/infinity times of keyphrase occurrence when the keyphrase contains spaces " +
			"and there is no match in the text",
		paper: new Paper( "<p>" + japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 32 ) + "</p>", {
			keyword: "かしら かい を ばっかり",
			locale: "ja",
		} ),
		expectedResult: {
			score: 4,
			text: "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
				"The keyphrase was found 0 times. That's less than the recommended minimum of 6 times for a text of this length. " +
				"<a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!",
		},
	},
];

describe.each( testDataJapanese )( "test for keyphrase density in Japanese", ( {
	description,
	paper,
	expectedResult,
} ) => {
	const researcher = new JapaneseResearcher( paper );
	researcher.addResearchData( "morphology", morphologyDataJA );
	buildTree( paper, researcher );
	const result = new KeywordDensityAssessment().getResult( paper, researcher );

	it( description, () => {
		expect( result.getScore() ).toBe( expectedResult.score );
		expect( result.getText() ).toBe( expectedResult.text );
	} );
} );

// eslint-disable-next-line no-warning-comments
// TODO: ADAPT the tests below.
xdescribe( "A test for keyword density in Japanese", function() {
	it( "gives a very BAD result when keyword density is above 4% when the text contains way too many instances" +
		" of the keyphrase forms", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 32 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( -50 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 32 times. That's way more than the recommended maximum of 23 times for a text of " +
			"this length. <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!" );
	} );

	it( "gives a BAD result when keyword density is between 3% and 4% when the text contains too many instances" +
		" of the keyphrase forms", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 16 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( -10 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>:" +
			" The keyphrase was found 16 times. That's more than the recommended maximum of 15 times for a text of this length." +
			" <a href='https://yoa.st/33w' target='_blank'>Don't overoptimize</a>!" );
	} );

	it( "gives a BAD result when keyword density is 0", function() {
		const paper = new Paper( japaneseSentence, { keyword: "一冊の本を読む", locale: "ja" } );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 4 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 0 times. That's less than the recommended minimum of 2 times for a text of this length." +
			" <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!" );
	} );

	it( "gives a BAD result when keyword density is between 0 and 0.5%", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 1 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 4 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>:" +
			" The keyphrase was found 1 time. That's less than the recommended minimum of 2 times for a text of this length." +
			" <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!" );
	} );

	it( "gives a GOOD result when keyword density is between 0.5% and 3.5% when the text contains keyphrase forms", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 8 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 9 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 8 times. This is great!" );
	} );

	it( "gives a GOOD result when keyword density is between 0.5% and 3%, when the exact match of the keyphrase is in the text", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphraseExactMatch.repeat( 8 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 9 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 8 times. This is great!" );
	} );

	it( "should still gives a GOOD result when keyword density is between 0.5% and 3%, when the exact match of the keyphrase is in the text " +
		"and the keyphrase is enclosed in double quotes", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphraseExactMatch.repeat( 8 ), {
			keyword: "「一冊の本を読む」",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 9 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 8 times. This is great!" );
	} );

	it( "gives a BAD result when keyword density is between 0.5% and 3.5%, if morphology is added, but there is no morphology data", function() {
		const paper = new Paper( japaneseSentence + japaneseSentenceWithKeyphrase.repeat( 8 ), {
			keyword: "一冊の本を読む",
			locale: "ja",
		} );
		const researcher = new JapaneseResearcher( paper );
		const result = new KeywordDensityAssessment().getResult( paper, researcher );
		expect( result.getScore() ).toBe( 4 );
		expect( result.getText() ).toBe( "<a href='https://yoa.st/33v' target='_blank'>Keyphrase density</a>: " +
			"The keyphrase was found 0 times. That's less than the recommended minimum of 2 times for a text of this length." +
			" <a href='https://yoa.st/33w' target='_blank'>Focus on your keyphrase</a>!" );
	} );
} );

