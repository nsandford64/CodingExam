// Copyright 2022 under MIT License
import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

/**
 * Style for the ShortAnswer component
 */
const StyledShortAnswer = styled.div`
	padding: 10px;
`

/**
 * ShortAnswer Component
 * 
 * This component displays a short answer question to the user - they
 * are presented with a question and a text box area
 */
export const ShortAnswer = React.memo( ( props: ComponentProps ) => {

	// Dispatches an event to the store
	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/**
	 * Called when a new bubble is selected - updates the store with a new Response object
	 */
	const handleChange = React.useCallback( ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
		const newResponse: Response = {
			questionId: props.questionId,
			isText: true,
			value: e.target.value
		}

		dispatch( examActions.updateResponse( newResponse ) )
	}, [] )

	// Render the component
	return (
		<StyledShortAnswer>
			<Label>{question?.text}</Label>
			<TextArea 
				large
				onChange={handleChange}
				value={response?.value} 
			/>
		</StyledShortAnswer>
	)
} )
ShortAnswer.displayName = "ShortAnswer"