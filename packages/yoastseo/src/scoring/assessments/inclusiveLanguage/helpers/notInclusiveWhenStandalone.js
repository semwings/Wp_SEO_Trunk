import { isFollowedByException } from "./isFollowedByException";
import { isFollowedByParticiple } from "./isFollowedByParticiple";
import { nonNouns } from "../../../../languageProcessing/languages/en/config/functionWords";
import { punctuationList } from "../../../../languageProcessing/helpers/sanitize/removePunctuation";
import { getWords } from "../../../../languageProcessing";

// Filter tokens from the exception lists that cause trouble when passed to getWords.

// Some punctuation marks are still removed in get words, as they are not in our punctuation list.
// Those are filtered out to prevent getting back an empty list.
const filteredPunctuationList = punctuationList.filter( punctuationMark => getWords( punctuationMark, false ).length > 0  );

// Somehow, an empyty string ended up in the list of functionwords. This will make getWords return an empty list.
const filteredFunctionWords = nonNouns.filter( functionWord => getWords( functionWord, false ).length > 0 );


/**
 * Returns a callback that checks whether a non-inclusive word is standalone:
 * "The undocumented are there". is not inclusive, "The undocumented" is standalone.
 * "The undocumented people are there." is inclusive, in "The undocumented people", "the undocumented" is not standalone.
 * @param {string[]} words A list of words that is being queried.
 * @param {string[]} nonInclusivePhrase A list of words that are the non-inclusive phrase.
 * @returns {function} A callback that checks whether a non-inclusive term is standalone.
 */
export default function notInclusiveWhenStandalone( words, nonInclusivePhrase ) {
	return ( index ) => {
		return isFollowedByException( words, nonInclusivePhrase, filteredFunctionWords )( index ) ||
        isFollowedByParticiple( words, nonInclusivePhrase )( index ) ||
        isFollowedByException( words, nonInclusivePhrase, filteredPunctuationList )( index );
	};
}
