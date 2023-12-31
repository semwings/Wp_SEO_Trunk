import wordCount from "../helpers/word/countWords.js";
import removeHtmlBlocks from "../helpers/html/htmlParser";

/**
 * A result of the word count calculation.
 *
 * @typedef WordCountResult
 * @param {number} count The number of words found in the text.
 * @param {"word"} unit The unit used in the text length calculations, always "word".
 */

/**
 * Count the words in the text.
 *
 * @param {Paper} paper The Paper object.
 *
 * @returns {WordCountResult} The number of words found in the text, plus "word" as the unit used in calculating the text length.
 */
export default function( paper ) {
	let text = paper.getText();
	text = removeHtmlBlocks( text );
	return {
		text: text,
		count: wordCount( text ),
		unit: "word",
	};
}
