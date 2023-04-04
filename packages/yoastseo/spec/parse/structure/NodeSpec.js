import Node from "../../../src/parse/structure/Node";
import LanguageProcessor from "../../../src/parse/language/LanguageProcessor";
import Factory from "../../specHelpers/factory";
import build from "../../../src/parse/build/build";
import memoizedSentenceTokenizer from "../../../src/languageProcessing/helpers/sentence/memoizedSentenceTokenizer";

describe( "A test for the Node object", () => {
	it( "should correctly create a simple Node object", function() {
		expect( new Node( "name", {}, [] ) ).toEqual( { name: "name", attributes: {}, childNodes: [] } );
	} );
} );

describe( "A test for the findAll method", () => {
	it( "should find all occurrences of a p tag", function() {
		const html = "<div><p class='yoast'>Hello, world! </p><p class='yoast'>Hello, yoast!</p></div>";

		const researcher = Factory.buildMockResearcher( {}, true, false, false,
			{ memoizedTokenizer: memoizedSentenceTokenizer } );
		const languageProcessor = new LanguageProcessor( researcher );

		const tree = build( html, languageProcessor );

		const searchResult = tree.findAll( ( node ) => node.name === "p" );

		const expected = [ {
			name: "p",
			attributes: { "class": new Set( [ "yoast" ] ) },
			childNodes: [ { name: "#text", value: "Hello, world! " } ],
			isImplicit: false,
			sentences: [ {
				text: "Hello, world!",
				sourceCodeRange: { startOffset: 22, endOffset: 35 },
				tokens: [
					{ text: "Hello" },
					{ text: "," },
					{ text: " " },
					{ text: "world" },
					{ text: "!" },
				],
			} ],
			sourceCodeLocation: {
				startOffset: 5,
				endOffset: 40,
				startTag: {
					startOffset: 5,
					endOffset: 22,
				},
				endTag: {
					startOffset: 36,
					endOffset: 40,
				},
			},
		},
		{
			name: "p",
			attributes: { "class": new Set( [ "yoast" ] ) },
			childNodes: [ { name: "#text", value: "Hello, yoast!" } ],
			isImplicit: false,
			sentences: [ {
				text: "Hello, yoast!",
				sourceCodeRange: { startOffset: 57, endOffset: 70 },
				tokens: [
					{ text: "Hello" },
					{ text: "," },
					{ text: " " },
					{ text: "yoast" },
					{ text: "!" },
				],
			} ],
			sourceCodeLocation: {
				startOffset: 40,
				endOffset: 74,
				startTag: {
					startOffset: 40,
					endOffset: 57,
				},
				endTag: {
					startOffset: 70,
					endOffset: 74,
				},
			},
		} ];

		expect( searchResult ).toEqual( expected );
	} );
} );

describe( "A test for the innerText method", () => {
	const html = "<div><p class='yoast'>Hello, world! </p><p class='yoast'>Hello, yoast!</p></div>";

	const researcher = Factory.buildMockResearcher( {}, true, false, false,
		{ memoizedTokenizer: memoizedSentenceTokenizer } );
	const languageProcessor = new LanguageProcessor( researcher );

	const tree = build( html, languageProcessor );

	const innerText = tree.innerText();

	expect( innerText ).toEqual( "Hello, world! Hello, yoast!" );
} );
