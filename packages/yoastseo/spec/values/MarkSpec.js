import Mark from "../../src/values/Mark";

describe( "a mark value object", function() {
	it( "should have default properties", function() {
		const mark = new Mark( {} );

		expect( mark.getOriginal() ).toBe( "" );
		expect( mark.getMarked() ).toBe( "" );
	} );

	it( "should allow new value via the constructor", function() {
		const mark = new Mark( { original: "original", marked: "marked", fieldsToMark: [ "heading" ] } );

		expect( mark.getOriginal() ).toBe( "original" );
		expect( mark.getMarked() ).toBe( "marked" );
		expect( mark.getFieldsToMark() ).toEqual( [ "heading" ] );
	} );

	describe( "replacement-based application", function() {
		it( "should be able to apply itself by replacing text", function() {
			const mark = new Mark( { original: "original", marked: "marked" } );
			const text = "original";
			const expected = "marked";

			expect( mark.applyWithReplace( text ) ).toBe( expected );
		} );

		it( "should apply to all occurrences", function() {
			const mark = new Mark( { original: "original", marked: "marked" } );
			const text = "original original original original original original original";
			const expected = "marked marked marked marked marked marked marked";

			expect( mark.applyWithReplace( text ) ).toBe( expected );
		} );
	} );

	describe( "position-based application", function() {
		it( "should return the start and end offset of the position set via the constructor", () => {
			const mark = new Mark( { position: { startOffset: 3, endOffset: 28 } } );
			expect( mark.getPositionStart() ).toBe( 3 );
			expect( mark.getPositionEnd() ).toBe( 28 );
		} );
		it( "should return falsy for the start and end offset of the position when the position is not set via the constructor", () => {
			const mark = new Mark( { original: "original", marked: "marked" } );
			expect( mark.getPositionStart() ).toBeFalsy();
			expect( mark.getPositionEnd() ).toBeFalsy();
		} );
		it( "should be able to apply itself by replacing at given positions", function() {
			const mark = new Mark( { position: { startOffset: 3, endOffset: 28 } } );
			const text = "<p>Hello <span>World!</span></p>";
			const expected = "<p><yoastmark class='yoast-text-mark'>Hello <span>World!</span></yoastmark></p>";

			expect( mark.applyWithPosition( text ) ).toBe( expected );
		} );
	} );
} );
