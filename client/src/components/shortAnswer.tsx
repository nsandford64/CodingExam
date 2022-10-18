import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Answer, ComponentProps } from "../App"

const StyledShortAnswer = styled.div`
	padding: 10px;
`

export const ShortAnswer = React.memo( ( props: ComponentProps ) => {
	const [ answer, setAnswer ] = React.useState( props.answer?.value || "" )

	const handleBlur = React.useCallback( () => {
		const newAnswer: Answer = {
			questionId: props.questionId,
			value: answer
		}

		props.updateAnswer( newAnswer )
	}, [ answer ] )

	return (
		<StyledShortAnswer>
			<Label>{props.questionText}</Label>
			<TextArea 
				large 
				onBlur={handleBlur} 
				onChange={ e => setAnswer( e.target.value )}
				value={answer} 
			/>
		</StyledShortAnswer>
	)
} )
ShortAnswer.displayName = "ShortAnswer"