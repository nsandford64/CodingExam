// Copyright 2022 under MIT License

import { createSlice } from "@reduxjs/toolkit"
import { Question, Response } from "../App"

/**
 * Reducers
 */

/**
 * Selectors
 */

/**
 * Slice
 */
export interface ExamState {
	questions: Question[]
	responsesMap: Map<number, Response>
}

const initialState: ExamState = {
	questions: [],
	responsesMap: new Map<number, Response>()
}

export const examSlice = createSlice( {
	name: "exam",
	initialState,
	reducers: {}
} )

export const examActions = examSlice.actions