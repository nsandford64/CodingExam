// Copyright 2022 under MIT License

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import type {PayloadAction, ThunkAction, AnyAction} from "@reduxjs/toolkit"
import { Feedback, Question, Response, Confidence } from "../App"
import type { AppThunk, RootState } from "../app/store"

/**
 * Reducers
 */

// Set the questionIds array in the store
const setQuestionIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.questionIds = action.payload
}
// Set the questionsMap map in the store
const setQuestionsMap = ( state: ExamState, action: PayloadAction<Map<number, Question>> ) => {
	state.questionsMap = action.payload
}
// Update the questionsMap in the store to have the new Question
const updateQuestion = ( state: ExamState, action: PayloadAction<Question> ) => {
	if( !state.questionIds.includes( action.payload.id ) ) {
		state.questionIds.push( action.payload.id )
	}
	state.questionsMap.set( action.payload.id, action.payload )
}
// Delete a question from the questionsMap and questionIds array
const deleteQuestion = ( state: ExamState, action: PayloadAction<number> ) => {
	state.questionIds = state.questionIds.filter( id => id !== action.payload )
	state.questionsMap.delete( action.payload )
}

// Set the responseIds array in the store
const setResponseIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.responseIds = action.payload
}
// Set the responsesMap map in the store
const setResponsesMap = ( state: ExamState, action: PayloadAction<Map<number, Response>> ) => {
	state.responsesMap = action.payload
}
// Update the responsesMap in the store to have the new Response
const updateResponse = ( state: ExamState, action: PayloadAction<Response> ) => {
	if( !state.responseIds.includes( action.payload.questionId ) ) {
		state.responseIds.push( action.payload.questionId )
	}
	state.responsesMap.set( action.payload.questionId, action.payload )
}

// Set the responseState in the store
const setResponseState = ( state: ExamState, action: PayloadAction<string> ) => {
	state.responseState = action.payload
}

// Set the feedbackIds array in the store
const setFeedbackIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.feedbackIds = action.payload
}
// Set the feedbackMap map in the store
const setFeedbackMap = ( state:ExamState, action: PayloadAction<Map<number, Feedback>> ) => {
	state.feedbackMap = action.payload
}
// Update the feedbackMap in the store to have the new Feedback
const updateFeedback = ( state: ExamState, action: PayloadAction<Feedback> ) => {
	state.feedbackMap.set( action.payload.questionId, action.payload )
}

// Set the confidenceIds array in the store
const setConfidenceIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.confidenceIds = action.payload
}
// Set the confidenceMap map in the store
const setConfidenceMap = ( state:ExamState, action: PayloadAction<Map<number, Confidence>> ) => {
	state.confidenceMap = action.payload
}
// Update the confidenceMap in the store to have the new Confidence
const updateConfidence = ( state: ExamState, action: PayloadAction<Confidence> ) => {
	state.confidenceMap.set( action.payload.questionId, action.payload )
}

// Increment the nextQuestionId
const incrementNextQuestionId = ( state: ExamState ) => {
	state.nextQuestionId++
}

// Advance the NextQuestionId to the specified amount
const advanceNextQuestionId = ( state: ExamState, action: PayloadAction<number> ) => {
	state.nextQuestionId = action.payload
}

// Sets the token in the store
const setToken = ( state: ExamState, action: PayloadAction<string> ) => {
	state.token = action.payload
}

// Re-initializes the store
const reInitializeStore = ( state: ExamState ) => {
	// Reset everything besides the token
	state.questionIds = initialState.questionIds
	state.questionsMap = initialState.questionsMap
	state.responseIds = initialState.responseIds
	state.responsesMap = initialState.responsesMap
	state.responseState = initialState.responseState
	state.feedbackIds = initialState.feedbackIds
	state.feedbackMap = initialState.feedbackMap
	state.confidenceIds = initialState.confidenceIds
	state.confidenceMap = initialState.confidenceMap
	state.nextQuestionId = initialState.nextQuestionId
}

/**
 * Selectors
 */

// Select all questionIds
export const selectQuestionIds = ( state: RootState ) => (
	state.exam.questionIds
)
// Select the questionsMap
export const selectQuestionsMap = ( state: RootState ) => (
	state.exam.questionsMap
)
// Select a Question from the store with the given id
export const selectQuestionById = createSelector(
	selectQuestionsMap,
	( state: RootState, id: number ) => id,
	( questionsMap, id ) => questionsMap.get( id )
)

// Select the responsesMap
export const selectResponsesMap = ( state: RootState ) => (
	state.exam.responsesMap
)
// Select a Response from the store with the given id
export const selectResponseById = createSelector(
	selectResponsesMap,
	( state: RootState, id: number ) => id,
	( responsesMap, id ) => responsesMap.get( id )
)

// Select the responseState
export const selectResponseState = ( state: RootState ) => (
	state.exam.responseState
)

// Select the feedbackMap
export const selectFeedbackMap = ( state: RootState ) => (
	state.exam.feedbackMap
)
// Select a Feedback from the store with the given id
export const selectFeedbackById = createSelector(
	selectFeedbackMap,
	( state: RootState, id: number ) => id,
	( feedbackMap, id ) => feedbackMap.get( id )
)

// Select the confidenceMap
export const selectConfidenceMap = ( state: RootState ) => (
	state.exam.confidenceMap
)
// Select a Confidence from the store with the given id
export const selectConfidenceById = createSelector(
	selectConfidenceMap,
	( state: RootState, id: number ) => id,
	( confidenceMap, id ) => confidenceMap.get( id )
)

// Select the next questionId
export const selectNextQuestionId = ( state: RootState ) => (
	state.exam.nextQuestionId
)

// Selects the token from the store
export const selectToken = ( state: RootState ) => (
	state.exam.token
)

/**
 * Thunks
 */
/*
// Gets an unused exam question id from the database using the server api
export const fetchNextQuestionId = 
	(): AppThunk<void> => 
	async (dispatch, getState) => {
		const state = getState()

		const res = await fetch( "/api/nextquestionid", {
			// Adding headers to the request
			headers: {
				"token": state.exam.token
			}
		})
		const json = await res.json()
		dispatch(advanceNextQuestionId(json.nextID));
	}
*/
// Creates an exam in the database using the server api
export const createExamThunk: AppThunk<void> = async ( dispatch, getState ) => {
	const state = getState()

	const questions: Question[] = []
	state.exam.questionIds.forEach( id => {
		const question = state.exam.questionsMap.get( id )
		if( question ) {
			questions.push( question )
		}
	} )

	const res = await fetch( "/api/instructor/createexam", {
		// Adding method type
		method: "POST",

		// Adding body or contents to send
		body: JSON.stringify( questions ),
     
		// Adding headers to the request
		headers: {
			"Content-type": "application/json; charset=UTF-8",
			"token": state.exam.token
		}
	} )

	const json = await res.json()

	console.log( json )
}

/**
 * Slice
 */
export interface ExamState {
	questionIds: number[]
	questionsMap: Map<number, Question>
	responseIds: number[]
	responsesMap: Map<number, Response>
	responseState: string,
	feedbackIds: number[],
	feedbackMap: Map<number, Feedback>,
	confidenceIds: number[],
	confidenceMap: Map<number, Confidence>,
	nextQuestionId: number,
	token: string
}

const initialState: ExamState = {
	questionIds: [],
	questionsMap: new Map<number, Question>(),
	responseIds: [],
	responsesMap: new Map<number, Response>(),
	responseState: "",
	feedbackIds: [],
	feedbackMap: new Map<number, Feedback>(),
	confidenceIds: [],
	confidenceMap: new Map<number, Confidence>(),
	nextQuestionId: 10,
	token: ""
}

export const examSlice = createSlice( {
	name: "exam",
	initialState,
	reducers: {
		setQuestionIds,
		setQuestionsMap,
		updateQuestion,
		deleteQuestion,
		setResponseIds,
		setResponsesMap,
		updateResponse,
		setResponseState,
		setFeedbackIds,
		setFeedbackMap,
		updateFeedback,
		setConfidenceIds,
		setConfidenceMap,
		updateConfidence,
		incrementNextQuestionId,
		advanceNextQuestionId,
		setToken,
		reInitializeStore
	}
} )

export const examActions = examSlice.actions

export default examSlice.reducer