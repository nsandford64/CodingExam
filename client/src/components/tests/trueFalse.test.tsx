import React from "react"
import { Provider } from "react-redux"
import { Question, QuestionType } from "../../App"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { TrueFalse } from "../trueFalse"

const mockQuestion: Question = {
	answers: [],
	id: 0,
	text: "test",
	type: QuestionType.TrueFalse
}

describe( "trueFalse component", () => {
	let container: HTMLDivElement

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
	} )

	it( "renders the correct label and answer choices", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={createMockStore( mockQuestion )}>
					<TrueFalse 
						questionId={mockQuestion.id}
					/>
				</Provider>
			)
		} )

		const label = container.querySelector( ".bp4-label" )
		const choices = container.querySelectorAll( ".bp4-radio" )

		expect( label?.textContent ).toEqual( "test" )
		expect( choices[0]?.textContent ).toEqual( "False" )
		expect( choices[1]?.textContent ).toEqual( "True" )
	} )
} )
