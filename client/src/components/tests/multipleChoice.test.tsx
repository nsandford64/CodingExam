import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { MultipleChoice } from "../multipleChoice"
import examReducer, { ExamState } from "../../slices/examSlice"
import { configureStore } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { Question, QuestionType, Response } from "../../App"

test( "multipleChoice component", () => {
	const question: Question = {
		answers: [ "test1", "test2", "test3", "test4" ],
		id: 0,
		text: "test",
		type: QuestionType.MultipleChoice
	}

	const examState: ExamState = {
		questionIds: [ 0 ],
		questionsMap: new Map<number, Question>( [
			[ 0, question ]
		] ),
		responseIds: [],
		responsesMap: new Map<number, Response>(),
		responseState: ""
	}

	const rootState: RootState = {
		exam: examState
	}
	
	const mockStore = configureStore( {
		reducer: {
			exam: examReducer
		},
		preloadedState: rootState
	} )

	render(
		<Provider store={mockStore}>
			<MultipleChoice 
				questionId={question.id}
			/>
		</Provider>
	)
} )
