// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { MultipleChoice } from "./components/multipleChoice"
import { ShortAnswer } from "./components/shortAnswer"
import { TrueFalse } from "./components/trueFalse"
import { examActions, selectQuestionById, selectQuestionIds, selectResponsesMap, selectResponseState } from "./slices/examSlice"

/**
 * QuestionType Enum
 * 
 * This enum maps a database QuestionType to a more readable
 * format for development.
 */
enum QuestionType {
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3,
	MultipleAnswer = 4,
}

/**
 * Style for the App
 */
const StyledApp = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * Container to hold the exam questions
 */
const StyledQuestionsContainer = styled.div`
`

/**
 * App Component
 * 
 * Main entry to the application - this renders an exam and displays
 * each question to the user. It also handles submission of the exam
 * to the database.
 */
export const App = React.memo( () => {

	// Dispatches an action to the Redux store
	const dispatch = useAppDispatch()

	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of responses from the store
	const responsesMap = useAppSelector( selectResponsesMap )

	const responseState = useAppSelector( selectResponseState )

	// Stores the JWT token
	const [ token, setToken ] = React.useState( "" )

	/**
	 * Runs on render - it pulls in the questions for a given examID (this will
	 * eventually be dynamic). It also pulls in responses from the database,
	 * populating the app if the user has progress in the exam.
	 */
	React.useEffect( () => {
		// Initialize questions and responses to those questions
		const initQuestions = async () => {			
			const tokenValue = String( window.__INITIAL_DATA__ )
			// Fetch exam questions
			let data = await fetch( "http://localhost:9000/api/questions", {
				headers: {
					"token": tokenValue
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

			// Fetch exam responses (if there are any)
			data = await fetch( "http://localhost:9000/api/responses", {
				headers: {
					"token": tokenValue
				}
			} )

			json = await data.json()
			const responses: Response[] = json.responses

			// Loop through responses and create ids and a map
			const newResponseIds: number[] = []
			const newResponsesMap = new Map<number, Response>()
			responses.forEach( response => {
				newResponseIds.push( response.questionId )
				newResponsesMap.set( response.questionId, response )
			} )

			// Update the store
			setToken( tokenValue )
			batch( () => {
				dispatch( examActions.setQuestionIds( newQuestionIds ) )
				dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
				dispatch( examActions.setResponseIds( newResponseIds ) )
				dispatch( examActions.setResponsesMap( newResponsesMap ) )
			} )
		}

		// Calls the async function
		initQuestions()
	}, [] )

	/**
	 * Runs when the submit button is pressed - posts each
	 * response in the responsesMap to update the database
	 */
	const submit = React.useCallback( async () => {
		try {
			const res = await fetch( "http://localhost:9000/api", {
				// Adding method type
				method: "POST",

				// Adding body or contents to send
				body: JSON.stringify(
					Array.from( responsesMap.values() )
				),
     
				// Adding headers to the request
				headers: {
					"Content-type": "application/json; charset=UTF-8",
					"token": token
				}
			} )
			const json = await res.json()
			dispatch( examActions.setResponseState( json.response ) )
		} 
		catch( e ) {
			console.error( e )
		}
	}, [ responsesMap ] )

	// Render the component
	return (
		<StyledApp>
			<h1>{responseState}</h1>
			<StyledQuestionsContainer>
				{questionIds.map( id => (
					<QuestionSwitch 
						key={id}
						questionId={id}
					/>
				) )}
				<Button 
					intent={Intent.PRIMARY} 
					style={{marginTop: "20px"}} 
					text="Submit" 
					onClick={submit}
				/>
			</StyledQuestionsContainer>
		</StyledApp>
	)
} )
App.displayName = "App"

interface QuestionSwitchProps {
	questionId: number
}

/**
 * QuestionSwitch Component
 * 
 * This component determines the type of a given question and 
 * returns a component of its corresponding type
 */
const QuestionSwitch = React.memo( ( props: QuestionSwitchProps ) => {

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( 
		state, 
		props.questionId 
	) )

	// Render the right component
	switch ( question?.type ) {
	case QuestionType.MultipleChoice:
		return (
			<MultipleChoice 
				key={question.id}
				questionId={question.id}
			/>
		)
	case QuestionType.TrueFalse:
		return (
			<TrueFalse 
				key={question.id}
				questionId={question.id}
			/>
		)
	case QuestionType.ShortAnswer:
		return (
			<ShortAnswer 
				key={question.id}
				questionId={question.id}
			/>
		)
	default:
		return null
	}
} )
QuestionSwitch.displayName = "QuestionSwitch"


declare global {
    interface Window {
        __INITIAL_DATA__:unknown
    }
}

/**
 * Question Type
 * 
 * This type defines what an exam question should look like.
 * Each question has a unique id, text, type, and an array of answers
 */
export type Question = {
	id: number // Unique id for identification in the database
	text: string // Question text to display to user
	type: QuestionType // Type of the Question
	answers: string[] // Array of answers choices to present to the user
}

/**
 * Response Type
 * 
 * This type defines what a response from the user should look like.
 * Each response has a questionId, isText flag, and a value
 */
export type Response = {
	questionId: number // Specific questionId that this Response relates to
	isText?: boolean // Whether this is a text Response
	value: number | string // The actual value of the Response 
}

/**
 * ComponentProps Interface
 * 
 * This interface establishes a common point between each question
 * component.
 * Each component has a questionId, questionText, array of answerChoices,
 * a Response object, and a way to update that Response object
 */
export interface ComponentProps {
	questionId: number // Specific questionId of the given question
}
