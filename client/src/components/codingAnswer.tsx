// Copyright 2022 under MIT License
import { Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

import styled from "styled-components"
import { ComponentProps } from "../App"

/**
 * Style for the CodingAnswer component
 */
const StyledCodingAnswer = styled.div`
 padding: 10px;
`

export const CodingAnswer = React.memo( ( props: ComponentProps ) => {
	/**
	 * Called when the user selects one of the radio buttons - it
	 * calls the updateResponse delegate to update the state in the App
	 * to reflect their choice.
	 */
	/*const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {        
        // Create a new response object
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		// Update the responsesMap in the App
		props.updateResponse( newResponse )
	}, [] )*/

	// Render the component
	return (
		<StyledCodingAnswer>
			<Label
				label={"This is a coding Question test."}
			/>
			<AceEditor
				mode="java"
				theme="github"
				onChange={value => console.log( value )}
				name="editor"
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
