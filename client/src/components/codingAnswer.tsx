// Copyright 2022 under MIT License
import { Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"

import "brace/mode/java"
import "brace/mode/csharp"
import "brace/mode/python"
import "brace/theme/github"

import styled from "styled-components"
import { Response, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

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

	// Render the component
	return (
		<StyledCodingAnswer>
			<Label>{ question?.text.split( ":" )[0] } </Label>
			<AceEditor
				readOnly={props.disabled}
				mode={ question?.text.split( ":" )[1] }
				theme="github"
				onChange={handleChange}
				name="editor"
				defaultValue={`${response?.value || ""}`}
				width="100%"
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
