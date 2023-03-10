// Copyright 2022 under MIT License
import { Button, InputGroup, Label, Radio } from "@blueprintjs/core"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"

/**
 * Style for the MultipleChoice component
 */
const StyledMultipleChoice = styled.div`
	padding: 10px;
`

/**
 * Style for the container while adding an answer
 */
const StyledAnswerInputContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`

/**
 * MultipleChoice Component
 * 
 * This component renders a multiple choice question for the user.
 * They can select any one option from a list of answer choices
 */
export const MultipleChoice = React.memo( ( props: ComponentProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	const dispatch = useAppDispatch()
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Submission from the store
	const submission = useAppSelector( state => selectSubmissionByUserIdAndQuestionId( state, props.questionId, props.canvasUserId ) )

	/**
	 * State
	 */
	const [ addingAnswer, setAddingAnswer ] = React.useState( false )
	const [ editingAnswerIndex, setEditingAnswerIndex ] = React.useState( -1 )
	const [ answer, setAnswer ] = React.useState( "" )

	/**
	 * Callbacks
	 */
	/*
	Called when the user selects one of the radio buttons - it
	calls the updateResponse delegate to update the state in the App
	to reflect their choice.
	*/
	const handleChange = React.useCallback( ( value: number ) => {
		// Create a new Submission object
		const newSubmission: Submission = {
			value,
			questionId: props.questionId
		}

		// Update the response in the store
		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )

	// Called when an answer is added - updates the question in the store
	const handleAddAnswer = React.useCallback( () => {
		props.editQuestion( {
			...question,
			answers: [ ...question.answers, answer ]
		} )

		setAddingAnswer( false )
	}, [ question, answer ] )

	const handleRemoveAnswer = React.useCallback( ( index: number ) => {
		props.editQuestion( {
			...question,
			answers: question?.answers.filter( ( _, answerIndex ) => answerIndex !== index )
		} )

		setEditingAnswerIndex( -1 )
	}, [ question ] )

	/**
	 * Effects
	 */
	React.useEffect( () => {
		setAddingAnswer( false )
		setEditingAnswerIndex( -1 )
	}, [ props.editable ] )

	React.useEffect( () => {
		setAnswer( "" )
	}, [ addingAnswer ] )

	/**
	 * Render
	 */
	return (
		<StyledMultipleChoice>
			{props.headerShown && (
				<>
					{props.editable && (
						<InputGroup 
							fill
							style={{ marginBottom: 10 }}
							value={question?.text}
							onChange={e => props.editQuestion( {
								...question,
								text: e.target.value
							} )}
						/>
					)}
					{!props.editable && (
						<Label>
							<ReactMarkdown>
								{question ? question?.text : ""}
							</ReactMarkdown>
						</Label>
					)}
				</>				
			)}
			{question?.answers.map( ( choice, index ) => (
				<StyledAnswerInputContainer key={index} style={{ marginBottom: props.editable ? "10px" : undefined }}>
					<Radio
						key={index}
						disabled={props.disabled}
						value={index}
						label={editingAnswerIndex === index ? undefined : choice}
						checked={index === submission?.value}
						onChange={() => handleChange( index )}
						style={{ marginBottom: props.editable ? 0 : undefined }}
					/>
					{editingAnswerIndex === index && (
						<>
							<InputGroup 
								fill
								value={choice}
								onChange={e => props.editQuestion( {
									...question,
									answers: question?.answers.map( ( answer, answerIndex ) => {
										if ( answerIndex === index ) {
											return e.target.value
										}

										return answer
									} )
								} )}
							/>
							<Button 
								icon="tick" 
								style={{ marginLeft: 10 }} 
								intent="success"
								onClick={() => setEditingAnswerIndex( -1 )}
							/>
						</>
					)}
					{props.editable && editingAnswerIndex === -1 && (
						<>
							<Button 
								icon="edit"
								onClick={() => setEditingAnswerIndex( index )}
								style={{ marginLeft: 10 }}
							/>
							<Button 
								icon="cross" 
								style={{ marginLeft: 10 }} 
								intent="danger"
								onClick={() => handleRemoveAnswer( index )}
							/>
						</>
					)}
				</StyledAnswerInputContainer>
			) )}
			{props.editable && !addingAnswer && question?.answers.length < 4 && (
				<Button 
					icon="plus"
					onClick={() => setAddingAnswer( true )}			
				/>
			)}
			{props.editable && addingAnswer && (
				<StyledAnswerInputContainer>
					<InputGroup 
						fill
						value={answer}
						onChange={e => setAnswer( e.target.value )}
					/>
					<Button 
						icon="cross"
						intent="danger"
						style={{ marginLeft: 10 }}
						onClick={() => setAddingAnswer( false )}
					/>
					<Button 
						icon="tick"
						intent="success"
						style={{ marginLeft: 10 }}
						onClick={handleAddAnswer}
					/>
				</StyledAnswerInputContainer>
			)}
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
