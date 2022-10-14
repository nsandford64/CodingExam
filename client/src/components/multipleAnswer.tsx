import { Checkbox, Label } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"

interface MultipleAnswerProps {
	questionText: string
	answerChoices: string[]
}

const StyledMultipleAnswer = styled.div`
	padding: 10px;
`

export const MultipleAnswer = React.memo( ( props: MultipleAnswerProps ) => {
	const [ selectedChoices, setSelectedChoices ] = React.useState( [] as string[] )

	const handleChecked = React.useCallback( ( checkedChoice: string ) => {
		let newChoices = [ ...selectedChoices ]

		if( !newChoices.includes( checkedChoice ) ) {
			newChoices.push( checkedChoice )
		}
		else {
			newChoices = newChoices.filter( choice => choice != checkedChoice )
		}

		setSelectedChoices( newChoices )
	}, [ selectedChoices ] )

	return (
		<StyledMultipleAnswer>
			<Label>{props.questionText}</Label>
			{props.answerChoices.map( ( choice, index ) => (
				<Checkbox 
					key={index}
					checked={selectedChoices.includes( choice ) }
					label={choice}
					onChange={() => handleChecked( choice )}
				/>
			) )}
		</StyledMultipleAnswer>
	)
} )
MultipleAnswer.displayName = "MultipleAnswer"