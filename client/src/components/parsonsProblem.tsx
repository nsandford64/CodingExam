// Copyright 2022 under MIT License
// Code used from Josh Ellis's example: CodeAlong: Multi-Column Drag and Drop in React

import React, { useState } from "react"
import { Response, ComponentProps } from "../App"
import styled from "styled-components"
import Column from "./column"
import { DragDropContext, DropResult } from "react-beautiful-dnd"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"

/**
 * Style for the Columns
 */
/*
* Style for the Parson's Problem component
*/
const StyledColumns = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	margin: 10vh auto;
	width: 80%;
	height: 80vh;
	gap: 8px;
`
/**
 * Parson's Problem Component
 * 
 * This component renders two columns and unsorted fragments of code 
 * for the user to sort in the correct order
 */
export const ParsonsProblem = React.memo( ( props: ComponentProps ) => {
	
	/* TODO: Integrate with Redux
	// Dispatches an event to the store
	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )
	*/
	
	/* The initial values of the unsorted and sorted columns 
	*  TODO: Make the list pull from the database, once redux is implemented
	*/
	const initialColumns = {
		unsorted: {
			id: "unsorted",
			list: [ "for(int i; i < 4; i++) {", "print(Hello World);", "}" ]
		},
		sorted: {
			id: "sorted",
			list: []
		}
	}
	const [ columns, setColumns ] = useState( initialColumns )

	/**
	 * Called whenever the user drags one of the code fragments to a
	 * different index within a column.  
	 */
	const onDragEnd = ( { source, destination }: DropResult ) => {
		// Make sure we have a valid destination
		if ( destination === undefined || destination === null ) return null

		// Make sure we're actually moving the item
		if ( source.droppableId === destination.droppableId && destination.index === source.index ){
			return null
		}

		// Set start and end column variables
		const start = columns[source.droppableId]
		const end = columns[destination.droppableId]

		// If start column is the same as end, we're in the same column
		if ( start === end ) {

			// Move the item within the list
			// Start by making a new list without the dragged item
			const newList = start.list.filter(
				( _, idx: number ) => idx !== source.index
			)

			// Then insert the item at the right location
			newList.splice( destination.index, 0, start.list[source.index] )

			// Then create a new copy of the column object
			const newCol = {
				id: start.id,
				list: newList
			}

			// Update the state
			setColumns( state => ( { ...state, [newCol.id]: newCol } ) )

			return null

		} else {

			// If start column is different from end, we need to update multiple columns
			// Filter the start list like before
			const newStartList = start.list.filter(
				( _, idx: number ) => idx !== source.index
			)

			// Create a new start column
			const newStartCol = {
				id: start.id,
				list: newStartList
			}

			// Make a new end list array
			const newEndList = end.list

			// Insert the item into the end list
			newEndList.splice( destination.index, 0, start.list[source.index] )

			// Create a new end column
			const newEndCol = {
				id: end.id,
				list: newEndList
			}

			// Update the state
			setColumns( state => ( {
				...state,
				[newStartCol.id]: newStartCol,
				[newEndCol.id]: newEndCol
			} ) )

			const newResponse: Response = {
				questionId: props.questionId,
				value: parseInt( destination.droppableId )
			}

			/*TODO: Integrate with Redux*/// dispatch( examActions.updateResponse( newResponse ) )

			return null
		}
	}

	// Renders the component
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<StyledColumns>
				{Object.values( columns ).map( col => (
					<Column col={col} key={col.id} />
				) )}
			</StyledColumns>
		</DragDropContext>
	)
}
)

ParsonsProblem.displayName = "ParsonsProblem"