import React from "react"
import { Provider } from "react-redux"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { Question, QuestionType } from "../../App"
import { ShortAnswer } from "../shortAnswer"
import { EnhancedStore } from "@reduxjs/toolkit"

const mockQuestion: Question = {
	answers: [],
	id: 0,
	text: "test",
	type: QuestionType.ShortAnswer
}

describe( "shortAnswer component", () => {
	let container: HTMLDivElement
	let store: EnhancedStore

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
		store = createMockStore( mockQuestion )
	} )

	it( "renders the correct label and an empty text box", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={store}>
					<ShortAnswer 
						questionId={mockQuestion.id}
					/>
				</Provider>
			)
		} )

		const label = container.querySelector( ".bp4-label" )
		const textArea = container.querySelector( "textarea" )

		expect( label?.textContent ).toEqual( "test" )
		expect( textArea ).toBeTruthy()
		expect( textArea?.textContent ).toBe( "" )
	} )
} )
