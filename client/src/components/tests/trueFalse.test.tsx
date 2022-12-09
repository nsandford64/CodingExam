// Copyright 2022 under MIT License
import React from "react"
import { Provider } from "react-redux"
import { Question, QuestionType } from "../../App"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { TrueFalse } from "../trueFalse"
import { EnhancedStore } from "@reduxjs/toolkit"

const mockQuestion: Question = {
	answers: [],
	id: 0,
	text: "test",
	type: QuestionType.TrueFalse
}

describe( "trueFalse component", () => {
	let container: HTMLDivElement
	let store: EnhancedStore

	beforeEach( () => {
		container = document.createElement( "div" )
		document.body.appendChild( container )
		store = createMockStore( mockQuestion )
	} )

	it( "renders the correct label and answer choices", () => {
		act( () => {
			ReactDOM.createRoot( container ).render(
				<Provider store={store}>
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
