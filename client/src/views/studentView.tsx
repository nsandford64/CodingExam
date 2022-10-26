// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question, QuestionType, Response } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { MultipleChoice } from "../components/multipleChoice"
import { ShortAnswer } from "../components/shortAnswer"
import { TrueFalse } from "../components/trueFalse"
import { examActions, selectQuestionById, selectQuestionIds, selectResponsesMap } from "../slices/examSlice"

interface StudentViewProps {
	token: string
}

const StyledStudentView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * Container to hold the exam questions
 */
const StyledQuestionsContainer = styled.div`
`

export const StudentView = React.memo( ( props: StudentViewProps ) => {

	const dispatch = useAppDispatch()

	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of responses from the store
	const responsesMap = useAppSelector( selectResponsesMap )

	React.useEffect( () => {
		const initQuestions = async () => {
			// Fetch exam questions
			let data = await fetch( "http://localhost:9000/api/questions", {
				headers: {
					"token": props.token
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
					"token": props.token
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
			batch( () => {
				dispatch( examActions.setQuestionIds( newQuestionIds ) )
				dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
				dispatch( examActions.setResponseIds( newResponseIds ) )
				dispatch( examActions.setResponsesMap( newResponsesMap ) )
			} )
		}

		// Call async function
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
					"token": props.token
				}
			} )
			const json = await res.json()
			dispatch( examActions.setResponseState( json.response ) )
		} 
		catch( e ) {
			console.error( e )
		}
	}, [ responsesMap ] )

	return (
		<StyledStudentView>
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
		</StyledStudentView>
	)
} )
StudentView.displayName = "StudentView"


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
