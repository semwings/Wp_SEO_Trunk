import TagInput from ".";
import { useCallback, useState } from "@wordpress/element";

export default {
	title: "1. Elements/Tag Input",
	component: TagInput,
	parameters: {
		docs: {
			description: {
				component: "A simple tag input component.",
			},
		},
	},
	argTypes: {
		children: { control: false },
	},
	args: {
		tags: [
			"tags1",
			"tags2",
			"tags3",
		],
	},
};

const Template = args => {
	const [ tags, setTags ] = useState( args?.tags || [] );
	const addTag = useCallback( tag => {
		setTags( [ ...tags, tag ] );
	}, [ tags, setTags ] );
	const removeTag = useCallback( index => {
		setTags( [ ...tags.slice( 0, index ), ...tags.slice( index + 1 ) ] );
	}, [ tags, setTags ] );

	return (
		<TagInput { ...args } tags={ tags } onAddTag={ addTag } onRemoveTag={ removeTag } />
	);
};

export const Factory = Template.bind( {} );

Factory.parameters = {
	controls: { disable: false },
};

export const TagsInLines = Template.bind( {} );

TagsInLines.args = {
	tags: [
		"These are",
		"hopefully",
		"enough",
		"tags",
		"to show",
		"that",
		"this component",
		"will",
		"wrap around",
		"and",
		"continue",
		"on the next line.",
		"This is a longer tag that includes spaces!",
	],
};

TagsInLines.parameters = { docs: { description: { story: "The line grows to contain more than one line of tags, and shrinks back to one line when tags are removed." } } };
