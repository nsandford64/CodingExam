import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"

interface MultipleChoiceProps {
	questionText: string
	answerChoices: string[]
}

const StyledMultipleChoice = styled.div`
	padding: 10px;
`

export const MultipleChoice = React.memo( ( props: MultipleChoiceProps ) => {
	const [ selection, setSelection ] = React.useState( -1 )

	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value

		setSelection( parseInt( value ) )
	}, [] )

	return (
		<StyledMultipleChoice>
			<RadioGroup
				label={props.questionText}
				onChange={handleChange}
				selectedValue={selection}
			>
				{props.answerChoices.map( ( choice, index ) => (
					<Radio key={index} label={choice} value={index} />
				) )}
			</RadioGroup>
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
