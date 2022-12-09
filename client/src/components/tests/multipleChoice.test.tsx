// Copyright 2022 under MIT License
import React from "react"
import { Provider } from "react-redux"
import { MultipleChoice } from "../multipleChoice"
import { Question, QuestionType } from "../../App"
import { act } from "react-dom/test-utils"
import ReactDOM from "react-dom/client"
import { createMockStore } from "./mockStore"
import { EnhancedStore } from "@reduxjs/toolkit"

const mockQuestion: Question = {
	answers: [ "test1", "test2", "test3", "test4" ],
	id: 0,
	text: "test",
	type: QuestionType.MultipleChoice
}

describe( "multipleChoice component", () => {
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
					<MultipleChoice 
						questionId={mockQuestion.id}
					/>
				</Provider>
			)
		} )

		const label = container.querySelector( ".bp4-label" )
		const choices = container.querySelectorAll( ".bp4-radio" )

		expect( label?.textContent ).toEqual( "test" )
		expect( choices[0]?.textContent ).toEqual( "test1" )
		expect( choices[1]?.textContent ).toEqual( "test2" )
		expect( choices[2]?.textContent ).toEqual( "test3" )
		expect( choices[3]?.textContent ).toEqual( "test4" )
	} )
} )
