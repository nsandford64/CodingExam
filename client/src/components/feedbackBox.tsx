// Copyright 2022 under MIT License
import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Feedback } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectFeedbackById } from "../slices/examSlice"

/**
 * Props for the FeedbackBox
 */
export interface FeedbackBoxProps {
    questionId: number,
    disabled?: boolean
}

/**
 * Style for the FeedbackBox component
 */
const StyledFeedbackBox = styled.div`
	padding: 10px;
`

/**
 * FeedbackBox Component
 * 
 * This component renders a textbox that contains
 * feedback that the instructor has left for a student.
 */
export const FeedbackBox = React.memo( ( props: FeedbackBoxProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	const dispatch = useAppDispatch()
	// Feedback from the store
	const feedback = useAppSelector( state => selectFeedbackById(
		state,
		props.questionId
	) )

	/**
	 * Callbacks
	 */
	/*
	Called when the text in the TextArea is changed - updates the Feedback
	object in the store
	*/
	const handleChange = React.useCallback( ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
		const newFeedback: Feedback = {
			questionId: props.questionId,
			value: e.target.value
		}

		// Update the Feedback object in the store
		dispatch( examActions.updateFeedback( newFeedback ) )
	}, [] )

	/**
	 * Render
	 */
	return (
		<StyledFeedbackBox>
			<Label>Feedback:</Label>
			<TextArea 
				large
				readOnly={props.disabled}
				onChange={handleChange}
				value={feedback?.value || ""} 
				fill
				style={{ minHeight: "100px", resize: "none" }}
				growVertically
			/>
		</StyledFeedbackBox>
	)
} )
FeedbackBox.displayName = "FeedbackBox"