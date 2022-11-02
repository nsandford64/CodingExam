import { configureStore } from "@reduxjs/toolkit"
import { Question, Response } from "../../App"
import { RootState } from "../../app/store"
import examReducer, { ExamState } from "../../slices/examSlice"

export const createMockStore = ( ( mockQuestion: Question ) => {
	const examState: ExamState = {
		questionIds: [ 0 ],
		questionsMap: new Map<number, Question>( [
			[ mockQuestion.id, mockQuestion ]
		] ),
		responseIds: [],
		responsesMap: new Map<number, Response>(),
		responseState: ""
	}

	const rootState: RootState = {
		exam: examState
	}
	
	return configureStore( {
		reducer: {
			exam: examReducer
		},
		preloadedState: rootState
	} )
} )

