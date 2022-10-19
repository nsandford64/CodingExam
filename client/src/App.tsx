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
	const [ responsesMap, setResponsesMap ] = React.useState( new Map<number, Response>() )

	const updateResponse = React.useCallback( ( response: Response ) => {
		setResponsesMap( new Map<number, Response>( responsesMap.set( response.questionId, response ) ) )
	}, [ responsesMap ] )

	React.useEffect( () => {
		const initQuestions = async () => {
			/* Fetch exam questions */
			let data = await fetch( "http://localhost:9000/api/questions", {
				headers: {
					"examID": "1"
				} 
			} )

			let json  = await data.json()
			const questions: Question[] = json.questions

			/* Fetch exam responses (if there are any) */
			data = await fetch( "http://localhost:9000/api/responses", {
				headers: {
					"examID": "a94f149b-336c-414f-a05b-8b193322cbd8",
					"userID": "668ce32912fc74ec7e60cc59f32f304dc4379617"
				}
			} )

			json = await data.json()
			const responses: Response[] = json.responses

			const newResponsesMap = new Map<number, Response>()
			responses.forEach( response => {
				newResponsesMap.set( response.questionId, response )
			} )

			setQuestions( questions )
			setResponsesMap( newResponsesMap )
		}

		initQuestions()
	}, [] )

	const submit = React.useCallback( async () => {
		const res = await fetch( "http://localhost:9000/api", {
			// Adding method type
			method: "POST",
     
			// Adding body or contents to send
			body: JSON.stringify(
				Array.from( responsesMap.values() )
			),
     
			// Adding headers to the request
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		} )

		const json = await res.json()
		console.log( json )

	}, [ responsesMap ] )

	
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
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					case QuestionType.TrueFalse:
						return (
							<TrueFalse 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					case QuestionType.ShortAnswer:
						return (
							<ShortAnswer 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
							/>
						)
					case QuestionType.MultipleAnswer:
						return (
							<MultipleAnswer 
								key={question.id}
								questionId={question.id}
								questionText={question.text}
								answerChoices={question.answers}
								response={responsesMap.get( question.id )}
								updateResponse={updateResponse}
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

export type Response = {
	questionId: number
	isText?: boolean
	value: number | string
}

export interface ComponentProps {
	questionId: number
	questionText: string
	answerChoices?: string[]
	response?: Response
	updateResponse: ( response: Response ) => void
}

enum QuestionType {
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3,
	MultipleAnswer = 4,
}

