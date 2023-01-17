import Paper from "../../../src/values/Paper";
import EnglishResearcher from "../../../src/languageProcessing/languages/en/Researcher";
import checkPPAttachment from "../../../src/languageProcessing/researches/checkPPAttachment";

describe( "Check for syntactically ambiguous sentences with PP attachment", function() {
	it( "should find that some sentences are ambiguous", function() {
		const mockPaper = new Paper(
			"John saw cops with large telescopes. " +
			"John saw the large cop with a big telescope riding a bike. " +
			"John saw the cop. " +
			"The police shot the rioters with guns. "
		);
		const mockResearcher = new EnglishResearcher( mockPaper );

		expect( checkPPAttachment( mockPaper, mockResearcher ) ).toEqual(
			[
				{
					sentence: "John saw cops with large telescopes.",
					reading1: "saw with telescopes",
					reading2: "cops with telescopes",
					construction: [ "saw", "cops", "with", "large", "telescopes" ],
				},
				{
					sentence: "John saw the large cop with a big telescope riding a bike.",
					reading1: "saw with a telescope",
					reading2: "cop with a telescope",
					construction: [ "saw", "the", "large", "cop", "with", "a", "big", "telescope" ],
				},
				{
					sentence: "The police shot the rioters with guns.",
					reading1: "shot with guns",
					reading2: "rioters with guns",
					construction: [ "shot", "the", "rioters", "with", "guns" ],
				},
			] );
	} );
} );
