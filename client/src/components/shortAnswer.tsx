// Copyright 2022 under MIT License
import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"

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

	// State to hold the components current response
	const [ response, setResponse ] = React.useState( props.response?.value || "" )

	// When the text box loses focus, this triggers and updates the App's responsesMap
	const handleBlur = React.useCallback( () => {
		const newResponse: Response = {
			questionId: props.questionId,
			isText: true,
			value: response
		}

		props.updateResponse( newResponse )
	}, [ response ] )

	// Render the component
	return (
		<StyledShortAnswer>
			<Label>{props.questionText}</Label>
			<TextArea 
				large 
				onBlur={handleBlur} 
				onChange={ e => setResponse( e.target.value )}
				value={response} 
			/>
		</StyledShortAnswer>
	)
} )
ShortAnswer.displayName = "ShortAnswer"