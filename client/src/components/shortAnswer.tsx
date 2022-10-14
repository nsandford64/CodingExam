import { Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"

interface ShortAnswerProps {
	questionText: string
}

const StyledShortAnswer = styled.div`
	padding: 10px;
`

export const ShortAnswer = React.memo( ( props: ShortAnswerProps ) => {
	return (
		<StyledShortAnswer>
			<Label>{props.questionText}</Label>
			<TextArea large />
		</StyledShortAnswer>
	)
} )
ShortAnswer.displayName = "ShortAnswer"