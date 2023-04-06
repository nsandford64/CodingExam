// Copyright 2022 under MIT License
import { Button, InputGroup, Intent, MenuItem, Spinner } from "@blueprintjs/core"
import { Select2 } from "@blueprintjs/select"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Question, QuestionType } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { createExamThunk, selectQuestionById, examActions, selectNextQuestionId, selectQuestionIds, selectToken } from "../slices/examSlice"
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
	// nextQuestionId from the store
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	/**
	 * State
	 */
	// State that holds if the page is loading or not
	const [ loading, setLoading ] = React.useState( true )
	// State to hold the questions that have been added since render
	const [ addedQuestionIds, setAddedQuestionIds ] = React.useState( [] as number[] )

	/**
	 * Callbacks
	 */
	// Called when a user adds a question to the exam - creates a new question with the given type
	const handleAddQuestionClick = React.useCallback( async ( questionType: string ) => {
		let newQuestionType: QuestionType
		switch( questionType ) {
		case "MultipleChoice":
			newQuestionType = QuestionType.MultipleChoice
			break
		case "TrueFalse":
			newQuestionType = QuestionType.TrueFalse
			break
		case "ShortAnswer":
			newQuestionType = QuestionType.ShortAnswer
			break
		case "CodingAnswer":
			newQuestionType = QuestionType.CodingAnswer
			break
		case "ParsonsProblem":
			newQuestionType = QuestionType.ParsonsProblem
			break
		default:
			newQuestionType = QuestionType.None
			break
		}

		const newQuestion: Question = {
			answers: [],
			id: nextQuestionId || -1,
			pointsPossible: 0,
			text: "",
			type: newQuestionType,
			correctAnswer: 0
		}

		// Gets the next question ID from the server
		const data = await fetch( "/api/instructor/newquestionid", {
			headers: {
				"token": token
			} 
		} )
		const json  = await data.json()

		setAddedQuestionIds( prevState => [ ...prevState, newQuestion.id ] )

		batch( () => {
			dispatch( examActions.updateQuestion( newQuestion ) )
			dispatch( examActions.setNextQuestionId( parseInt( json.newid ) ) )
		} )
	}, [ nextQuestionId, addedQuestionIds ] )

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
				dispatch( examActions.setNextQuestionId( parseInt( questionId.newid ) ) ) 
				dispatch( examActions.reInitializeStore( parseInt( questionId.newid ) ) )
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
						editing={addedQuestionIds.includes( id )}
					/>
				) )}
			</StyledQuestionsContainer>
			<QuestionDropdown 
				addQuestion={handleAddQuestionClick}
			/>
			<Button 
				intent={Intent.PRIMARY}
				text="Done"
				disabled={questionIds.length === 0}
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
	editing?: boolean
}

/**
 * Style for the container around the question text
 */
const StyledQuestionTextContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`

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
	// Dispatch an action to the store
	const dispatch = useAppDispatch()
	// Get particular question from the store
	const question = useAppSelector( state => selectQuestionById(
		state,
		props.questionId
	) )

	/**
	 * State
	 */
	const [ editing, setEditing ] = React.useState( props.editing )

	/**
	 * Effects
	 */
	React.useEffect( () => {
		setEditing( props.editing )
	}, [ props.editing ] )

	/**
	 * Render
	 */
	return (
		<StyledQuestionContainer>
			<StyledQuestionHeader>
				<StyledQuestionTextContainer>
					Question {props.index + 1}
					{editing && (
						<>
							<InputGroup 
								value={question?.pointsPossible.toString() || "0"}
								onChange={e => dispatch( examActions.updateQuestion( { ...question, pointsPossible: parseInt( e.target.value ) || 0 } ) )}
								style={{ width: 40, margin: "0 5px" }}
							/>
							points
						</>
					)}
				</StyledQuestionTextContainer>
				{!editing && (
					<Button 
						intent={Intent.WARNING}
						icon="edit"
						onClick={() => setEditing( true )}
						style={{ marginLeft: "auto" }}
					/>
				)}
				{editing && (
					<Button 
						intent={Intent.SUCCESS}
						icon="tick"
						onClick={() => setEditing( false )}
						style={{ marginLeft: "auto" }}
					/>
				)}
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
				editable={editing}
			/>
		</StyledQuestionContainer>
	)
} )
QuestionDisplay.displayName = "QuestionDisplay"

/**
 * Props for QuestionDropdown
 */
interface QuestionDropdownProps {
	addQuestion: ( questionType: string ) => void
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
			onItemSelect={props.addQuestion}
			popoverProps={{ position: "bottom" }}
		>
			<Button icon="plus" />
		</Select2>
	)
} )
QuestionDropdown.displayName = "QuestionDropdown"
