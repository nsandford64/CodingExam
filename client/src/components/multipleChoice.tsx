import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"

const StyledMultipleChoice = styled.div`
	padding: 10px;
`

export const MultipleChoice = React.memo( ( props: ComponentProps ) => {
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		props.updateResponse( newResponse )
	}, [] )

	return (
		<StyledMultipleChoice>
			<RadioGroup
				label={props.questionText}
				onChange={handleChange}
				selectedValue={props.response?.value}
			>
				{props.answerChoices?.map( ( choice, index ) => (
					<Radio key={index} label={choice} value={index} />
				) )}
			</RadioGroup>
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
