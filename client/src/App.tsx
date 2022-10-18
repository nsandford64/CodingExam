import { Button, Intent } from "@blueprintjs/core"
import React from "react"
import styled from "styled-components"
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
	const [ answersMap, setAnswersMap ] = React.useState( new Map<number, Answer>() )

	const updateAnswer = React.useCallback( ( answer: Answer ) => {
		setAnswersMap( new Map<number, Answer>( answersMap.set( answer.questionId, answer ) ) )
	}, [ answersMap ] )

	React.useEffect( () => {
		const initQuestions = async () => {
			const data = await fetch( "http://localhost:9000/api/questions", {
				headers: {
					"examID": "1"
				} 
			} )

			const json  = await data.json()
			const questions: Question[] = json.questions
			setQuestions( questions )
		}

		initQuestions()
	}, [] )

	const submit = React.useCallback( async () => {
		const res = await fetch( "http://localhost:9000/api", {
			// Adding method type
			method: "POST",
     
			// Adding body or contents to send
			body: JSON.stringify(
				Array.from( answersMap.entries() )
			),
     
			// Adding headers to the request
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		} )

		const json = await res.json()
		console.log( json )

	}, [ answersMap ] )

	
	return (
		<StyledApp>
			<StyledQuestionsContainer>
				{questions.map( question => {
					switch( question.type ) {
					case QuestionType.MultipleChoice:
						return (
							<MultipleChoice 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								answerChoices={question.answers}
								answer={answersMap.get( question.id )}
								updateAnswer={updateAnswer}
							/>
						)
					case QuestionType.TrueFalse:
						return (
							<TrueFalse 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								answer={answersMap.get( question.id )}
								updateAnswer={updateAnswer}
							/>
						)
					case QuestionType.ShortAnswer:
						return (
							<ShortAnswer 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								answer={answersMap.get( question.id )}
								updateAnswer={updateAnswer}
							/>
						)
					}
				} )}				
				<Button 
					intent={Intent.PRIMARY} 
					style={{marginTop: "20px"}} 
					text="Submit" 
					onClick={submit}
				/>
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

export type Answer = {
	questionId: number
	value: number | string
}

export interface ComponentProps {
	questionId: number
	questionText: string
	answerChoices?: string[]
	answer?: Answer
	updateAnswer: ( answer: Answer ) => void
}

enum QuestionType {
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3
}

