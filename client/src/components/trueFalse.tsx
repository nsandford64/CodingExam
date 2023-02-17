// Copyright 2022 under MIT License
import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

/**
 * Style for the TrueFalse component
 */
const StyledTrueFalse = styled.div`
	padding: 10px;
`

/**
 * TrueFalse Component
 * 
 * This component presents the user with a statement, and then they
 * must select between true or false
 */
export const TrueFalse = React.memo( ( props: ComponentProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	const dispatch = useAppDispatch()
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/**
	 * Callbacks
	 */
	// Called when the user selects between true or false - updates the App's responsesMap
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		dispatch( examActions.updateResponse( newResponse ) )
	}, [] )
	// Format markdown in the question text
	const label = question ? <ReactMarkdown>{question?.text}</ReactMarkdown> : ""

	/**
	 * Render
	 */
	return (
		<StyledTrueFalse>
			<RadioGroup
				disabled={props.disabled}
				label={label}
				onChange={handleChange}
				selectedValue={response?.value}
			>
				<Radio label="False" value={0} />
				<Radio label="True" value={1} />
			</RadioGroup>
		</StyledTrueFalse>
	)
} )
TrueFalse.displayName = "TrueFalse"