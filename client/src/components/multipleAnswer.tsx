// Copyright 2022 under MIT License
import { Checkbox, Label } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { ComponentProps } from "../App"

/**
 * Style for the MultipleAnswer component
 */
const StyledMultipleAnswer = styled.div`
	padding: 10px;
`

/**
 * MultipleAnswer Component
 * 
 * This component renders a multiple choice question to the user.
 * They can pick multiple answers from a given array of answer choices
 */
export const MultipleAnswer = React.memo( ( props: ComponentProps ) => {

	// Array that holds the answers that the user has currently selected
	const [ selectedChoices, setSelectedChoices ] = React.useState( [] as string[] )

	/**
	 * Called when the user clicks a checkbox - this updates the 
	 * selectedChoices array to toggle the clicked checkbox
	 */
	const handleChecked = React.useCallback( ( checkedChoice: string ) => {
		// Store a copy of the array
		let newChoices = [ ...selectedChoices ]

		// Toggle the incoming checkedChoice
		if( !newChoices.includes( checkedChoice ) ) {
			newChoices.push( checkedChoice )
		}
		else {
			newChoices = newChoices.filter( choice => choice != checkedChoice )
		}

		// Update the state
		setSelectedChoices( newChoices )
	}, [ selectedChoices ] )

	// Render the component
	return (
		<StyledMultipleAnswer>
			<Label>{props.questionText}</Label>
			{props.answerChoices?.map( ( choice, index ) => (
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