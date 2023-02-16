import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Question } from "../App"
import { AppThunk, RootState } from "../app/store"

/**
 * Reducers
 */
const setQuestions = ( state: GradingState, action: PayloadAction<Question[]> ) => {
	state.questions = action.payload
}

/**
 * Selectors
 */
// Selects all the questions from the store
export const selectQuestions = ( state: RootState ) => (
	state.grading.questions
)

/**
 * Thunks
 */
// Initializes the questions for the exam in the store
export const initializeQuestions: AppThunk<void> = async ( dispatch, getState ) => {
	const state = getState()

	const res = await fetch( "/api/questions", {
		// Adding headers to the request
		headers: {
			"Content-type": "application/json; charset=UTF-8",
			"token": state.exam.token
		}
	} )
	const json = await res.json()
	const questions: Question[] = json.questions

	dispatch( gradingActions.setQuestions( questions ) )
}

export interface GradingState {
	questions: Question[]
	scoresMap: Map<string, number>
}

const initialState: GradingState = {
	questions: [],
	scoresMap: new Map<string, number>()
}

export const gradingSlice = createSlice( {
	name: "grading",
	initialState,
	reducers: {
		setQuestions
	}
} )

export const gradingActions = gradingSlice.actions
export default gradingSlice.reducer
