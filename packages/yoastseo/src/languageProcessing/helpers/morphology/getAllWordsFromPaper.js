import { escapeRegExp } from "lodash-es";
import getAltAttribute from "../image/getAltAttribute";
import { normalizeSingle } from "../sanitize/quotes";
import parseSlug from "../url/parseSlug";
import getWords from "../word/getWords";
import getImagesInTree from "../image/getImagesInTree";

/**
 * Gets all words found in the text, title, slug and meta description of a given paper.
 *
 * @param {Paper} paper     The paper for which to get the words.
 *
 * @returns {string[]} All words found.
 */
export default function( paper ) {
	const paperText = paper.getText();
	const altTagsInText = getImagesInTree( paper ).map( image => getAltAttribute( image ) );

	const paperContent = [
		paperText,
		paper.getTitle(),
		paper.getSlug(),
		parseSlug( paper.getSlug() ),
		paper.getDescription(),
		altTagsInText.join( " " ),
	].join( " " );

	return getWords( paperContent ).map(
		word => normalizeSingle( escapeRegExp( word ) ) );
}
