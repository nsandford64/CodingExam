// Copyright 2022 under MIT License
import { Button, Callout, Colors, Intent, Spinner } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Question, QuestionType } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { CodingAnswer } from "../components/codingAnswer"
import { FeedbackBox } from "../components/feedbackBox"
import { MultipleChoice } from "../components/multipleChoice"
import { ParsonsProblem } from "../components/parsonsProblem"
import { ShortAnswer } from "../components/shortAnswer"
import { TrueFalse } from "../components/trueFalse"
import { examActions, selectQuestionById, selectQuestionIds, selectToken, selectResponseState, selectConfidenceMap, selectSubmissionsMap, initializeQuestions } from "../slices/examSlice"

// Props for the ExamView component
interface ExamViewProps {
	disabled?: boolean
	feedback?: boolean
	review?: boolean
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
	width: 600px;
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
export const ExamView = ( props: ExamViewProps ) => {
	/**
	 * Selectors
	 */
	// Dispatch an event to the store
	const dispatch = useAppDispatch()
	// Exam response state
	const responseState = useAppSelector( selectResponseState )
	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of submissions from the store
	const submissionsMap = useAppSelector( selectSubmissionsMap )
	// Map of confidence ratings from the store
	const confidenceMap = useAppSelector( selectConfidenceMap )
	// token from the store
	const token = useAppSelector( selectToken )

	/**
	 * State
	 */
	// State that determines if the ExamView is in a loading state
	const [ loading, setLoading ] = React.useState( true )

	/**
	 * Callbacks
	 */
	/*
	Called on render - initializes the questions and responses
	in the store
	*/
	React.useEffect( () => {
		const initQuestions = async () => {
			await dispatch( initializeQuestions( props.canvasUserId ) )

			setLoading( false )
		}

		initQuestions()
	}, [] )

	/*
	Runs when the submit button is pressed - posts each
	response in the responsesMap to update the database
	*/
	const submit = React.useCallback( async () => {
		const data = questionIds.map( id => {
			const value = submissionsMap.get( "student" )?.get( id )?.value

			return {
				questionId: id,
				value,
				confidence: confidenceMap.get( id )?.value
			}
		} )

		try {
			const res = await fetch( "/api", {
				// Adding method type
				method: "POST",

				// Adding body or contents to send
				body: JSON.stringify( data ),
     
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
	}, [ submissionsMap ] )

	/**
	 * Render
	 */
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
									questionId={id}
									canvasUserId={props.canvasUserId}
									headerShown
								/>
								{props.feedback && (
									<FeedbackBox
										disabled={props.review}
										questionId={id}
									/>
								)}
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
					{responseState && responseState.includes( "Valid" ) && (
						<Callout intent="success">
							Success! Your exam was submitted.
						</Callout>
					)}
					{responseState && responseState.includes( "Invalid" ) && (
						<Callout intent="danger">
							Oh no! There was a problem saving your exam.  Contact your instructor for help.
						</Callout>
					)}
				</>
			)}
		</StyledExamView>
	)
} 
ExamView.displayName = "ExamView"

/**
 * Props for the QuestionSwitch Component
 */
interface QuestionSwitchProps {
	disabled?: boolean
	feedback?: boolean
	review?: boolean
	questionId: number
	canvasUserId?: string
	headerShown?: boolean
	editable?: boolean
}

/**
 * QuestionSwitch Component
 * 
 * This component determines the type of a given question and 
 * returns a component of its corresponding type
 */
export const QuestionSwitch = React.memo( ( props: QuestionSwitchProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an action to the store
	const dispatch = useAppDispatch()
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( 
		state, 
		props.questionId 
	) )

	const handleEdit = React.useCallback( ( newQuestion: Question ) => {
		dispatch( examActions.updateQuestion( newQuestion ) )
	}, [] )

	/**
	 * Render
	 */
	// Render the component based on the question's type
	switch ( question?.type ) {
	case QuestionType.MultipleChoice:
		return (
			<MultipleChoice
				disabled={props.disabled}
				questionId={question.id}
				canvasUserId={props.canvasUserId}
				headerShown={props.headerShown}
				editable={props.editable}
				editQuestion={handleEdit}
			/>
		)
	case QuestionType.TrueFalse:
		return (
			<TrueFalse
				disabled={props.disabled}
				questionId={question.id}
				canvasUserId={props.canvasUserId}
				headerShown={props.headerShown}
				editable={props.editable}
				editQuestion={handleEdit}
			/>
		)
	case QuestionType.ShortAnswer:
		return (
			<ShortAnswer
				disabled={props.disabled}
				questionId={question.id}
				canvasUserId={props.canvasUserId}
				headerShown={props.headerShown}
				editable={props.editable}
				editQuestion={handleEdit}
			/>
		)
	case QuestionType.CodingAnswer:
		return (
			<CodingAnswer
				disabled={props.disabled}
				questionId={question.id}
				canvasUserId={props.canvasUserId}
				headerShown={props.headerShown}
				editable={props.editable}
				editQuestion={handleEdit}
			/>
		)
	case QuestionType.ParsonsProblem:
		return (
			<ParsonsProblem
				disabled={props.disabled}
				questionId={question.id}
				canvasUserId={props.canvasUserId}
				headerShown={props.headerShown}
				editable={props.editable}
				editQuestion={handleEdit}
			/>
		)
	default:
		return null
	}
} )
QuestionSwitch.displayName = "QuestionSwitch"