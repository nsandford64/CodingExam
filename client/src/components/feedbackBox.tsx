// Copyright 2022 under MIT License
import { TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Feedback } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectFeedbackById } from "../slices/examSlice"

export interface FeedbackBoxProps {
    questionId: number,
    disabled?: boolean
}

/**
 * Style for the ShortAnswer component
 */
const StyledFeedbackBox = styled.div`
	padding: 10px;
`

/**
 * ShortAnswer Component
 * 
 * This component displays a short answer question to the user - they
 * are presented with a question and a text box area
 */
export const FeedbackBox = React.memo( ( props: FeedbackBoxProps ) => {

	// Dispatches an event to the store
	const dispatch = useAppDispatch()
    
	const feedback = useAppSelector( state => selectFeedbackById(
		state,
		props.questionId
	) )

	/**
	 * Called when a new bubble is selected - updates the store with a new Response object
	 */
	const handleChange = React.useCallback( ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
		
		const newFeedback: Feedback = {
			questionId: props.questionId,
			value: e.target.value
		}

		dispatch( examActions.updateFeedback( newFeedback ) )
	}, [] )

	// Render the component
	return (
		<StyledFeedbackBox>
			<TextArea 
				large
				onChange={handleChange}
				value={feedback?.value} 
			/>
		</StyledFeedbackBox>
	)
} )
FeedbackBox.displayName = "FeedbackBox"