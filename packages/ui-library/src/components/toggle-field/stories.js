import { useCallback, useState } from "@wordpress/element";
import { StoryComponent } from ".";
import Badge from "../../elements/badge";

export default {
	title: "2) Components/Toggle field",
	component: StoryComponent,
	argTypes: {
		children: { control: "text" },
		description: { control: "text" },
		labelSuffix: { control: "text" },
	},
	parameters: {
		docs: {
			description: {
				component: "A simple toggle field component.",
			},
		},
	},
};

const Template = ( args ) => {
	const [ checked, setChecked ] = useState( args.checked || false );
	const handleChange = useCallback( setChecked, [ setChecked ] );

	return (
		<StoryComponent { ...args } checked={ checked } onChange={ handleChange } />
	);
};

export const Factory = Template.bind( {} );
Factory.parameters = {
	controls: { disable: false },
};

Factory.args = {
	id: "factory-id",
	label: "A toggle field",
};

export const WithLabelAndDescription = Template.bind( {} );
WithLabelAndDescription.storyName = "With label and description";
WithLabelAndDescription.args = {
	id: "id-1",
	name: "name-1",
	label: "Toggle field with a label that spans multiple lines is still centered nicely with the toggle",
	children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a nisi egestas, accumsan ante quis, accumsan nisi. Duis lacinia pharetra luctus. Aliquam nisi orci, mattis quis lacus tristique, tempus pulvinar lectus. Nam rutrum vitae arcu at ullamcorper. Sed in felis blandit, consectetur nulla eu, congue justo. Suspendisse a augue a arcu lacinia tristique. Integer finibus dui sit amet pulvinar placerat. Phasellus a erat nec odio aliquet maximus id viverra nunc. Aliquam finibus malesuada est id dapibus. Curabitur suscipit lorem vitae sodales malesuada.",
};

export const Checked = Template.bind( {} );
Checked.args = {
	id: "id-2",
	name: "name-2",
	checked: true,
	label: "Checked toggle field",
};

export const WithLabelSuffix = Template.bind( {} );
WithLabelSuffix.storyName = "With label suffix";
WithLabelSuffix.args = {
	id: "id-3",
	name: "name-3",
	checked: true,
	label: "Label suffix toggle field",
	labelSuffix: <Badge className="yst-ml-1.5" variant="upsell">Premium</Badge>,
};
