// Copyright 2022 under MIT License
import { Button, InputGroup, Intent, Label, MenuItem, Spinner, TextArea } from "@blueprintjs/core"
import { Select2 } from "@blueprintjs/select"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { LANGUAGE_CHOICES, Question, QuestionType } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { createExamThunk, examActions, selectNextQuestionId, selectQuestionIds, selectToken } from "../slices/examSlice"
import { QuestionSwitch, StyledQuestionContainer, StyledQuestionHeader, StyledQuestionsContainer } from "./examView"

/**
 * Style for the CreateExamView
 */
const StyledCreateExamView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`

/**
 * CreateExamView Component
 * 
 * This component allows the Instructor to create
 * an exam using a GUI instead of the database
 */
export const CreateExamView = React.memo( () => {
	/**
	 * Selectors
	 */
	// Dispatch an action to the store
	const dispatch = useAppDispatch()
	// questionIds from the store
	const questionIds = useAppSelector( selectQuestionIds )
	// token from the store
	const token = useAppSelector( selectToken )

	/**
	 * State
	 */
	// State to hold the selected QuestionType
	const [ selectedQuestionType, setSelectedQuestionType ] = React.useState( "" )
	// State that holds if the page is loading or not
	const [ loading, setLoading ] = React.useState( true )

	/**
	 * Effects
	 */
	// Called on render - reinitialize the store
	React.useEffect( () => {
		const initQuestions = async () => {
			// Fetch exam questions
			const data = await fetch( "/api/questions", {
				headers: {
					"token": token
				} 
			} )
			
			const json  = await data.json()
			const questions: Question[] = json.questions

			// Loop through questions and create ids and a map
			const newQuestionIds: number[] = []
			const newQuestionsMap = new Map<number, Question>()
			questions.forEach( question => {
				newQuestionIds.push( question.id )
				newQuestionsMap.set( question.id, question )
			} )

			// Gets the next question ID from the server
			const newId = await fetch( "/api/instructor/newquestionid", {
				headers: {
					"token": token
				} 
			} )

			const questionId = await newId.json()

			// Update the store
			batch( ()=>{
				dispatch( examActions.setNextQuestionId( questionId.newid ) ) 
				dispatch( examActions.reInitializeStore( questionId.newid ) )
				dispatch( examActions.setQuestionIds( newQuestionIds ) )
				dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
			} )

			setLoading( false )
		}
		// Call async function
		initQuestions()

	}, [] )

	/**
	 * Render
	 */
	if( loading ) return (
		<StyledCreateExamView>
			<Spinner 
				size={50}
				style={{ padding: "50px" }}
			/>
		</StyledCreateExamView>
	)
	return (
		<StyledCreateExamView>
			<StyledQuestionsContainer>
				{questionIds.map( ( id, index ) => (
					<QuestionDisplay 
						index={index}
						key={id}
						questionId={id}
					/>
				) )}
			</StyledQuestionsContainer>
			{selectedQuestionType && (
				<CreateQuestionSwitch 
					questionType={selectedQuestionType}
					setSelectedQuestionType={setSelectedQuestionType}
				/>
			)}
			{selectedQuestionType && (
				<Button 
					text="Cancel"
					onClick={() => setSelectedQuestionType( "" )}
				/>
			)}
			{!selectedQuestionType && (
				<QuestionDropdown 
					setSelectedQuestionType={setSelectedQuestionType}
				/>
			)}
			<Button 
				intent={Intent.PRIMARY}
				text="Done"
				disabled={selectedQuestionType !== "" || questionIds.length === 0}
				fill
				onClick={() => dispatch( createExamThunk )}
				style={{ marginTop: "25px" }}
			/>	
		</StyledCreateExamView>
	)}
)
CreateExamView.displayName = "CreateExamView"

/**
 * Props for QuestionDisplay
 */
interface QuestionDisplayProps {
	questionId: number
	index: number
}

/**
 * QuestionDisplay Component
 * 
 * This component renders a question along with
 * a button to delete it
 */
const QuestionDisplay = React.memo( ( props: QuestionDisplayProps ) => {
	/**
	 * Selectors
	 */
	const dispatch = useAppDispatch()

	/**
	 * Render
	 */
	return (
		<StyledQuestionContainer>
			<StyledQuestionHeader>
				Question {props.index + 1}
				<Button 
					intent={Intent.WARNING}
					icon="edit"
					//onClick={() => dispatch( examActions.deleteQuestion( props.questionId ) )}
					style={{ marginLeft: "auto" }}
				/>
				<Button 
					intent={Intent.DANGER}
					icon="delete"
					onClick={() => dispatch( examActions.deleteQuestion( props.questionId ) )}
					style={{ marginLeft: "auto" }}
				/>
			</StyledQuestionHeader>
			<QuestionSwitch
				questionId={props.questionId}
				disabled
				headerShown
			/>
		</StyledQuestionContainer>
	)
} )
QuestionDisplay.displayName = "QuestionDisplay"

/**
 * Props for QuestionDropdown
 */
interface QuestionDropdownProps {
	setSelectedQuestionType: ( val: string ) => void
}

/**
 * QuestionDropdown Component
 * 
 * This component allows the user to select from
 * the available QuestionTypes and create an exam question
 */
const QuestionDropdown = React.memo( ( props: QuestionDropdownProps ) => {
	/**
	 * Render Variables
	 */
	// String representation of the enum values so they can be displayed
	const items = Object.keys( QuestionType ).filter( item => (
		isNaN( Number( item ) ) 
		&& item !== "None"
	) )

	/**
	 * Render
	 */
	return (
		<Select2<string> 
			items={items}
			filterable={false}
			itemRenderer={( item, { handleClick } ) => (
				<MenuItem 
					key={item}
					text={item}
					onClick={handleClick}
					roleStructure="listoption"
					style={{ textAlign: "center" }}
				/>
			)}
			onItemSelect={props.setSelectedQuestionType}
			popoverProps={{ position: "bottom" }}
		>
			<Button icon="plus" />
		</Select2>
	)
} )
QuestionDropdown.displayName = "QuestionDropdown"

/**
 * Props for CreateQuestionSwitch
 */
interface CreateQuestionSwitchProps {
	questionType: string
	setSelectedQuestionType: ( val: string ) => void
}

/**
 * CreateQuestionSwitch Component
 * 
 * This component determines which prompt should be shown
 * in order for the user to create a new question
 */
const CreateQuestionSwitch = React.memo( ( props: CreateQuestionSwitchProps ) => {
	/**
	 * Selectors
	 */
	// Dispatch at action to the store
	const dispatch = useAppDispatch()

	// Gets the token from the store
	const token = useAppSelector( selectToken )

	/**
	 * Memos
	 */
	// Converted string value to enum value
	const questionTypeEnum = React.useMemo( () => {
		switch( props.questionType ) {
		case "MultipleChoice":
			return QuestionType.MultipleChoice
		case "TrueFalse":
			return QuestionType.TrueFalse
		case "ShortAnswer":
			return QuestionType.ShortAnswer
		case "CodingAnswer":
			return QuestionType.CodingAnswer
		case "ParsonsProblem":
			return QuestionType.ParsonsProblem
		default:
			return QuestionType.None
		}
	}, [ props.questionType ] )

	/**
	 * Callbacks
	 */
	/*
	Called when the user clicks the "Add" button - this creates
	a new Question in the store and tells it increment its counter
	*/
	const createQuestion = React.useCallback( async ( question: Question ) => {
		props.setSelectedQuestionType( "" )

		// Gets the next question ID from the server
		const data = await fetch( "/api/instructor/newquestionid", {
			headers: {
				"token": token
			} 
		} )

		const json  = await data.json()

		batch( () => {
			dispatch( examActions.setNextQuestionId( json.newid ) )
			dispatch( examActions.updateQuestion( question ) )
		} )
		
	}, [] )

	/**
	 * Render
	 */
	// Render the component based on its questionTypeEnum
	switch( questionTypeEnum ) {
	case QuestionType.MultipleChoice:
		return (
			<CreateMultipleChoice 
				createQuestion={createQuestion}
			/>
		)
	case QuestionType.TrueFalse:
		return (
			<CreateTrueFalse 
				createQuestion={createQuestion}
			/>
		)
	case QuestionType.ParsonsProblem:
		return (
			<CreateParsonsProblem 
				createQuestion={createQuestion}
			/>
		)
	default:
		return (
			<CreateGeneric
				questionType={questionTypeEnum}
				createQuestion={createQuestion}
			/>
		)
	}
} )
CreateQuestionSwitch.displayName = "CreateQuestionSwitch"

/**
 * Props for CreateQuestionComponents
 * 
 * This interface determines that each component that creates
 * a question should have a createQuestion function passed to it
 */
interface CreateQuestionComponentProps {
	createQuestion: ( question: Question ) => void
}

/**
 * Style for a row
 */
const StyledRow = styled.div`
	margin-bottom: 10px;
`

/**
 * Style for a button container
 */
const StyledButtonContainer = styled.div`
	display: flex;
`

/**
 * CreateMultipleChoice Component
 * 
 * This component allows the user to create a MultipleChoice
 * question
 */
const CreateMultipleChoice = React.memo( ( props: CreateQuestionComponentProps ) => {
	/**
	 * Selectors
	 */
	// nextQuestionId from the store
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	/**
	 * State
	 */
	// State to hold the currently modified question
	const [ question, setQuestion ] = React.useState( {
		answers: [ "" ],
		id: nextQuestionId,
		text: "",
		type: QuestionType.MultipleChoice,
		correctAnswer: 0,
		pointsPossible: 0
	} as Question )

	/**
	 * Callbacks
	 */
	/*
	Called when the user modifies an answer value - this ensures
	the question state is kept up to date
	*/
	const handleChange = React.useCallback( ( index: number, value: string ) => {
		const newAnswers = [ ...question.answers ]
		newAnswers[index] = value

		setQuestion( { 
			...question, answers: newAnswers 
		} )
	}, [ question ] )

	/*
	Called when the user wants to add another answer choice
	*/
	const handleAdd = React.useCallback( () => {
		const newAnswers = [ ...question.answers, "" ]
		setQuestion( {
			...question, 
			answers: newAnswers
		} )
	}, [ question ] )

	/*
	Called when the user wants to delete an answer choice
	*/
	const handleRemove = React.useCallback( () => {
		const newAnswers = [ ...question.answers ]
		newAnswers.pop()

		setQuestion( {
			...question,
			answers: newAnswers
		} )
	}, [ question ] )

	/**
	 * Render
	 */
	return (
		<>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Question Text</Label>
				<TextArea
					growVertically={true}
					large={true}
					fill={true}
					value={question.text}
					onChange={e => setQuestion( {
						...question,
						text: e.target.value
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Answer Choices</Label>
				{question.answers.map( ( answer, index ) => (
					<InputGroup 
						value={answer}
						key={index}
						onChange={e => handleChange( index, e.target.value )}
						style={{ marginBottom: "5px" }}
					/>
				) )}
				<StyledButtonContainer>
					<Button 
						icon="plus"
						onClick={handleAdd}
						disabled={question.answers.length === 4}
					/>
					<Button 
						icon="minus"
						onClick={handleRemove}
						style={{ marginLeft: "auto" }}
						disabled={question.answers.length === 1}
					/>
				</StyledButtonContainer>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Index of Correct Answer</Label>
				<InputGroup 
					value={question.correctAnswer?.toString() || "0"}
					onChange={e => setQuestion( {
						...question,
						correctAnswer: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Points Possible</Label>
				<InputGroup
					value={question.pointsPossible.toString()}
					onChange={e => setQuestion( {
						...question,
						pointsPossible: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={() => props.createQuestion( question )}
			/>
		</>
	)
} )
CreateMultipleChoice.displayName = "CreateMultipleChoice"

/**
 * CreateTrueFalse Component
 * 
 * This component allows the user to create a TrueFalse question
 */
const CreateTrueFalse = React.memo( ( props: CreateQuestionComponentProps ) => {
	/**
	 * Selectors
	 */
	// nextQuestionId from the store
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	/**
	 * State
	 */
	// State to hold the currently modified question
	const [ question, setQuestion ] = React.useState( {
		answers: [ "False", "True" ],
		id: nextQuestionId,
		text: "",
		type: QuestionType.TrueFalse,
		correctAnswer: 0,
		pointsPossible: 0
	} as Question )

	/**
	 * Render
	 */
	return (
		<>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Question Text</Label>
				<TextArea
					growVertically={true}
					large={true}
					fill={true}
					value={question.text}
					onChange={e => setQuestion( {
						...question,
						text: e.target.value
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Enter 1 for True or 0 for False</Label>
				<TextArea
					growVertically={true}
					large={true}
					fill={true}
					value={question.correctAnswer?.toString() || "0"}
					onChange={e => setQuestion( {
						...question,
						correctAnswer: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Points Possible</Label>
				<InputGroup
					value={question.pointsPossible.toString()}
					onChange={e => setQuestion( {
						...question,
						pointsPossible: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={() => props.createQuestion( question )}
			/>
		</>
	)
} )
CreateTrueFalse.displayName = "CreateTrueFalse"

/**
 * CreateParsonsProblem Component
 * 
 * This component allos the user to create a ParsonsProblem
 * question
 */
const CreateParsonsProblem = React.memo( ( props: CreateQuestionComponentProps ) => {
	/**
	 * Selectors
	 */
	// nextQuestionId from the store
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	/**
	 * State
	 */
	// State to hold the currently modified question
	const [ question, setQuestion ] = React.useState( {
		answers: [ "" ],
		id: nextQuestionId,
		text: "",
		type: QuestionType.ParsonsProblem,
		parsonsAnswer: "",
		pointsPossible: 0
	} as Question )

	/**
	 * Callbacks
	 */
	/*
	Called when the user modifies an answer value - this ensures
	the question state is kept up to date
	*/
	const handleChange = React.useCallback( ( index: number, value: string ) => {
		const newAnswers = [ ...question.answers ]
		newAnswers[index] = value

		setQuestion( { 
			...question, answers: newAnswers 
		} )
	}, [ question ] )

	/*
	Called when the user wants to add another answer choice
	*/
	const handleAdd = React.useCallback( () => {
		const newAnswers = [ ...question.answers, "" ]
		setQuestion( {
			...question, 
			answers: newAnswers
		} )
	}, [ question ] )

	/*
	Called when the user wants to delete an answer choice
	*/
	const handleRemove = React.useCallback( () => {
		const newAnswers = [ ...question.answers ]
		newAnswers.pop()

		setQuestion( {
			...question,
			answers: newAnswers
		} )
	}, [ question ] )

	/**
	 * Render
	 */
	return (
		<>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Question Text</Label>
				<InputGroup 
					value={question.text}
					onChange={e => setQuestion( {
						...question,
						text: e.target.value
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Answer Choices</Label>
				{question.answers.map( ( answer, index ) => (
					<InputGroup 
						value={answer}
						key={index}
						onChange={e => handleChange( index, e.target.value )}
						style={{ marginBottom: "5px" }}
					/>
				) )}
				<StyledButtonContainer>
					<Button 
						icon="plus"
						onClick={handleAdd}
					/>
					<Button 
						icon="minus"
						onClick={handleRemove}
						style={{ marginLeft: "auto" }}
						disabled={question.answers.length === 1}
					/>
				</StyledButtonContainer>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Correct Order of Elements (enter in the format ###)</Label>
				<InputGroup 
					value={question.parsonsAnswer || ""}
					onChange={e => setQuestion( {
						...question,
						parsonsAnswer: e.target.value
					} )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Points Possible</Label>
				<InputGroup
					value={question.pointsPossible.toString()}
					onChange={e => setQuestion( {
						...question,
						pointsPossible: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={() => props.createQuestion( question )}
			/>
		</>
	)
} )
CreateParsonsProblem.displayName = "CreateParsonsProblem"

/**
 * Props for CreateGeneric
 */
interface CreateGenericProps {
	questionType: QuestionType
	createQuestion: ( question: Question ) => void
}

/**
 * CreateGeneric Component
 * 
 * This component creates a generic question with a specified type. This
 * includes ShortAnswer and CodingAnswer
 */
const CreateGeneric = React.memo( ( props: CreateGenericProps ) => {
	/**
	 * Selectors
	 */
	// nextQuestionId from the store
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	/**
	 * State
	 */
	// State to hold the currently updated question
	const [ question, setQuestion ] = React.useState( {
		answers: [],
		id: nextQuestionId,
		text: "",
		type: props.questionType,
		correctAnswer: 0,
		pointsPossible: 0
	} as Question )
	// State to hold the language, if this is a CodingAnswer question
	const [ language, setLanguage ] = React.useState( "" )

	/**
	 * Callbacks
	 */
	// Called when the Add button is pressed - creates a new Question 
	const handleAdd = React.useCallback( () => {
		if ( question.type === QuestionType.CodingAnswer ) {
			props.createQuestion( {
				...question,
				text: question.text + ":" + ( language || "java" ) 
			} )
		}
		else {
			props.createQuestion( question )
		}
	}, [ question, language ] )

	/**
	 * Render
	 */
	return (	
		<>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Question Text</Label>
				<TextArea
					growVertically={true}
					large={true}
					fill={true}
					value={question.text}
					onChange={e => setQuestion( {
						...question,
						text: e.target.value
					} )}
				/>
			</StyledRow>
			{props.questionType === QuestionType.CodingAnswer && (
				<StyledRow>
					<Select2<string> 
						items={LANGUAGE_CHOICES}
						filterable={false}
						itemRenderer={( item, { handleClick } ) => (
							<MenuItem 
								key={item}
								text={item}
								onClick={handleClick}
								roleStructure="listoption"
								style={{ textAlign: "center" }}
							/>
						)}
						onItemSelect={item => setLanguage( item )}
						popoverProps={{ position: "bottom" }}
					>
						<Button text={language || "Select language..."} />
					</Select2>
				</StyledRow>
			)}
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Points Possible</Label>
				<InputGroup
					value={question.pointsPossible.toString()}
					onChange={e => setQuestion( {
						...question,
						pointsPossible: parseInt( e.target.value ) || 0
					} )}
				/>
			</StyledRow>
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={handleAdd}
			/>
		</>
	)
} )
CreateGeneric.displayName = "CreateGeneric"	