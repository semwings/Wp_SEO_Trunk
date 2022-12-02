import { isFollowedByException } from "./isFollowedByException";
import { isFollowedByParticiple } from "./isFollowedByParticiple";
import { nonNouns } from "../../../../languageProcessing/languages/en/config/functionWords";
import { punctuationList } from "../../../../languageProcessing/helpers/sanitize/removePunctuation";
import { getWords } from "../../../../languageProcessing";

// Filter tokens from the exception lists that cause trouble when passed to getWords.
const filteredPunctuationList = punctuationList.filter( punctMark => getWords( punctMark, false ).length > 0  );
const filteredFunctionWords = nonNouns.filter( functionWord => getWords( functionWord, false ).length > 0 );


/**
 * Returns a callback that checks whether a non inclusive word is standalone:
 * "The undocumented are there". is not inclusive, "The undocumented" is standalone.
 * "The undocumented people are there." is inclusive, in "The undocumented people", "the undocumented" is not standalon.
 * @param {string[]} words A list of words that is being queried.
 * @param {string[]} nonInclusivePhrase A list of words that are the non inclusive phrase.
 * @returns {function} A callback that checks whether a non inclusive term is standalon.
 */
export default function notInclusiveWhenStandalone( words, nonInclusivePhrase ) {
	return ( index ) => {
		return isFollowedByException( words, nonInclusivePhrase, filteredFunctionWords )( index ) ||
        isFollowedByParticiple( words, nonInclusivePhrase )( index ) ||
        isFollowedByException( words, nonInclusivePhrase, filteredPunctuationList )( index );
	};
}
