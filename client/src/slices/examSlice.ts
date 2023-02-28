// Copyright 2022 under MIT License
import { createSelector, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { Feedback, Question, Confidence, Submission } from "../App"
import type { AppThunk, RootState } from "../app/store"
import { batch } from "react-redux"

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

// Set the canvasUserIds array in the store
const setCanvasUserIds = ( state: ExamState, action: PayloadAction<string[]> ) => {
	state.canvasUserIds = action.payload
}
// Set the submissionsMap map in the store
const setSubmissionsMap = ( state: ExamState, action: PayloadAction<Map<string, Map<number, Submission>>> ) => {
	state.submissionsMap = action.payload
}
// Update the submissionsMap in the store to have the new Submission
const updateSubmission = ( state: ExamState, action: PayloadAction<Submission> ) => {
	const canvasUserId = action.payload.canvasUserId || "student"

	const currentSubmissions = state.submissionsMap.get( canvasUserId ) || new Map<number, Submission>()
	currentSubmissions.set( action.payload.questionId, action.payload )
 
	state.submissionsMap.set( canvasUserId, currentSubmissions )
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

// Set next question ID based on response from server
const setNextQuestionId = ( state: ExamState, action: PayloadAction<number> ) => {
	state.nextQuestionId = action.payload
}

// Sets the token in the store
const setToken = ( state: ExamState, action: PayloadAction<string> ) => {
	state.token = action.payload
}

// Re-initializes the store
const reInitializeStore = ( state: ExamState, action: PayloadAction<number> ) => {
	// Reset everything besides the token
	state.questionIds = initialState.questionIds
	state.questionsMap = initialState.questionsMap
	state.submissionsMap = initialState.submissionsMap
	state.canvasUserIds = initialState.canvasUserIds
	state.responseState = initialState.responseState
	state.feedbackIds = initialState.feedbackIds
	state.feedbackMap = initialState.feedbackMap
	state.confidenceIds = initialState.confidenceIds
	state.confidenceMap = initialState.confidenceMap
	state.nextQuestionId = action.payload
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

// Select the submissionsMap
export const selectSubmissionsMap = ( state: RootState ) => (
	state.exam.submissionsMap
)
// Select the submissions from the store with the given canvasUserId
export const selectSubmissionByUserIdAndQuestionId = createSelector(
	selectSubmissionsMap,
	( _: RootState, questionId: number ) => questionId,
	( _: RootState , __: number, canvasUserId?: string ) => canvasUserId || "student",
	( submissionsMap, questionId, canvasUserId ) => {
		const submissions = submissionsMap.get( canvasUserId )
		return submissions?.get( questionId )
	}
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
export const initializeQuestions = ( canvasUserId?: string ): AppThunk<Promise<void>> => async ( dispatch, getState ) => {
	const state = getState()

	const token = selectToken( state )

	// Fetch exam questions
	let data = await fetch( "/api/questions", {
		headers: {
			"token": token
		} 
	} )
			
	let json  = await data.json()
	const questions: Question[] = json.questions

	// Loop through questions and create ids and a map
	const newQuestionIds: number[] = []
	const newQuestionsMap = new Map<number, Question>()
	questions.forEach( question => {
		newQuestionIds.push( question.id )
		newQuestionsMap.set( question.id, question )
	} )

	// Fetch exam submissions (if there are any)
	data = await fetch( "/api/submissions", {
		headers: {
			"token": token,
			"userID": canvasUserId || ""
		}
	} )

	json = await data.json()
	const submissions: Submission[] = json.submissions

	/*
	Loop through submissions and create ids and a map 
	for submissions and for confidence ratings
	*/
	const newSubmissionsMap = new Map<string, Map<number, Submission>>()
	submissions.forEach( submission => {
		const canvasUserId = "student"

		const currentSubmissions = newSubmissionsMap.get( canvasUserId ) || new Map<number, Submission>()
		currentSubmissions.set( submission.questionId, submission )

		newSubmissionsMap.set( canvasUserId, currentSubmissions )
	} )

	// Fetch exam confidence ratings 
	data = await fetch( "/api/confidence", {
		headers: {
			"token": token,
			"userID": canvasUserId || ""
		}
	} )

	json = await data.json()
	const confidence: Confidence[] = json.confidence

	// Loop through the confidence and create ids and a map
	const newConfidenceIds: number[] = []
	const newConfidenceMap = new Map<number, Confidence>()
	confidence.forEach( confidence => {
		newConfidenceIds.push( confidence.questionId )
		newConfidenceMap.set( confidence.questionId, confidence )
	} )

	// Fetch exam feedback
	data = await fetch( "/api/feedback", {
		headers: {
			"token": token,
			"userID": canvasUserId || ""
		}
	} )

	json = await data.json()
	const feedback: Feedback[] = json.feedback

	// Loop through the feedback and create ids and a map
	const newFeedbackIds: number[] = []
	const newFeedbackMap = new Map<number, Feedback>()
	feedback.forEach( feedback => {
		newFeedbackIds.push( feedback.questionId )
		newFeedbackMap.set( feedback.questionId, feedback )
	} )

	// Update the store
	batch( () => {
		dispatch( examActions.setFeedbackIds( newFeedbackIds ) )
		dispatch( examActions.setFeedbackMap( newFeedbackMap ) )
		dispatch( examActions.setQuestionIds( newQuestionIds ) )
		dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
		dispatch( examActions.setSubmissionsMap( newSubmissionsMap ) )
		dispatch( examActions.setConfidenceIds( newConfidenceIds ) )
		dispatch( examActions.setConfidenceMap( newConfidenceMap ) )
	} )
}

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
	canvasUserIds: string[]
	submissionsMap: Map<string, Map<number, Submission>>
	responseState: string,
	feedbackIds: number[],
	feedbackMap: Map<number, Feedback>,
	confidenceIds: number[],
	confidenceMap: Map<number, Confidence>,
	nextQuestionId?: number,
	token: string
}

const initialState: ExamState = {
	questionIds: [],
	questionsMap: new Map<number, Question>(),
	canvasUserIds: [],
	submissionsMap: new Map<string, Map<number, Submission>>(),
	responseState: "",
	feedbackIds: [],
	feedbackMap: new Map<number, Feedback>(),
	confidenceIds: [],
	confidenceMap: new Map<number, Confidence>(),
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
		setCanvasUserIds,
		setSubmissionsMap,
		updateSubmission,
		setResponseState,
		setFeedbackIds,
		setFeedbackMap,
		updateFeedback,
		setConfidenceIds,
		setConfidenceMap,
		updateConfidence,
		setNextQuestionId,
		setToken,
		reInitializeStore
	}
} )

export const examActions = examSlice.actions
export default examSlice.reducer