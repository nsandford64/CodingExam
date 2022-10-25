// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import React from "react"
import styled from "styled-components"
import { MultipleChoice } from "./components/multipleChoice"
import { ShortAnswer } from "./components/shortAnswer"
import { TrueFalse } from "./components/trueFalse"

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

	// Holds an array of questions for the given exam
	const [ questions, setQuestions ] = React.useState( [] as Question[] )
	// Holds a map that maps each response to its questionId
	const [ responsesMap, setResponsesMap ] = React.useState( new Map<number, Response>() )
	// Displays that answers have been submitted when "Submit" is clicked
	const [ responseState, setResponseState ] = React.useState( "" )
	// Keeps track of the token containing the interla Canvas UserID and AssignmentID sent from the server
	const [ token, setToken ] = React.useState( "" )

	// Updates the responsesMap to contain a new response for a given questionId
	const updateResponse = React.useCallback( ( response: Response ) => {
		setResponsesMap( new Map<number, Response>( responsesMap.set( response.questionId, response ) ) )
	}, [ responsesMap ] )

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

			// Fetch exam responses (if there are any)
			data = await fetch( "http://localhost:9000/api/responses", {
				headers: {
					"token": tokenValue
				}
			} )

			json = await data.json()
			const responses: Response[] = json.responses

			// Initialize the responsesMap
			const newResponsesMap = new Map<number, Response>()
			responses.forEach( response => {
				newResponsesMap.set( response.questionId, response )
			} )

			// Update the state
			setToken( tokenValue )
			setQuestions( questions )
			setResponsesMap( newResponsesMap )
		}

		// Calls the async function
		initQuestions()
	}, [] )

	/**
	 * Runs when the submit button is pressed - posts each
	 * response in the responsesMap to update the database
	 */
	const submit = React.useCallback( async () => {
		console.log( JSON.stringify( Array.from( responsesMap.values() ) ) )
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
			setResponseState( json.response )
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
				{questions.map( question => {
					switch( question.type ) {
					case QuestionType.MultipleChoice:
						return (
							<MultipleChoice 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								answerChoices={question.answers}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					case QuestionType.TrueFalse:
						return (
							<TrueFalse 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					case QuestionType.ShortAnswer:
						return (
							<ShortAnswer 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					}
				} )}				
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
type Question = {
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
	questionText: string // Question text to display to the user
	answerChoices?: string[] // Array of answer choices to present to the user
	response?: Response // Response object that the user has inputted
	updateResponse: ( response: Response ) => void // Delegate to update the given Response
}

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
}

