// Copyright 2022 under MIT License
import { Button, Intent, MenuItem } from "@blueprintjs/core"
import { Select2 } from "@blueprintjs/select"
import * as React from "react"
import styled from "styled-components"
import { QuestionType } from "../App"
import { useAppSelector } from "../app/hooks"
import { selectQuestionIds } from "../slices/examSlice"
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
				<>
					<CreateQuestionSwitch 
						questionType={selectedQuestionType}
					/>
					<Button 
						text="Done"
						intent={Intent.PRIMARY}
					/>
				</>
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
			<Button icon={"plus"} />
		</Select2>
	)
} )
QuestionDropdown.displayName = "QuestionDropdown"

interface CreateQuestionSwitchProps {
	questionType: string
}

const StyledCreateQuestionSwitch = styled.div`

`

const CreateQuestionSwitch = React.memo( ( props: CreateQuestionSwitchProps ) => {
	switch( props.questionType ) {
	case "MultipleChoice":
		return null
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
