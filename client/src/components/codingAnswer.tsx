// Copyright 2022 under MIT License
import { Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

// AceEditor modes and themes
import "brace/mode/java"
import "brace/mode/csharp"
import "brace/mode/python"
import "brace/theme/sqlserver"

/**
 * Style for the CodingAnswer component
 */
const StyledCodingAnswer = styled.div`
	padding: 10px;
`

/**
 * CodingAnswer Component
 * 
 * This component renders a text-editor for the user to write
 * code in
 */
export const CodingAnswer = React.memo( ( props: ComponentProps ) => {

	// Dispatches an event to the store
	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/** 
	 * Called whenever the code editor text is changed -- Updates the store with a new Response object
	 */
	const handleChange = React.useCallback( ( value: string ) => {
		const newResponse: Response = {
			questionId: props.questionId,
			isText: true,
			value: value
		}

		// Updates the response in the store
		dispatch( examActions.updateResponse( newResponse ) )
	}, [] )

	// Split the text from the text:language format
	const splitText = question?.text.split( ":" ) || []

	// Set the text and mode for the AceEditor
	let text = ""
	splitText.forEach( ( el, index ) => {
		if( index !== splitText.length - 1 ) {
			text += el
		}
	} )
	const mode = splitText[ splitText.length - 1 ]

	// Render the component
	return (
		<StyledCodingAnswer>
			<Label>{text}</Label>
			<AceEditor
				readOnly={props.disabled}
				mode={mode}
				theme="sqlserver"
				onChange={handleChange}
				name="editor"
				defaultValue={`${response?.value || ""}`}
				width="100%"
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
