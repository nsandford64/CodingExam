// Copyright 2022 under MIT License
import { InputGroup, Label } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"
// Language modes for the ACE editor
import "brace/mode/java"
import "brace/mode/csharp"
import "brace/mode/python"
import "brace/theme/sqlserver"

/**
 * Style for the CodingAnswer component
 */
const StyledCodingAnswer = styled.div`
	padding: 10px;
`

/**
 * CodingAnswer Component
 * 
 * This component renders a text-editor for the user to write
 * code in
 */
export const CodingAnswer = React.memo( ( props: ComponentProps ) => {
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
	//Called whenever the code editor text is changed -- Updates the store with a new Response object
	const handleChange = React.useCallback( ( value: string ) => {
		const newSubmission: Submission = {
			questionId: props.questionId,
			value: value,
			isText: true,
		}

		// Updates the response in the store
		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )

	/**
	 * Render
	 */
	return (
		<StyledCodingAnswer>
			{props.headerShown && (
				<>
					{props.editable && (
						<InputGroup 
							fill
							style={{ marginBottom: 10 }}
							value={question?.text}
							onChange={e => props.editQuestion( {
								...question,
								text: e.target.value
							} )}
						/>
					)}
					{!props.editable && (
						<Label>
							<ReactMarkdown>
								{question.text}	
							</ReactMarkdown>
						</Label>
					)}
				</>				
			)}
			<AceEditor
				readOnly={props.disabled}
				mode={question.language}
				theme="sqlserver"
				onChange={handleChange}
				name="editor"
				defaultValue={`${submission?.value || ""}`}
				width="100%"
			/>
		</StyledCodingAnswer>
	)
} )
CodingAnswer.displayName = "CodingAnswer"
