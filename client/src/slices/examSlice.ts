// Copyright 2022 under MIT License

import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Question, Response } from "../App"
import { RootState } from "../app/store"

/**
 * Reducers
 */
const setQuestionIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.questionIds = action.payload
}
const setQuestionsMap = ( state: ExamState, action: PayloadAction<Map<number, Question>> ) => {
	state.questionsMap = action.payload
}

const setResponseIds = ( state: ExamState, action: PayloadAction<number[]> ) => {
	state.responseIds = action.payload
}
const setResponsesMap = ( state: ExamState, action: PayloadAction<Map<number, Response>> ) => {
	state.responsesMap = action.payload
}

const updateResponse = ( state: ExamState, action: PayloadAction<Response> ) => {
	state.responsesMap.set( action.payload.questionId, action.payload )
}

const setResponseState = ( state: ExamState, action: PayloadAction<string> ) => {
	state.responseState = action.payload
}

/**
 * Selectors
 */
export const selectQuestionIds = ( state: RootState ) => (
	state.exam.questionIds
)
export const selectQuestionsMap = ( state: RootState ) => (
	state.exam.questionsMap
)
export const selectQuestionById = createSelector(
	selectQuestionsMap,
	( state: RootState, id: number ) => id,
	( questionsMap, id ) => questionsMap.get( id )
)

export const selectResponsesMap = ( state: RootState ) => (
	state.exam.responsesMap
)
export const selectResponseById = createSelector(
	selectResponsesMap,
	( state: RootState, id: number ) => id,
	( responsesMap, id ) => responsesMap.get( id )
)

export const selectResponseState = ( state: RootState ) => (
	state.exam.responseState
)

/**
 * Slice
 */
export interface ExamState {
	questionIds: number[]
	questionsMap: Map<number, Question>
	responseIds: number[]
	responsesMap: Map<number, Response>
	responseState: string
}

const initialState: ExamState = {
	questionIds: [],
	questionsMap: new Map<number, Question>(),
	responseIds: [],
	responsesMap: new Map<number, Response>(),
	responseState: ""
}

export const examSlice = createSlice( {
	name: "exam",
	initialState,
	reducers: {
		setQuestionIds,
		setQuestionsMap,
		setResponseIds,
		setResponsesMap,
		updateResponse,
		setResponseState
	}
} )

export const examActions = examSlice.actions

export default examSlice.reducer