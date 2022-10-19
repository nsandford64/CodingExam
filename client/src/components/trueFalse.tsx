import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Response, ComponentProps } from "../App"

const StyledTrueFalse = styled.div`
	padding: 10px;
`

export const TrueFalse = React.memo( ( props: ComponentProps ) => {
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newResponse: Response = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		props.updateResponse( newResponse )
	}, [] )
	
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