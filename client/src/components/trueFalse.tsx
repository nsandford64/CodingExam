// Copyright 2022 under MIT License
import { InputGroup, Label, Radio, RadioGroup, TextArea } from "@blueprintjs/core"
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
						<TextArea 
							fill
							style={{ marginBottom: 10 }}
							value={question?.text}
							onChange={e => props.editQuestion( {
								...question,
								text: e.target.value
							} )}
							growVertically
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
				disabled={props.disabled}
				onChange={handleChange}
				selectedValue={submission?.value}
			>
				<Radio label="True" value={1} />
				<Radio label="False" value={0} />
			</RadioGroup>
		</StyledTrueFalse>
	)
} )
TrueFalse.displayName = "TrueFalse"