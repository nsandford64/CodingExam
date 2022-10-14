import { Radio, RadioGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"

interface TrueFalseProps {
	questionText: string
}

const StyledTrueFalse = styled.div`
	padding: 10px;
`

export const TrueFalse = React.memo( ( props: TrueFalseProps ) => {
	const [ selection, setSelection ] = React.useState( -1 )

	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value

		setSelection( parseInt( value ) )
	}, [] )
	
	return (
		<StyledTrueFalse>
			<RadioGroup
				label={props.questionText}
				onChange={handleChange}
				selectedValue={selection}
			>
				<Radio label="False" value={0} />
				<Radio label="True" value={1} />
			</RadioGroup>
		</StyledTrueFalse>
	)
} )
TrueFalse.displayName = "TrueFalse"