import renderer from "react-test-renderer"
import { MultipleChoice } from "../src/components/multipleChoice"

it( "changes state when option is selected", () => {
	const component = renderer.create(
		<MultipleChoice/>,
	)
	let tree = component.toJSON()

	renderer.act( () => {
		tree.props.handleChange()
	} )

	tree = component.toJSON()
	expect( tree ).toMatchSnapshot()

} )