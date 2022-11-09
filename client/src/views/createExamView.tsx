// Copyright 2022 under MIT License
import { Button, InputGroup, Intent, Label, MenuItem } from "@blueprintjs/core"
import { Select2 } from "@blueprintjs/select"
import { produceWithPatches } from "immer"
import * as React from "react"
import styled from "styled-components"
import { QuestionType } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { MultipleChoice } from "../components/multipleChoice"
import { examActions, selectQuestionIds } from "../slices/examSlice"
import { QuestionSwitch } from "./examView"

interface CreateExamViewProps {
	token: string
}

const StyledCreateExamView = styled.div`

`

export const CreateExamView = React.memo( ( props: CreateExamViewProps ) => {
	const questionIds = useAppSelector( selectQuestionIds )

	const [ selectedQuestionType, setSelectedQuestionType ] = React.useState( "" )

	return (
		<StyledCreateExamView>
			{questionIds.map( id => (
				<QuestionSwitch 
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
				<QuestionDropdown 
					setSelectedQuestionType={setSelectedQuestionType}
				/> 
			)}
		</StyledCreateExamView>
	)
} )
CreateExamView.displayName = "CreateExamView"

interface QuestionDropdownProps {
	setSelectedQuestionType: ( val: string ) => void
}

const QuestionDropdown = React.memo( ( props: QuestionDropdownProps ) => {
	const items = Object.keys( QuestionType ).filter( item => isNaN( Number( item ) ) )

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

const StyledCreateQuestionSwitch = styled.div`

`

const CreateQuestionSwitch = React.memo( ( props: CreateQuestionSwitchProps ) => {
	const dispatch = useAppDispatch()

	switch( props.questionType ) {
	case "MultipleChoice":
		return (
			<CreateMultipleChoice 
				setSelectedQuestionType={props.setSelectedQuestionType}
			/>
		)
	case "ShortAnswer":
		return null
	case "TrueFalse":
		return null
	case "CodingAnswer":
		return null
	default:
		return null
	}
} )
CreateQuestionSwitch.displayName = "CreateQuestionSwitch"

interface CreateMultipleChoiceProps {
	setSelectedQuestionType: ( val: string ) => void
}

const StyledCreateMultipleChoice = styled.div`

`

const StyledRow = styled.div`
	margin-bottom: 10px;
`

const StyledButtonContainer = styled.div`
	display: flex;
`

const CreateMultipleChoice = React.memo( ( props: CreateMultipleChoiceProps ) => {
	const [ text, setText ] = React.useState( "" )
	const [ answers, setAnswers ] = React.useState( [ "" ] as string[] )
	const [ correctAnswer, setCorrectAnswer ] = React.useState( "" )

	const handleChange = React.useCallback( ( index: number, value: string ) => {
		const newAnswers = [ ...answers ]
		newAnswers[index] = value

		setAnswers( newAnswers )
	}, [ answers ] )

	const handleAdd = React.useCallback( () => {
		const newAnswers = [ ...answers, "" ]
		setAnswers( newAnswers )
	}, [ answers ] )

	const handleRemove = React.useCallback( () => {
		const newAnswers = [ ...answers ]
		newAnswers.pop()

		setAnswers( newAnswers )
	}, [ answers ] )

	return (
		<StyledCreateMultipleChoice>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Question Text</Label>
				<InputGroup 
					value={text}
					onChange={e => setText( e.target.value )}
				/>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Answer Choices</Label>
				{answers.map( ( answer, index ) => (
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
						disabled={answers.length === 4}
					/>
					<Button 
						icon="minus"
						onClick={handleRemove}
						style={{ marginLeft: "auto" }}
						disabled={answers.length === 1}
					/>
				</StyledButtonContainer>
			</StyledRow>
			<StyledRow>
				<Label style={{ fontWeight: "bold" }}>Index of Correct Answer</Label>
				<InputGroup 
					value={correctAnswer}
					onChange={e => setCorrectAnswer( e.target.value )}
				/>
			</StyledRow>
			<Button 
				text="Done"
				intent={Intent.PRIMARY}
				onClick={() => props.setSelectedQuestionType( "" )}
			/>
		</StyledCreateMultipleChoice>
	)
} )
CreateMultipleChoice.displayName = "CreateMultipleChoice"