// Copyright 2022 under MIT License
import { Button, Colors, Icon, InputGroup, Label, Radio } from "@blueprintjs/core"
import MDEditor from "@uiw/react-md-editor"
import * as React from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { ComponentProps, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionByUserIdAndQuestionId } from "../slices/examSlice"

/**
 * Style for the MultipleChoice component
 */
const StyledMultipleChoice = styled.div`
	padding: 10px;
`

/**
 * Style for the container while adding an answer
 */
const StyledAnswerInputContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`

/**
 * MultipleChoice Component
 * 
 * This component renders a multiple choice question for the user.
 * They can select any one option from a list of answer choices
 */
export const MultipleChoice = React.memo( ( props: ComponentProps ) => {
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
	 * State
	 */
	// State for whether an answer is being added or not
	const [ addingAnswer, setAddingAnswer ] = React.useState( false )
	// State that holds the current editing answer index
	const [ editingAnswerIndex, setEditingAnswerIndex ] = React.useState( -1 )
	// Answer that is being added
	const [ answer, setAnswer ] = React.useState( "" )
	// State that holds the answer that is currently being edited
	const [ editingAnswer, setEditingAnswer ] = React.useState( "" )

	/**
	 * Callbacks
	 */
	/*
	Called when the user selects one of the radio buttons - it
	calls the updateResponse delegate to update the state in the App
	to reflect their choice.
	*/
	const handleChange = React.useCallback( ( value: number ) => {
		// Create a new Submission object
		const newSubmission: Submission = {
			value,
			questionId: props.questionId
		}

		// Update the response in the store
		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [] )

	// Called when an answer is added - updates the question in the store
	const handleAddAnswer = React.useCallback( () => {
		props.editQuestion( {
			...question,
			answers: [ ...question.answers, answer ]
		} )

		setAddingAnswer( false )
	}, [ question, answer ] )

	// Called when an answer is removed - updates the question in the store
	const handleRemoveAnswer = React.useCallback( ( index: number ) => {
		props.editQuestion( {
			...question,
			answers: question?.answers.filter( ( _, answerIndex ) => answerIndex !== index )
		} )

		setEditingAnswerIndex( -1 )
	}, [ question ] )

	/**
	 * The following are functions used for the drag and drop reordering for the multiple choise answers
	 * Handles when an answer is reordered
	 */
	const reOrder = React.useCallback( ( arr: string[], startIndex: number, endIndex: number ) => {
		const newArr = arr.slice()
		const [ removed ] = newArr.splice( startIndex, 1 )
		newArr.splice( endIndex, 0, removed )

		return newArr
	}, [] )

	// Handles when dragging an answer ends
	const onDragEnd = React.useCallback( ( result: DropResult ) => {
		if ( !result.destination ) {
			return
		}

		const newAnswers = reOrder( question.answers, result.source.index, result.destination.index )

		props.editQuestion( { ...question, answers: newAnswers } )
	}, [ question ] )

	/**
	 * Effects
	 */
	React.useEffect( () => {
		setAddingAnswer( false )
		setEditingAnswerIndex( -1 )
	}, [ props.editable ] )

	React.useEffect( () => {
		setAnswer( "" )
	}, [ addingAnswer ] )

	/**
	 * Render
	 * Also contains functionality to re-render in editing mode and dragging answers
	 */
	return (
		<StyledMultipleChoice>
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
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="droppable">
					{( provided ) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							{question.answers.map( ( choice, index ) => (
								<Draggable isDragDisabled={props.disabled && ( !props.editable || editingAnswerIndex >= 0 )} key={choice} draggableId={choice} index={index}>
									{( provided, snapshot ) => (
										<StyledAnswerInputContainer
											ref={provided.innerRef}
											{...provided.draggableProps}
											style={{ 
												...provided.draggableProps.style,
												backgroundColor: snapshot.isDragging ? "white" : undefined,
												marginBottom: props.editable ? "10px" : undefined 
											}}
										>
											{props.editable && (
												<Icon 
													icon="drag-handle-vertical"
													size={24}
													color={Colors.GRAY4}
													style={{ marginRight: 10 }}
													{...provided.dragHandleProps}
												/>
											)}
											<Radio
												key={index}
												disabled={props.disabled}
												value={index}
												label={editingAnswerIndex === index ? undefined : choice}
												checked={index === submission?.value}
												onChange={() => handleChange( index )}
												style={{ marginBottom: props.editable ? 0 : undefined }}
											/>
											{editingAnswerIndex === index && (
												<>
													<InputGroup 
														fill
														value={editingAnswer}
														onChange={e => setEditingAnswer( e.target.value )}
													/>
													<Button 
														icon="tick" 
														style={{ marginLeft: 10 }} 
														intent="success"
														onClick={() => {
															props.editQuestion( {
																...question,
																answers: question.answers.map( ( oldAnswer, answerIndex ) => {
																	if ( answerIndex === index ) {
																		return editingAnswer
																	}

																	return oldAnswer
																} )
															} )

															setEditingAnswerIndex( -1 )
														}}
													/>
												</>
											)}
											{props.editable && editingAnswerIndex === -1 && (
												<>
													<Button 
														icon="edit"
														onClick={() => {
															setEditingAnswer( question.answers[index] )
															setEditingAnswerIndex( index )
														}}
														style={{ marginLeft: 10 }}
													/>
													<Button 
														icon="cross" 
														style={{ marginLeft: 10 }} 
														intent="danger"
														onClick={() => handleRemoveAnswer( index )}
													/>
												</>
											)}
										</StyledAnswerInputContainer>
									)}
								</Draggable>
							) )}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
			{props.editable && !addingAnswer && question?.answers.length < 4 && (
				<Button 
					icon="plus"
					onClick={() => setAddingAnswer( true )}			
				/>
			)}
			{props.editable && addingAnswer && (
				<StyledAnswerInputContainer>
					<InputGroup 
						fill
						value={answer}
						onChange={e => setAnswer( e.target.value )}
					/>
					<Button 
						icon="cross"
						intent="danger"
						style={{ marginLeft: 10 }}
						onClick={() => setAddingAnswer( false )}
					/>
					<Button 
						icon="tick"
						intent="success"
						style={{ marginLeft: 10 }}
						onClick={handleAddAnswer}
					/>
				</StyledAnswerInputContainer>
			)}
		</StyledMultipleChoice>
	)
} )
MultipleChoice.displayName = "MultipleChoice"
