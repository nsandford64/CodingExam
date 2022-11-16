// Copyright 2022 under MIT License
import { Button, InputGroup, Intent, Label, MenuItem } from "@blueprintjs/core"
import { Select2 } from "@blueprintjs/select"
import * as React from "react"
import styled from "styled-components"
import { Question, QuestionType } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { createExamThunk, examActions, selectNextQuestionId, selectQuestionIds } from "../slices/examSlice"
import { QuestionSwitch } from "./examView"

const StyledCreateExamView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const CreateExamView = React.memo( () => {
	const dispatch = useAppDispatch()

	const questionIds = useAppSelector( selectQuestionIds )

	const [ selectedQuestionType, setSelectedQuestionType ] = React.useState( "" )

	return (
		<StyledCreateExamView>
			{questionIds.map( id => (
				<QuestionDisplay 
					key={id}
					questionId={id}
				/>
			) )}
			{selectedQuestionType && (
				<CreateQuestionSwitch 
					questionType={selectedQuestionType}
					setSelectedQuestionType={setSelectedQuestionType}
				/>
			)}
			{!selectedQuestionType && (
				<>
					<QuestionDropdown 
						setSelectedQuestionType={setSelectedQuestionType}
					/>
					<Button 
						intent={Intent.PRIMARY}
						text="Done"
						disabled={questionIds.length === 0}
						onClick={() => dispatch( createExamThunk )}
						style={{ marginTop: "10px" }}
					/>	
				</>
			)}
		</StyledCreateExamView>
	)
} )
CreateExamView.displayName = "CreateExamView"

interface QuestionDisplayProps {
	questionId: number
}

const StyledQuestionDisplay = styled.div`
`

const QuestionDisplay = React.memo( ( props: QuestionDisplayProps ) => {
	const dispatch = useAppDispatch()

	return (
		<StyledQuestionDisplay>
			<StyledButtonContainer>
				<Button 
					intent={Intent.DANGER}
					icon="minus"
					onClick={() => dispatch( examActions.deleteQuestion( props.questionId ) )}
					style={{ marginLeft: "auto" }}
				/>
			</StyledButtonContainer>
			<QuestionSwitch
				questionId={props.questionId}
				disabled
			/>
		</StyledQuestionDisplay>
	)
} )
QuestionDisplay.displayName = "QuestionDisplay"

interface QuestionDropdownProps {
	setSelectedQuestionType: ( val: string ) => void
}

const QuestionDropdown = React.memo( ( props: QuestionDropdownProps ) => {
	const items = Object.keys( QuestionType ).filter( item => isNaN( Number( item ) ) && item !== "None" )

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

interface CreateQuestionSwitchProps {
	questionType: string
	setSelectedQuestionType: ( val: string ) => void
}

const CreateQuestionSwitch = React.memo( ( props: CreateQuestionSwitchProps ) => {
	const dispatch = useAppDispatch()

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
		default:
			return QuestionType.None
		}
	}, [ props.questionType ] )

	const createQuestion = React.useCallback( ( question: Question ) => {
		props.setSelectedQuestionType( "" )

		dispatch( examActions.updateQuestion( question ) )
		dispatch( examActions.incrementNextQuestionId() )
	}, [] )

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

interface CreateQuestionComponentProps {
	createQuestion: ( question: Question ) => void
}

const StyledRow = styled.div`
	margin-bottom: 10px;
`

const StyledButtonContainer = styled.div`
	display: flex;
`

const CreateMultipleChoice = React.memo( ( props: CreateQuestionComponentProps ) => {

	const nextQuestionId = useAppSelector( selectNextQuestionId )

	const [ question, setQuestion ] = React.useState( {
		answers: [ "" ],
		id: nextQuestionId,
		text: "",
		type: QuestionType.MultipleChoice,
		correctAnswer: 0
	} as Question )

	const handleChange = React.useCallback( ( index: number, value: string ) => {
		const newAnswers = [ ...question.answers ]
		newAnswers[index] = value

		setQuestion( { 
			...question, answers: newAnswers 
		} )
	}, [ question ] )

	const handleAdd = React.useCallback( () => {
		const newAnswers = [ ...question.answers, "" ]
		setQuestion( {
			...question, 
			answers: newAnswers
		} )
	}, [ question ] )

	const handleRemove = React.useCallback( () => {
		const newAnswers = [ ...question.answers ]
		newAnswers.pop()

		setQuestion( {
			...question,
			answers: newAnswers
		} )
	}, [ question ] )

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
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={() => props.createQuestion( question )}
			/>
		</>
	)
} )
CreateMultipleChoice.displayName = "CreateMultipleChoice"

const CreateTrueFalse = React.memo( ( props: CreateQuestionComponentProps ) => {

	const nextQuestionId = useAppSelector( selectNextQuestionId )

	const [ question, setQuestion ] = React.useState( {
		answers: [ "False", "True" ],
		id: nextQuestionId,
		text: "",
		type: QuestionType.TrueFalse,
		correctAnswer: 0
	} as Question )

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
				<Label style={{ fontWeight: "bold" }}>Enter 1 for True or 0 for False</Label>
				<InputGroup 
					value={question.correctAnswer?.toString() || "0"}
					onChange={e => setQuestion( {
						...question,
						correctAnswer: parseInt( e.target.value ) || 0
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

interface CreateGenericProps {
	questionType: QuestionType
	createQuestion: ( question: Question ) => void
}

const CreateGeneric = React.memo( ( props: CreateGenericProps ) => {
	const nextQuestionId = useAppSelector( selectNextQuestionId )

	const [ question, setQuestion ] = React.useState( {
		answers: [],
		id: nextQuestionId,
		text: "",
		type: props.questionType,
		correctAnswer: 0
	} as Question )

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
			<Button 
				text="Add"
				intent={Intent.PRIMARY}
				onClick={() => props.createQuestion( question )}
			/>
		</>
	)
} )
CreateGeneric.displayName = "CreateGeneric"	