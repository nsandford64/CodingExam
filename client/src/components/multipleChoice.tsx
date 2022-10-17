import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Answer } from "../App"

interface MultipleChoiceProps {
	questionId: number
	questionText: string
	answerChoices: string[]
	answer?: Answer
	updateAnswer: ( answer: Answer ) => void
}

const StyledMultipleChoice = styled.div`
	padding: 10px;
`

export const MultipleChoice = React.memo( ( props: MultipleChoiceProps ) => {
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newAnswer: Answer = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		props.updateAnswer( newAnswer )
	}, [] )

	return (
		<StyledMultipleChoice>
			<RadioGroup
				label={props.questionText}
				onChange={handleChange}
				selectedValue={props.answer?.value}
			>
				{props.answerChoices.map( ( choice, index ) => (
					<Radio key={index} label={choice} value={index} />
				) )}
			</RadioGroup>
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
