import LanguageProcessor from "../../../src/parse/language/LanguageProcessor";
import Factory from "../../specHelpers/factory";
import memoizedSentenceTokenizer from "../../../src/languageProcessing/helpers/sentence/memoizedSentenceTokenizer";

const researcher = Factory.buildMockResearcher( {}, true, false, false,
	{ memoizedTokenizer: memoizedSentenceTokenizer } );

describe( "A test for the LanguageProcessor object", () => {
	it( "should correctly create a simple LanguageProcessor object", function() {
		expect( new LanguageProcessor( researcher ) ).toEqual( { researcher: researcher } );
	} );
} );

describe( "A test for the splitIntoSentences method", () => {
	it( "should return an array of sentence objects", function() {
		const languageProcessor = new LanguageProcessor( researcher );

		const sentences = languageProcessor.splitIntoSentences( "Hello, world! Hello, Yoast!" );
		expect( sentences ).toEqual( [ { text: "Hello, world!", tokens: [] }, { text: " Hello, Yoast!", tokens: [] } ] );
	} );
	it( "the last sentence should not consist of a whitespace if the text ends in a whitespace", function() {
		const languageProcessor = new LanguageProcessor( researcher );

		const sentences = languageProcessor.splitIntoSentences( "Hello, world! Hello, Yoast! " );
		expect( sentences ).toEqual( [ { text: "Hello, world!", tokens: [] }, { text: " Hello, Yoast!", tokens: [] }  ] );
	} );
} );

describe( "A test for the splitIntoTokens method", () => {
	it( "should return an array of sentence tokens", function() {
		const languageProcessor = new LanguageProcessor( researcher );

		const tokens = languageProcessor.splitIntoTokens( { text: "Hello, world!" } );
		expect( tokens ).toEqual( [ "Hello", ",", " ", "world", "!" ] );
	} );
	it( "the last sentence should not consist of a whitespace if the text ends in a whitespace", function() {
		const languageProcessor = new LanguageProcessor( researcher );

		const sentences = languageProcessor.splitIntoSentences( "Hello, world! Hello, Yoast! " );
		expect( sentences ).toEqual( [ { text: "Hello, world!", tokens: [] }, { text: " Hello, Yoast!", tokens: [] }  ] );
	} );
} );
