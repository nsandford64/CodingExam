// Copyright 2022 under MIT License
import { Button, Colors, Intent } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question } from "../App"
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
			const data = await fetch( "/api/questions", {
				headers: {
					"token": token
				} 
			} )
			
			const json  = await data.json()
			const questions: Question[] = json.questions

			// Loop through questions and create ids and a map
			const newQuestionIds: number[] = []
			const newQuestionsMap = new Map<number, Question>()
			questions.forEach( question => {
				newQuestionIds.push( question.id )
				newQuestionsMap.set( question.id, question )
			} )

			batch( () => {
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

