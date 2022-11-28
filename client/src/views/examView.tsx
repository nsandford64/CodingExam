// Copyright 2022 under MIT License
import { Button, Colors, Intent, Spinner } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Feedback, Question, QuestionType, Response } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { CodingAnswer } from "../components/codingAnswer"
import { FeedbackBox } from "../components/feedbackBox"
import { MultipleChoice } from "../components/multipleChoice"
import { ShortAnswer } from "../components/shortAnswer"
import { TrueFalse } from "../components/trueFalse"
import { examActions, selectQuestionById, selectQuestionIds, selectResponsesMap, selectToken } from "../slices/examSlice"

// Props for the ExamView comoponent
interface ExamViewProps {
	disabled?: boolean
	feedback?: boolean
	canvasUserId?: string
}

/**
 * Style for the ExamView
 */
const StyledExamView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`

/**
 * Style for the container that holds the questions
 */
export const StyledQuestionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`

/**
 * Style for a single question
 */
export const StyledQuestionContainer = styled.div`
	border: 1px solid ${Colors.BLACK};
	border-radius: 2px;
	margin-bottom: 25px;
`

/**
 * Style for a Question's header
 */
export const StyledQuestionHeader = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${Colors.BLACK};
	padding: 10px;
	background-color: ${Colors.LIGHT_GRAY4};
	font-weight: bold;
`

/**
 * ExamView Component
 * 
 * This component renders an exam and all of its questions for the user.
 * Depending on the type of user (Instructor or Learner), it will present a different
 * form the exam. The Instructor can only view student responses and leave feedback, and the
 * Learner can only take the exam and submit their responses.
 */
export const ExamView = React.memo( ( props: ExamViewProps ) => {

	// Dispatch an event to the store
	const dispatch = useAppDispatch()

	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of responses from the store
	const responsesMap = useAppSelector( selectResponsesMap )
	// token from the store
	const token = useAppSelector( selectToken )

	// State that determines if the ExamView is in a loading state
	const [ loading, setLoading ] = React.useState( true )

	/**
	 * Called on render - initializes the questions and responses
	 * in the store
	 */
	React.useEffect( () => {
		const initQuestions = async () => {
			// Fetch exam questions
			let data = await fetch( "http://localhost:9000/api/questions", {
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

			// Fetch exam responses (if there are any)
			data = await fetch( "http://localhost:9000/api/responses", {
				headers: {
					"token": token,
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

			// Fetch exam feedback
			data = await fetch( "http://localhost:9000/api/feedback", {
				headers: {
					"token": token,
					"userID": props.canvasUserId || ""
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

	return (
		<StyledExamView>
			{loading && (
				<Spinner 
					size={50}
					style={{ padding: "50px" }}
				/>
			)}
			{!loading && (
				<> 
					<StyledQuestionsContainer>
						{questionIds.map( ( id, index ) => (
							<StyledQuestionContainer key={id}>
								<StyledQuestionHeader>
									Question {index + 1}
								</StyledQuestionHeader>
								<QuestionSwitch
									disabled={props.disabled}
									feedback={props.feedback}
									questionId={id}
								/>
							</StyledQuestionContainer>
						) )}
					</StyledQuestionsContainer>
					{!props.disabled && (
						<Button 
							text="Submit"
							onClick={submit}
							intent={Intent.PRIMARY}
							fill
						/>
					)}
				</>
			)}
		</StyledExamView>
	)
} )
ExamView.displayName = "ExamView"

/**
 * Props for the QuestionSwitch Component
 */
interface QuestionSwitchProps {
	disabled?: boolean
	feedback?: boolean
	questionId: number
}

/**
 * QuestionSwitch Component
 * 
 * This component determines the type of a given question and 
 * returns a component of its corresponding type
 */
export const QuestionSwitch = React.memo( ( props: QuestionSwitchProps ) => {

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( 
		state, 
		props.questionId 
	) )

	// Render the right component
	switch ( question?.type ) {
	case QuestionType.MultipleChoice:
		return (
			<>
				<MultipleChoice
					disabled={props.disabled}
					questionId={question.id}
				/>
				{props.feedback && (
					<FeedbackBox
						questionId={question.id}
					/>
				)}
			</>
		)
	case QuestionType.TrueFalse:
		return (
			<>
				<TrueFalse
					disabled={props.disabled}
					questionId={question.id}
				/>
				{props.feedback && (
					<FeedbackBox
						questionId={question.id}
					/>
				)}
			</>
		)
	case QuestionType.ShortAnswer:
		return (
			<>
				<ShortAnswer
					disabled={props.disabled}
					questionId={question.id}
				/>
				{props.feedback && (
					<FeedbackBox
						questionId={question.id}
					/>
				)}
			</>
		)
	case QuestionType.CodingAnswer:
		return (
			<>
				<CodingAnswer
					disabled={props.disabled}
					questionId={question.id}
				/>
				{props.feedback && (
					<FeedbackBox
						questionId={question.id}
					/>
				)}
			</>
		)
	default:
		return null
	}
} )
QuestionSwitch.displayName = "QuestionSwitch"