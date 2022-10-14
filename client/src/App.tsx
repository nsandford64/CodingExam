import React from "react"
import styled from "styled-components"
import { MultipleChoice } from "./components/multipleChoice"
import { ShortAnswer } from "./components/shortAnswer"
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
			<ShortAnswer questionText="How do you feel today?" />
		</StyledApp>
	)
}

export default App
