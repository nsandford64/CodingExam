import React from "react"
import { Provider } from "react-redux"
import { Question, QuestionType } from "../../App"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { EnhancedStore } from "@reduxjs/toolkit"
import { ParsonsProblem } from "../parsonsProblem"

const mockQuestion: Question = {
	answers: [ "test1", "test2" ],
	id: 0,
	text: "test",
	type: QuestionType.ParsonsProblem
}

describe( "parsonsProblem component", () => {
	let container: HTMLDivElement
	let store: EnhancedStore

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
		store = createMockStore( mockQuestion )
	} )

	it( "renders the correct label and items", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={store}>
					<ParsonsProblem 
						questionId={mockQuestion.id}
					/>
				</Provider>
			)
		} )

		const labels = container.querySelectorAll( ".bp4-label" )
		const test1Block = container.querySelector( "[data-rbd-draggable-id='test1']" )
		const test2Block = container.querySelector( "[data-rbd-draggable-id='test2']" )

		// Label for the question text
		expect( labels[0]?.textContent ).toEqual( "test" )
		// Labels for the parsonsColumns
		expect( labels[1]?.textContent ).toEqual( "Drag from here" )
		expect( labels[2]?.textContent ).toEqual( "Construct your solution here" )
		// Blocks inside the columns
		expect( test1Block ).toBeTruthy()
		expect( test2Block ).toBeTruthy()
	} )
} )
