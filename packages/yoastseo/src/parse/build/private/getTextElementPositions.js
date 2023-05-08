import { Paragraph } from "../../structure";

/**
 * Gets the start and end positions of all descendant nodes' tags and stores them in an array.
 * Each object in the array represents an opening or closing tag.
 * The startOffset and endOffset properties of the objects correspond to the start and end positions of the tags.
 * Extracting this data into a separate array makes it easier to work with it (e.g. sort it and loop over it).
 *
 * @param {Node[]} descendantNodes	The descendant nodes to get tag positions from.
 *
 * @returns {SourceCodeRange[]}	An array of the locations of each start and end tag in the source code.
 *
 */
function getDescendantPositions( descendantNodes ) {
	const descendantTagPositions = [];
	descendantNodes.forEach( ( node ) => {
		if ( node.sourceCodeLocation.startTag ) {
			descendantTagPositions.push( node.sourceCodeLocation.startTag );
		}
		if ( node.sourceCodeLocation.endTag ) {
			descendantTagPositions.push( node.sourceCodeLocation.endTag );
		}
	} );
	// Sort the tag position objects by the start tag position in ascending order.
	descendantTagPositions.sort( ( a, b ) => a.startOffset - b.startOffset );

	return descendantTagPositions;
}

/**
 * Adjusts the end position of the text element to account for descendant node tags that overlap with the text element.
 * We want to add the length of tags that are directly preceding the start of the text, or that are between the start
 * and end of the text, to the end position of the text element.
 * For example, if the text is "<span><em>Hello</em>, world!</span>", the length of all tags except for the closing
 * </span> tag should be added to the end position of the sentence.
 *
 * @param {Node[]}				descendantNodes			The descendant nodes.
 * @param {SourceCodeRange[]}	descendantTagPositions	The positions of the descendant nodes' tags.
 * @param {number}				textElementStart		The start position of a text element.
 * @param {number}				textElementEnd			The end position of a text element.
 *
 * @returns {number}	The adjusted end position of the text element.
 */
function adjustElementEnd( descendantNodes, descendantTagPositions, textElementStart, textElementEnd ) {
	/*
	 * If the start position of a descendant's node tag is between the start and end position of the text element, or is
	 * the same as the start/end position of the text element, add the tag's length to the end position of the text element.
	 */
	descendantTagPositions.forEach( ( position ) => {
		if ( position.startOffset >= textElementStart && position.startOffset < textElementEnd ) {
			textElementEnd += ( position.endOffset - position.startOffset );
		}
	} );

	return textElementEnd;
}

/**
 * Adjusts the start position of the text element to account for any descendant node tags that overlap with the text element.
 * @param {Node[]} descendantNodes The descendant nodes.
 * @param {SourceCodeRange[]} descendantTagPositions The positions of the descendant nodes' tags.
 * @param {Number} textElementStart The start position of a text element.
 *
 * @returns {Number} The adjusted start position of the text element.
 */
function adjustTextElementStart( descendantNodes, descendantTagPositions, textElementStart ) {
	/*
	 * If the start position of a descendant's node tag is between the start and end position of the text element, or is
	 * the same as the start/end position of the text element, add the tag's length to the end position of the text element.
	 */
	descendantTagPositions.forEach( ( position ) => {
		if ( position.startOffset >= textElementStart && position.startOffset <= textElementStart ) {
			textElementStart += ( position.endOffset - position.startOffset );
		}
	} );

	return textElementStart;
}

/**
 * Gets the start and end positions of text elements (sentences or tokens) in the source code.
 *
 * @param {Paragraph|Heading} 		node  			The paragraph or heading node.
 * @param {Sentence[]|Token[]} 		textElements 	The sentences or tokens in the node.
 * @param {number} 					startOffset 	The start position of the node in the source code.
 * Defaults to -1 which signals that it should not be used.
 *
 * @returns {Sentence[]|Token[]} The sentences or tokens, with their positions in the source code.
 */
export default function getTextElementPositions( node, textElements, startOffset = -1 ) {
	// We cannot calculate positions if there are no text elements, or if we don't know the node's source code location.
	if (  textElements.length === 0 || ! node.sourceCodeLocation ) {
		return textElements;
	}

	/*
	 * Set the start position of the first element. If the node is an implicit paragraph, which don't have start and
	 * end tags, set the start position to the start of the node. Otherwise, set the start position to the end of the
	 * node's start tag.
	 */
	let textElementStart;
	if ( node instanceof Paragraph && node.isImplicit ) {
		textElementStart = node.sourceCodeLocation.startOffset;
	} else {
		textElementStart = startOffset >= 0 ? startOffset : node.sourceCodeLocation.startTag.endOffset;
	}
	let textElementEnd;
	let descendantTagPositions = [];

	/*
	 * Check if the node has any descendant nodes that have a sourceCodeLocation property (all nodes other than Text nodes
	 * should have this property). If such nodes exist, store the positions of each node's opening and closing tags in
	 * an array. These positions will have to be taken into account when calculating the position of the text elements.
	 */
	const descendantNodes = node.findAll( descendantNode => descendantNode.sourceCodeLocation, true );
	if ( descendantNodes.length > 0 ) {
		descendantTagPositions = getDescendantPositions( descendantNodes );
	}

	textElements.forEach( ( textElement ) => {
		// Set the end position to the start position + the length of the textElement.
		textElementEnd = textElementStart + textElement.text.length;

		/*
		 * If there are descendant tags, possibly adjust the textElementEnd and textElementStart.
		 * The textElementEnd should be adjusted to include the length of any descendant tags until the end of the text, in
		 * addition to the length of the text itself. Descendant tags AFTER the end of the text should not be included.
		 * The textElementStart should be adjusted so that it is where the actual text starts, not including any descendant
		 * tags preceding the text.
		 */
		if ( descendantTagPositions.length > 0 ) {
			textElementEnd = adjustElementEnd( descendantNodes, descendantTagPositions, textElementStart, textElementEnd );

			textElementStart = adjustTextElementStart( descendantNodes, descendantTagPositions, textElementStart, textElementEnd );
		}

		// Add the start and end positions to the textElement object.
		textElement.sourceCodeRange = { startOffset: textElementStart, endOffset: textElementEnd };

		// Start position of the next textElement is the end position of current textElement.
		textElementStart = textElementEnd;
	} );

	return textElements;
}
