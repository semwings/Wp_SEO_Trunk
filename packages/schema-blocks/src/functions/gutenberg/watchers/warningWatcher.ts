import { dispatch } from "@wordpress/data";
import { BlockInstance, createBlock } from "@wordpress/blocks";

import { getBlockDefinition } from "../../../core/blocks/BlockDefinitionRepository";
import InnerBlocks from "../../../instructions/blocks/InnerBlocks";
import recurseOverBlocks from "../../blocks/recurseOverBlocks";
import { mapBlocksRecursively } from "../../innerBlocksHelper";
import BlockDefinition from "../../../core/blocks/BlockDefinition";
import { InstructionObject } from "../../../core/Instruction";
import { getBlockType } from "../../BlockHelper";

enum WarningType {
	BLOCK_REQUIRED,
	BLOCK_RECOMMENDED
}

/**
 * Gets the inner blocks instruction of the block definition with the given name.
 *
 * Returns `null` if no block definition with this name exists.
 *
 * @param blockName The name of the block definition.
 *
 * @returns The inner blocks instruction if it exists, `null` if not.
 */
function getInnerBlocksInstruction( blockName: string ): InnerBlocks | null {
	const blockDefinition: BlockDefinition = getBlockDefinition( blockName );

	if ( ! blockDefinition ) {
		return null;
	}

	return Object.values( blockDefinition.instructions )
		.find( instruction => instruction instanceof InnerBlocks ) as InnerBlocks;
}

/**
 * Creates a warning block.
 *
 * @param innerBlock The inner block that has been removed.
 * @param message The message that should be shown in the warning.
 * @param warningType The type of warning to show, either for a required or a recommended block.
 *
 * @returns The warning block.
 */
function createWarning( innerBlock: BlockInstance, message: string, warningType: WarningType ): BlockInstance {
	if ( ! message ) {
		const blockType = getBlockType( innerBlock.name );
		message = `You've just removed the ‘${ blockType.title }’ block, but this is a required block for Schema output.
Without this block no Schema will be generated. Do you want this?`;
	}

	const attributes = {
		removedBlock: innerBlock,
		isRequired: warningType === WarningType.BLOCK_REQUIRED,
		warningText: message,
	};

	return createBlock( "yoast/warning-block", attributes );
}

/**
 * Creates and adds warnings as replacements for the given list of removed blocks.
 *
 * @param removedBlocks The list of removed blocks.
 * @param parentBlock The parent of the removed blocks.
 * @param warnings An object mapping block types to the warning that needs to be shown in the warning.
 * @param warningType The type of warning, either recommended or required.
 */
function addWarnings(
	removedBlocks: BlockInstance[],
	parentBlock: BlockInstance,
	warnings: InstructionObject,
	warningType: WarningType,
) {
	removedBlocks.forEach( ( removedBlock ) => {
		const index = parentBlock.innerBlocks.findIndex( aBlock => aBlock.clientId === removedBlock.clientId );
		const message = warnings[ parentBlock.clientId ] as string;
		const warning = createWarning( removedBlock, message, warningType );

		dispatch( "core/block-editor" ).insertBlock( warning, index, parentBlock.clientId );
	} );
}

/**
 * Adds the removal warnings for the removed required inner blocks.
 *
 * @param parentBlock The parent block of the inner blocks.
 * @param removedInnerBlocks The removed inner blocks.
 * @param innerBlocksInstruction The inner block instruction of the parent block.
 */
function addWarningsForRequiredBlocks(
	parentBlock: BlockInstance,
	removedInnerBlocks: BlockInstance[],
	innerBlocksInstruction: InnerBlocks,
) {
	const requiredBlocks = innerBlocksInstruction.options.requiredBlocks || [];
	const removedRequiredInnerBlocks = removedInnerBlocks
		.filter( innerBlock => requiredBlocks.some( requiredBlock => innerBlock.name === requiredBlock.name ) );
	addWarnings(
		removedRequiredInnerBlocks,
		parentBlock,
		innerBlocksInstruction.options.warnings,
		WarningType.BLOCK_REQUIRED,
	);
}

/**
 * Adds the removal warnings for the removed recommended inner blocks.
 *
 * @param parentBlock The parent block of the inner blocks.
 * @param removedInnerBlocks The removed inner blocks.
 * @param innerBlocksInstruction The inner block instruction of the parent block.
 */
function addWarningsForRecommendedBlocks(
	parentBlock: BlockInstance,
	removedInnerBlocks: BlockInstance[],
	innerBlocksInstruction: InnerBlocks,
) {
	const recommendedBlocks = innerBlocksInstruction.options.recommendedBlocks || [];
	const removedRecommendedInnerBlocks = removedInnerBlocks
		.filter( innerBlock => recommendedBlocks.some( recommendedBlockName => innerBlock.name === recommendedBlockName ) );
	addWarnings(
		removedRecommendedInnerBlocks,
		parentBlock,
		innerBlocksInstruction.options.warnings,
		WarningType.BLOCK_RECOMMENDED,
	);
}

/**
 * Compares the current list of blocks with the previous list of blocks and
 * checks whether any were removed. If a required or recommended block was removed,
 * a warning block is added in its place.
 *
 * @param blocks The current list of blocks.
 * @param previousBlocks The previous list of blocks.
 */
export default function warningWatcher( blocks: BlockInstance[], previousBlocks: BlockInstance[] = [] ): void {
	const currentBlockIds = mapBlocksRecursively( blocks, block => block.clientId );

	recurseOverBlocks( previousBlocks, ( block: BlockInstance ) => {
		if ( ! block.innerBlocks || block.innerBlocks.length === 0 ) {
			return;
		}

		const removedInnerBlocks = block.innerBlocks
			.filter( innerBlock => ! currentBlockIds.includes( innerBlock.clientId ) );

		if ( removedInnerBlocks.length === 0 ) {
			return;
		}

		const innerBlocksInstruction: InnerBlocks = getInnerBlocksInstruction( block.name );

		if ( ! innerBlocksInstruction ) {
			return;
		}

		addWarningsForRequiredBlocks( block, removedInnerBlocks, innerBlocksInstruction );
		addWarningsForRecommendedBlocks( block, removedInnerBlocks, innerBlocksInstruction );
	} );
}
