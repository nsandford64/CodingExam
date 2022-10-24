// Copyright 2022 under MIT License
import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

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

	// Dispatches an event to the store
	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/**
	 * Called when the user selects one of the radio buttons - it
	 * calls the updateResponse delegate to update the state in the App
	 * to reflect their choice.
	 */
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		// Create a new response object
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		// Update the response in the store
		dispatch( examActions.updateResponse( newResponse ) )
	}, [] )

	// Render the component
	return (
		<StyledMultipleChoice>
			<RadioGroup
				label={question?.text}
				onChange={handleChange}
				selectedValue={response?.value}
			>
				{question?.answers.map( ( choice, index ) => (
					<Radio key={index} label={choice} value={index} />
				) )}
			</RadioGroup>
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
