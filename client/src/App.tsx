import React from "react"
import styled from "styled-components"
import { MultipleAnswer } from "./components/multipleAnswer"
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
			<MultipleAnswer 
				questionText="What classes are you in? (Select all that apply)"
				answerChoices={[ "CIS018", "MATH551", "STAT510", "CIS505" ]}
			/>
		</StyledApp>
	)
}

export default App
