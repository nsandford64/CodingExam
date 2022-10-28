// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question, Response } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionIds, selectResponsesMap } from "../slices/examSlice"
import { QuestionSwitch } from "./studentView"

interface ExamViewProps {
	disabled?: boolean
	canvasUserId?: string
	token: string
}

const StyledExamView = styled.div`

`

export const ExamView = React.memo( ( props: ExamViewProps ) => {

	const dispatch = useAppDispatch()

	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of responses from the store
	const responsesMap = useAppSelector( selectResponsesMap )

	const [ loading, setLoading ] = React.useState( true )

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
					"token": props.token,
					"userID": props.canvasUserId || ""
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

			setLoading( false )
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
		<StyledExamView>
			{loading && (
				<h1>Loading</h1>
			)}
			{!loading && (
				<> 
					{questionIds.map( id => (
						<QuestionSwitch 
							key={id}
							disabled={props.disabled}
							questionId={id}
						/>
					) )}
					{!props.disabled && (
						<Button 
							text="Submit"
							onClick={submit}
							intent={Intent.PRIMARY}
						/>
					)}
				</>
			)}
		</StyledExamView>
	)
} )
ExamView.displayName = "ExamView"