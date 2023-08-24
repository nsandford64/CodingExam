// Copyright 2022 under MIT License
import { Button, Label, MenuItem } from "@blueprintjs/core"
import * as React from "react"
import AceEditor from "react-ace"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, LANGUAGE_CHOICES, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"
import { Select2 } from "@blueprintjs/select"
// Language modes for the ACE editor
import "brace/mode/java"
import "brace/mode/csharp"
import "brace/mode/python"
import "brace/theme/sqlserver"
import MDEditor from "@uiw/react-md-editor"

/**
 * Style for the CodingAnswer component
 */
const StyledCodingAnswer = styled.div`
	padding: 10px;
`

/**
 * Style for the editable header
 */
const StyledEditableContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`

/**
 * Style to wrap the Select2 component
 */
const StyledSelectContainer = styled.div`
	margin-bottom: 10px;
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
	 * Also contains functionality to re-render in editing mode
	 */
	return (
		<StyledCodingAnswer>
			{props.headerShown && (
				<>
					{props.editable && (
						<StyledEditableContainer>
							<MDEditor 
								value={question?.text}
								onChange={text => props.editQuestion( {
									...question,
									text: text || ""
								} )}
								style={{ borderRadius: 0, marginBottom: 10, width: "100%" }}
							/>
							<StyledSelectContainer>
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
									onItemSelect={item => props.editQuestion( {
										...question,
										language: item
									} )}
									popoverProps={{ position: "bottom" }}
								>
									<Button text={question.language || "Select language..."}/>
								</Select2>
							</StyledSelectContainer>
						</StyledEditableContainer>
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
