// Copyright 2022 under MIT License
import React from "react"
import { Provider } from "react-redux"
import { Question, QuestionType } from "../../App"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { EnhancedStore } from "@reduxjs/toolkit"
import { CodingAnswer } from "../codingAnswer"

const mockQuestion: Question = {
	answers: [],
	id: 0,
	text: "test:java",
	type: QuestionType.CodingAnswer
}

describe( "codingAnswer component", () => {
	let container: HTMLDivElement
	let store: EnhancedStore

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
		store = createMockStore( mockQuestion )
	} )

	it( "renders the correct label and the text editor", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={store}>
					<CodingAnswer 
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
