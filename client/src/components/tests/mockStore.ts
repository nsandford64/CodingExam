import { configureStore } from "@reduxjs/toolkit"
import { Confidence, Feedback, Question, Response } from "../../App"
import { RootState } from "../../app/store"
import examReducer, { ExamState } from "../../slices/examSlice"
import { GradingState } from "../../slices/gradingSlice"

/**
 * CreateMockStore()
 * 
 * This method creates a mock store, initiallizing it with the 
 * mockQuestion that is passed. This is explicitly used for testing
 * and nowhere else.
 */
export const createMockStore = ( ( mockQuestion: Question ) => {
	const examState: ExamState = {
		questionIds: [ 0 ],
		questionsMap: new Map<number, Question>( [
			[ mockQuestion.id, mockQuestion ]
		] ),
		responseIds: [],
		responsesMap: new Map<number, Response>(),
		responseState: "",
		confidenceIds: [],
		confidenceMap: new Map<number, Confidence>(),
		feedbackIds: [],
		feedbackMap: new Map<number, Feedback>(),
		nextQuestionId: 0,
		token: ""
	}

	const gradingState: GradingState = {
		questions: [],
		scoresMap: new Map<string, number>()
	}

	const rootState: RootState = {
		exam: examState,
		grading: gradingState
	}
	
	return configureStore( {
		reducer: {
			exam: examReducer
		},
		preloadedState: rootState
	} )
} )

