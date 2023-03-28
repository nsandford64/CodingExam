// Copyright 2022 under MIT License
import { Label, TextArea } from "@blueprintjs/core"
import MDEditor from "@uiw/react-md-editor"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"

/**
 * Style for the ShortAnswer component
 */
const StyledShortAnswer = styled.div`
	padding: 10px;
`

/**
 * ShortAnswer Component
 * 
 * This component displays a short answer question to the user - they
 * are presented with a question and a text box area
 */
export const ShortAnswer = React.memo( ( props: ComponentProps ) => {
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
	//Called when a new bubble is selected - updates the store with a new Response object
	const handleChange = React.useCallback( ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
		const newSubmission: Submission = {
			questionId: props.questionId,
			isText: true,
			value: e.target.value,
		}

		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )
	
	/**
	 * Render
	 * Also contains code to re-render in editing mode
	 */
	return (
		<StyledShortAnswer>
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
			<TextArea 
				disabled={props.disabled}
				large
				onChange={handleChange}
				value={submission?.value} 
				fill
				growVertically
				style={{ minHeight: "100px", resize: "none" }}
			/>
		</StyledShortAnswer>
	)
} )
ShortAnswer.displayName = "ShortAnswer"