// Copyright 2022 under MIT License
import React from "react"
import { Provider } from "react-redux"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { Question, QuestionType } from "../../App"
import { EnhancedStore } from "@reduxjs/toolkit"
import { FeedbackBox } from "../feedbackBox"

const mockQuestion: Question = {
	answers: [],
	id: 0,
	text: "test",
	type: QuestionType.TrueFalse
}

describe( "feedbackBox component", () => {
	let container: HTMLDivElement
	let store: EnhancedStore

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
		store = createMockStore( mockQuestion )
	} )

	it( "renders an empty text box", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={store}>
					<FeedbackBox 
						questionId={mockQuestion.id}
					/>
				</Provider>
			)
		} )

		const textArea = container.querySelector( "textarea" )

		expect( textArea ).toBeTruthy()
		expect( textArea?.textContent ).toBe( "" )
	} )
} )
