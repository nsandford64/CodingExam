// Copyright 2022 under MIT License
import { Button, Colors, Intent } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { GradingGrid } from "../components/gradingGrid"
import { examActions, selectQuestionIds, selectToken } from "../slices/examSlice"

/**
 * Style for GradingView
 */
const StyledGradingView = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
`

/**
 * Style for the questions container
 */
const StyledQuestionsContainer = styled.div`
	padding: 10px;
	border: 1px solid ${Colors.LIGHT_GRAY3};
	display: flex;
	flex-direction: column;
`

/**
 * GradingView Component
 * 
 * Renders all the questions for an exam and allows the instructor to grade each one a per-student basis
 */
export const GradingView = React.memo( () => {
	/**
	 * Selectors
	 */
	// Dispatch an action to the store
	const dispatch = useAppDispatch()
	// Token from the store
	const token = useAppSelector( selectToken )
	// QuestionIds from the store
	const questionIds = useAppSelector( selectQuestionIds )

	/**
	 * State
	 */
	const [ selectedIndex, setSelectedIndex ] = React.useState( 0 )

	/**
	 * Effects
	 */
	React.useEffect( () => {
		const initializeQuestions = async () => {
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
			data = await fetch( "/api/instructor/allsubmissions", {
				headers: {
					"token": token,
				}
			} )

			json = await data.json()
			const submissions: Submission[] = json.submissions

			console.log( submissions )

			/*
			Loop through submissions and create ids and a map 
			for submissions and for confidence ratings
			*/
			const newSubmissionsMap = new Map<string, Map<number, Submission>>()
			submissions.forEach( submission => {
				const currentSubmissions = newSubmissionsMap.get( submission.canvasUserId || "student" ) || new Map<number, Submission>()
				currentSubmissions.set( submission.questionId, submission )

				newSubmissionsMap.set( submission.canvasUserId || "student", currentSubmissions )
			} )

			batch( () => {
				dispatch( examActions.setSubmissionsMap( newSubmissionsMap ) )
				dispatch( examActions.setQuestionIds( newQuestionIds ) )
				dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
			} )
		}
		// Call the async function
		initializeQuestions()
	}, [] )

	/**
	 * Render
	 */
	return (
		<StyledGradingView>	
			<StyledQuestionsContainer>
				{questionIds.map( ( id, index ) => (
					<Button
						key={id}
						text={`Question ${index+1}`}
						minimal
						intent={Intent.NONE}
						alignText="left"
						onClick={() => setSelectedIndex( index )}
					/>
				) )}
			</StyledQuestionsContainer>
			{questionIds.length > 0 && (
				<GradingGrid 
					questionId={questionIds[selectedIndex]}
				/>
			)}
		</StyledGradingView>
	)
} )
GradingView.displayName = "GradingView"

