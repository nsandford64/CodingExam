// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { GradingGrid } from "../components/gradingGrid"
import { examActions, selectQuestionIds, selectResponseState, selectToken } from "../slices/examSlice"
import { initializeQuestions, selectQuestions } from "../slices/gradingSlice"
import { ExamView } from "./examView"

/**
 * Props for GradingView
 */
interface GradingViewProps {
	disabled: boolean
}

/**
 * Style for GradingView
 */
const StyledGradingView = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`

const StyledQuestionsContainer = styled.div`
	width: 300px;
`

/**
 * GradingView Component
 * 
 * Renders all the questions for an exam and allows the instructor to grade each one a per-student basis
 */
export const GradingView = React.memo( ( props: GradingViewProps ) => {
	/**
	 * Selectors
	 */
	// Dispatch
	const dispatch = useAppDispatch()
	// Token from the store
	const token = useAppSelector( selectToken )
	// QuestionIds from the store
	const questionIds = useAppSelector( selectQuestionIds )

	/**
	 * State
	 */
	const [ selectedIndex, setSelectedIndex ] = React.useState( 0 )

	const handleSubmitGradesClick = React.useCallback( async () => {
		const data = await fetch( "/api/instructor/submitgrades", {
			method: "POST",
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": token
			}
		} )

		const json = await data.json()
		
		let status = "Grade Submission Unsuccessful"
		if ( json.response == "Valid submission" ) {
			status = "Grades Submitted"
		}
	}, [] )

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

		initializeQuestions()
	}, [] )

	// Render the component
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
						style={{ width: "100%"}}
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

