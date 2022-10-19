//Copyright 2022 under MIT License
import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"

/**
 * Style for the TrueFalse component
 */
const StyledTrueFalse = styled.div`
	padding: 10px;
`

/**
 * TrueFalse Component
 * 
 * This component presents the user with a statement, and then they
 * must select between true or false
 */
export const TrueFalse = React.memo( ( props: ComponentProps ) => {

	// Called when the user selects between true or false - updates the App's responsesMap
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		props.updateResponse( newResponse )
	}, [] )
	
	// Render the component
	return (
		<StyledTrueFalse>
			<RadioGroup
				label={props.questionText}
				onChange={handleChange}
				selectedValue={props.response?.value}
			>
				<Radio label="False" value={0} />
				<Radio label="True" value={1} />
			</RadioGroup>
		</StyledTrueFalse>
	)
} )
TrueFalse.displayName = "TrueFalse"