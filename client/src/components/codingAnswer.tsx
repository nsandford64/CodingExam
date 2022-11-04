// Copyright 2022 under MIT License
import { Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"
import brace from "brace"

import "brace/mode/java"
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
	width: 40%;
`

export const CodingAnswer = React.memo( ( props: ComponentProps ) => {

	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/** 
	 * Called whenever code editor text is changed -- Updates the store with a new Response object
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

	//render the component
	return (
		<StyledCodingAnswer>
			<Label>{question?.text}</Label>
			<AceEditor
				readOnly={props.disabled}
				mode="java"
				theme="github"
				onChange={handleChange}
				name="editor"
				defaultValue={`${response?.value}`}
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
