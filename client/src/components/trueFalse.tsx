// Copyright 2022 under MIT License
import { Checkbox, Label, Radio, RadioGroup } from "@blueprintjs/core"
import MDEditor from "@uiw/react-md-editor"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"

/**
 * Style for the TrueFalse component
 */
const StyledTrueFalse = styled.div`
	padding: 10px;
`

/**
 * Style for a radio row
 */
const RadioRow = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`

/**
 * TrueFalse Component
 * 
 * This component presents the user with a statement, and then they
 * must select between true or false
 */
export const TrueFalse = React.memo( ( props: ComponentProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	const dispatch = useAppDispatch()
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Submission from the store
	const submission = useAppSelector( state => selectSubmissionByUserIdAndQuestionId( state, props.questionId, props.canvasUserId ) )

	/**
	 * Callbacks
	 */
	// Called when the user selects between true or false - updates the App's responsesMap
	const handleChange = React.useCallback( ( e: React.FormEvent<HTMLInputElement> ) => {
		const value = ( e.target as HTMLInputElement ).value
		const newSubmission: Submission = {
			questionId: props.questionId,
			value: parseInt( value )
		}

		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )

	/**
	 * Render
	 * Also contains code to re-render in editing mode
	 */
	return (
		<StyledTrueFalse>
			{props.headerShown && (
				<>
					{props.editable && (
						<MDEditor 
							value={question?.text}
							onChange={text => props.editQuestion( {
								...question,
								text: text || ""
							} )}
							style={{ borderRadius: 0, marginBottom: 10 }}
						/>
					)}
					{!props.editable && (
						<Label>
							<ReactMarkdown>
								{question ? question?.text : ""}
							</ReactMarkdown>
						</Label>
					)}
				</>				
			)}
			<RadioGroup
				onChange={handleChange}
				selectedValue={submission?.value}
			>
				<RadioRow>
					<Radio label="True" value={1} disabled={props.disabled} />
					<Checkbox 
						style={{ marginLeft: 10 }}
						checked={question.correctAnswer === 1}
						onChange={() => props.editQuestion( {
							...question,
							correctAnswer: 1
						} )}
					/>
				</RadioRow>
				<RadioRow>
					<Radio label="False" value={0} disabled={props.disabled} />
					<Checkbox 
						style={{ marginLeft: 10 }}
						checked={question.correctAnswer === 0}
						onChange={() => props.editQuestion( {
							...question,
							correctAnswer: 0
						} )}
					/>
				</RadioRow>
			</RadioGroup>
		</StyledTrueFalse>
	)
} )
TrueFalse.displayName = "TrueFalse"