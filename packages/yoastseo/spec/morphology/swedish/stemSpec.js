import stem from "../../../src/morphology/swedish/stem";
import getMorphologyData from "../../specHelpers/getMorphologyData";

const morphologyDataSV = getMorphologyData( "sv" ).sv;

const wordsToStem = [
	// Input a noun with one of the following suffixes: a arna erna heterna orna ad e ade ande arne are aste en anden aren heten ern ar er heter or as arnas ernas ornas es ades andes ens arens hetens erns at andet het ast
	[ "abba", "abb" ],
	[ "abborre", "abborr" ],
	[ "aktierna", "akti" ],
	[ "angelagenheterna", "angelagen" ],
	[ "altartavlorna", "altartavl" ],
	[ "afskaffande", "afskaff" ],
	[ "avgrundsanden", "avgrunds" ],
	// Input a word with one of the following suffixes: dd   gd   nn   dt   gt   kt   tt
	[ "noggrann", "noggran" ],
	[ "oafgjordt", "oafgjord" ],
	[ "andfadd", "andfad" ],
	[ "anlagd", "anlag" ],
	[ "oanständigt", "oanständ" ],
	[ "afmätta", "afmät" ],
	[ "afstyrkt", "afstyrk" ],
	// Input a word with one of the following suffixes: löst fullt lig ig els
	[ "verkningslöst", "verkningslös" ],
	[ "värdefullt", "värdefull" ],
	[ "alldaglig", "alldag" ],
	["barnslighet", "barns"],
];
describe( "Test for stemming Swedish words", () => {
	it( "stems Swedish words", () => {
		wordsToStem.forEach( wordToStem => expect( stem( wordToStem[ 0 ], morphologyDataSV ) ).toBe( wordToStem[ 1 ] ) );
	} );
} );

