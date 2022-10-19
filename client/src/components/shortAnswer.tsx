import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"

const StyledShortAnswer = styled.div`
	padding: 10px;
`

export const ShortAnswer = React.memo( ( props: ComponentProps ) => {
	const [ response, setResponse ] = React.useState( props.response?.value || "" )

	const handleBlur = React.useCallback( () => {
		const newResponse: Response = {
			questionId: props.questionId,
			isText: true,
			value: response
		}

		props.updateResponse( newResponse )
	}, [ response ] )

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