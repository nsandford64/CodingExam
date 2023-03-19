// Copyright 2022 under MIT License
import { InputGroup, Label, Radio, RadioGroup } from "@blueprintjs/core"
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
	 * Callbacks
	 */
	/*
	Called when the user selects one of the radio buttons - it
	calls the updateResponse delegate to update the state in the App
	to reflect their choice.
	*/
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		// Create a new response object
		const value = ( e.target as HTMLInputElement ).value

		const newSubmission: Submission = {
			value: parseInt( value ),
			questionId: props.questionId
		}

		// Update the response in the store
		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )

	/**
	 * Render Variables
	 */
	// Ensures that markdown is supported for the question text
	const label = question ? <ReactMarkdown>{question?.text}</ReactMarkdown> : ""

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
			<RadioGroup
				//label={props.headerShown ? label : undefined}
				disabled={props.disabled}
				onChange={handleChange}
				selectedValue={submission?.value}
			>
				{question?.answers.map( ( choice, index ) => (
					<Radio 
						key={index} 
						label={choice} 
						value={index} 
					/>
				) )}
			</RadioGroup>
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
