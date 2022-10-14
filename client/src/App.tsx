import React from "react"
import styled from "styled-components"
import { MultipleChoice } from "./components/multipleChoice"
import { TrueFalse } from "./components/trueFalse"

const StyledApp = styled.div`
	
`

function App() {
	return (
		<StyledApp>
			<MultipleChoice 
				questionText="What is the best programming language?"
				answerChoices={[ "C#", "Java", "TypeScript", "Fortran" ]}
			/>
			<TrueFalse questionText="Computer Science is dope." />
		</StyledApp>
	)
}

export default App
