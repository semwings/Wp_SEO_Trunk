/* External dependencies */
import { isFunction, flatMap } from "lodash";
// The WP annotations package isn't loaded by default so force loading it.
import "@wordpress/annotations";
import { select, dispatch } from "@wordpress/data";
import getFieldsToMarkHelper from "./helpers/getFieldsToMarkHelper";
import { getAnnotationsForYoastBlock, getAnnotationsForWPBlock } from "./helpers/getAnnotationsHelpers";

const ANNOTATION_SOURCE = "yoast";

let annotationQueue = [];

const ANNOTATION_ATTRIBUTES = {
	"core/paragraph": [
		{
			key: "content",
		},
	],
	"core/list": [
		{
			key: "values",
			multilineTag: "li",
			multilineWrapperTag: [ "ul", "ol" ],
		},
	],
	"core/list-item": [
		{
			key: "content",
		},
	],
	"core/heading": [
		{
			key: "content",
		},
	],
	"core/audio": [
		{
			key: "caption",
		},
	],
	"core/embed": [
		{
			key: "caption",
		},
	],
	"core/gallery": [
		{
			key: "caption",
		},
	],
	"core/image": [
		{
			key: "caption",
		},
	],
	"core/table": [
		{
			key: "caption",
		},
	],
	"core/video": [
		{
			key: "caption",
		},
	],
	"yoast/faq-block": [
		{
			key: "questions",
		},
	],
	// Note: for Yoast How-To block, there are actually two attribute keys that are annotatable: steps and jsonDescription.
	"yoast/how-to-block": [
		{
			key: "steps",
		},
		{
			key: "jsonDescription",
		},
	],
};

const ASSESSMENT_SPECIFIC_ANNOTATION_ATTRIBUTES = {
	singleH1: {
		"core/heading": [
			{
				key: "content",
				filter: ( blockAttributes ) => {
					return blockAttributes.level === 1;
				},
			},
		],
	},
};

/**
 * Retrieves the next annotation from the annotation queue.
 *
 * @returns {Object} An annotation object that can be applied to Gutenberg.
 */
function getNextAnnotation() {
	return annotationQueue.shift();
}

/**
 * Applies the next time annotation in the queue.
 *
 * @returns {void}
 */
function applyAnnotationQueueItem() {
	const nextAnnotation = getNextAnnotation();

	if ( ! nextAnnotation ) {
		return;
	}

	dispatch( "core/annotations" ).__experimentalAddAnnotation( nextAnnotation );

	// eslint-disable-next-line no-use-before-define
	scheduleAnnotationQueueApplication();
}

/**
 * Schedules the application of the next available annotation in the queue.
 *
 * @returns {void}
 */
function scheduleAnnotationQueueApplication() {
	if ( isFunction( window.requestIdleCallback ) ) {
		window.requestIdleCallback( applyAnnotationQueueItem, { timeout: 1000 } );
	} else {
		setTimeout( applyAnnotationQueueItem, 150 );
	}
}

/**
 * Returns whether annotations are available in Gutenberg.
 *
 * @returns {boolean} Whether or not annotations are available in Gutenberg.
 */
export function isAnnotationAvailable() {
	return select( "core/block-editor" ) && isFunction( select( "core/block-editor" ).getBlocks ) &&
		select( "core/annotations" ) && isFunction( dispatch( "core/annotations" ).__experimentalAddAnnotation );
}

/**
 * Returns an array of all the attributes of which we can annotate text for, for a specific block type name.
 *
 * @param {string} blockTypeName The name of the block type.
 * @returns {string[]} The attributes that we can annotate.
 */
function getAnnotatableAttributes( blockTypeName ) {
	const activeMarker = select( "yoast-seo/editor" ).getActiveMarker();

	const assessmentAttributes = ASSESSMENT_SPECIFIC_ANNOTATION_ATTRIBUTES[ activeMarker ] || ANNOTATION_ATTRIBUTES;

	if ( ! assessmentAttributes.hasOwnProperty( blockTypeName ) ) {
		return [];
	}

	return assessmentAttributes[ blockTypeName ];
}

/**
 * Checks if a block has innerblocks.
 *
 * @param {Object} block The block with potential inner blocks
 *
 * @returns {boolean} True if the block has innerblocks, False otherwise.
 */
export function hasInnerBlocks( block ) {
	return block.innerBlocks.length > 0;
}

/**
 * Removes all annotations from the editor.
 *
 * @returns {void}
 */
function removeAllAnnotations() {
	annotationQueue = [];
	dispatch( "core/annotations" ).__experimentalRemoveAnnotationsBySource( ANNOTATION_SOURCE );
}

/**
 * Formats annotations to objects the Gutenberg annotations API works with, and adds
 * them to the queue to be scheduled for adding them to the editor.
 *
 * @param {array} annotations Annotations to be mapped to the queue.
 *
 * @returns {void}
 */
function fillAnnotationQueue( annotations ) {
	annotationQueue = annotations.map( ( annotation ) => ( {
		blockClientId: annotation.block,
		source: ANNOTATION_SOURCE,
		richTextIdentifier: annotation.richTextIdentifier,
		range: {
			start: annotation.startOffset,
			end: annotation.endOffset,
		},
	} ) );
}

/**
 * Gets the annotations for a single block.
 *
 * @param { Object } block The block for which the annotations need to be determined.
 * @param { Mark[] } marks A list of marks that could apply to the block.
 * @returns { Object[] } All annotations that need to be placed on the block.
 */
const getAnnotationsForABlock = ( block, marks ) => {
	return flatMap(
		getAnnotatableAttributes( block.name ),
		( ( attribute ) => {
			// Get the annotations for Yoast FAQ and How-To blocks.
			if ( block.name === "yoast/faq-block" || block.name === "yoast/how-to-block" ) {
				return getAnnotationsForYoastBlock( attribute, block, marks );
			}
			// Get the annotation for non-Yoast blocks.
			return getAnnotationsForWPBlock( attribute, block, marks );
		} )
	);
};


/**
 * Takes a list of blocks and matches those with a list of marks, in order to create an array of annotations.
 *
 * NOTE: This is a recursive function! If a block has innerBlocks (children) it will recurse over them.
 *
 * @param {Object[]} blocks An array of block objects (or innerBlock objects) from the gutenberg editor.
 * @param {Mark[]} marks An array of Mark objects.
 *
 * @returns {Object[]} An array of annotation objects.
 */
export function getAnnotationsForBlocks( blocks, marks ) {
	return flatMap( blocks, ( block ) => {
		// If a block has innerblocks, get annotations for those blocks as well.
		const innerBlockAnnotations = hasInnerBlocks( block ) ?  getAnnotationsForBlocks( block.innerBlocks, marks ) : [];
		return getAnnotationsForABlock( block, marks ).concat( innerBlockAnnotations );
	} );
}

/**
 * Applies the given marks as annotations in the block editor.
 *
 * @param {Mark[]} marks The marks to annotate in the text.
 *
 * @returns {void}
 */
export function applyAsAnnotations( marks ) {
	// Do this always to allow people to select a different eye marker while another one is active.
	removeAllAnnotations();
	const fieldsToMark = getFieldsToMarkHelper(  marks  );

	if ( marks.length === 0 ) {
		return;
	}

	let blocks = select( "core/block-editor" ).getBlocks();

	if ( fieldsToMark.length > 0 ) {
		blocks = blocks.filter( block => fieldsToMark.some( field => "core/" + field === block.name ) );
	}

	const annotations = getAnnotationsForBlocks( blocks, marks );

	fillAnnotationQueue( annotations );

	scheduleAnnotationQueueApplication();
}

/**
 * Remove all annotations on a block.
 *
 * @param {string} blockClientId The block client id.
 *
 * @returns {void}
 */
function removeAllAnnotationsFromBlock( blockClientId ) {
	const annotationsInBlock = select( "core/annotations" )
		.__experimentalGetAnnotations()
		.filter( annotation => annotation.blockClientId === blockClientId && annotation.source === ANNOTATION_SOURCE );

	annotationsInBlock.forEach( annotation => {
		dispatch( "core/annotations" ).__experimentalRemoveAnnotation( annotation.id );
	} );
}

/**
 * Reapply annotations in the currently selected block.
 *
 * @returns {void}
 */
export function reapplyAnnotationsForSelectedBlock() {
	const block = select( "core/editor" ).getSelectedBlock();
	const activeMarkerId  = select( "yoast-seo/editor" ).getActiveMarker();

	if ( ! block || ! activeMarkerId ) {
		return;
	}

	removeAllAnnotationsFromBlock( block.clientId );

	const activeMarker = select( "yoast-seo/editor" ).getResultById( activeMarkerId );

	if ( typeof activeMarker === "undefined" ) {
		return;
	}

	const marksForActiveMarker = activeMarker.marks;

	const annotations = getAnnotationsForABlock( block, marksForActiveMarker );

	fillAnnotationQueue( annotations );

	scheduleAnnotationQueueApplication();
}
