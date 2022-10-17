import { Button, Intent } from "@blueprintjs/core"
import React from "react"
import styled from "styled-components"
import { MultipleAnswer } from "./components/multipleAnswer"
import { MultipleChoice } from "./components/multipleChoice"
import { ShortAnswer } from "./components/shortAnswer"
import { TrueFalse } from "./components/trueFalse"

const StyledApp = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

const StyledQuestionsContainer = styled.div`
`


function App() {
	const [ questions, setQuestions ] = React.useState( [] as Question[] )

	React.useEffect( () => {
		const initQuestions = async () => {
			const data = await fetch( "http://localhost:9000/api/questions", {
				headers: {
					"examID": "1"
				} 
			} )

			const json  = await data.json()
			const questions: Question[] = json.questions
			console.log( questions )
			setQuestions( questions )
		}

		initQuestions()
	}, [] )

	
	return (
		<StyledApp>
			<StyledQuestionsContainer>
				{questions.map( question => {
					switch( question.type ) {
					case QuestionType.MultipleChoice:
						return (
							<MultipleChoice 
								key={question.id}
								questionText={question.text}
								answerChoices={question.answers}
							/>
						)
					case QuestionType.TrueFalse:
						return (
							<TrueFalse 
								key={question.id}
								questionText={question.text}
							/>
						)
					case QuestionType.ShortAnswer:
						return (
							<ShortAnswer 
								key={question.id}
								questionText={question.text}
							/>
						)
					}
				} )}				
				<Button intent={Intent.PRIMARY} style={{marginTop: "20px"}} text="Submit" />
			</StyledQuestionsContainer>
		</StyledApp>
	)
}

export default App

type Question = {
	id: number
	text: string
	type: QuestionType
	answers: string[] 
}

enum QuestionType {
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3
}