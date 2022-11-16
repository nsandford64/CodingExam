// Copyright 2022 under MIT License

import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
//import { Column } from "postgres"
import { Feedback, Question, Response } from "../App"
import { AppThunk, RootState } from "../app/store"

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

// Increment the nextQuestionId
const incrementNextQuestionId = ( state: ExamState ) => {
	state.nextQuestionId++
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

// Select the next questionId
export const selectNextQuestionId = ( state: RootState ) => (
	state.exam.nextQuestionId
)

/**
 * Thunks
 */

// Creates an exam in the database using the server api
export const createExamThunk: AppThunk<void> = ( dispatch, getState ) => {
	const state = getState()

	const questions: Question[] = []
	state.exam.questionIds.forEach( id => {
		const question = state.exam.questionsMap.get( id )
		if( question ) {
			questions.push( question )
		}
	} )

	console.log( questions )
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
	nextQuestionId: number
}

const initialState: ExamState = {
	questionIds: [],
	questionsMap: new Map<number, Question>(),
	responseIds: [],
	responsesMap: new Map<number, Response>(),
	responseState: "",
	feedbackIds: [],
	feedbackMap: new Map<number, Feedback>(),
	nextQuestionId: 0
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
		incrementNextQuestionId,
	}
} )

export const examActions = examSlice.actions

export default examSlice.reducer