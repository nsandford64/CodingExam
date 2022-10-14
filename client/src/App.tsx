import React from "react"
import styled from "styled-components"
import { MultipleChoice } from "./components/multipleChoice"

const StyledApp = styled.div`
	
`

function App() {
	return (
		<StyledApp>
			<MultipleChoice 
				questionText="What is the best programming language?"
				answerChoices={[ "C#", "Java", "TypeScript", "Fortran" ]}
			/>
		</StyledApp>
	)
}

export default App
