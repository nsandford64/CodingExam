// Copyright 2022 under MIT License
import { Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

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

export const CodingAnswer = React.memo( ( props: ComponentProps ) => {


	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	/*const handleChange = React.useCallback( ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {

		const newResponse: Response = {
			questionId: props.questionId,
			isText: true,
			value: response?.value
		}

		dispatch( examActions.updateResponse( newResponse ) )
	}, [] )*/

	function onChange( value: string ){
		console.log( value )
	}

	//render the component
	return (
		<StyledCodingAnswer>
			<Label>{"hello"}</Label>
			<AceEditor
				mode="java"
				theme="github"
				onChange={onChange}
				name="editor"
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
