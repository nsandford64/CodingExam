// Copyright 2022 under MIT License
// Taken from Josh Ellis's article: CodeAlong: Multi-Column Drag and Drop in React
import React from "react"
import { Response, ComponentProps, Column, Item } from "../App"
import styled from "styled-components"
import { DragDropContext, DropResult } from "react-beautiful-dnd"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById } from "../slices/examSlice"
import { Label } from "@blueprintjs/core"
import ParsonsColumn from "./parsonsColumn"

/**
 * Style for the ParsonsProblem
 */
const StyledParsonsProblem = styled.div`
	padding: 10px;
`

/**
 * Style for the Columns
 */
const StyledColumns = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
`
/**
 * Parson's Problem Component
 * 
 * This component renders two columns and unsorted blocks of code 
 * for the user to sort correctly
 */
export const ParsonsProblem = React.memo( ( props: ComponentProps ) => {
	
	// Dispatches an event to the store
	const dispatch = useAppDispatch()

	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Response from the Store
	const response = useAppSelector( state => selectResponseById( state, props.questionId ) )

	// Holds the columns and a list of each of their items
	const [ columns, setColumns ] = React.useState( {
		unsorted: {
			id: "unsorted",
			list: [],
			name: "Drag from here"
		},
		sorted: {
			id: "sorted",
			list: [],
			name: "Construct your solution here"
		}
	} as { unsorted: Column, sorted: Column } )

	/**
	 * Called on render - this effect initializes each column's values
	 */
	React.useEffect( () => {
		const items: Item[] = []

		// Map each question answer into an item
		question?.answers.map( ( answer, index ) => {
			const item: Item = {
				id: index,
				text: answer
			}

			items.push( item )
		} )

		let unsortedItems = items
		
		const values = response?.value.toString() || ""
		const sortedItems: Item[] = []

		// Parse out the already sorted values for the sorted column
		for( const char of values ) {
			const index = parseInt( char )

			const item: Item = {
				id: index,
				text: unsortedItems[index].text
			}

			sortedItems.push( item )
		}

		// Remove the sorted items from the unsorted list
		unsortedItems = unsortedItems.filter( item => !sortedItems.includes( item ) )

		// Update the columns state
		setColumns( prevState => ( {
			unsorted: {
				...prevState.unsorted,
				list: unsortedItems
			},
			sorted: {
				...prevState.sorted,
				list: sortedItems
			}
		} ) )
	}, [] )

	/**
	 * Called when an item is dragged and released
	 */
	const onDragEnd = ( { source, destination }: DropResult ) => {
		// Make sure we have a valid destination
		if ( !destination ) return

		// Make sure we're actually moving the item
		if (
			source.droppableId === destination.droppableId 
			&& destination.index === source.index
		) {
			return
		}

		// Set start and end variables
		const start = columns[source.droppableId === "sorted" ? "sorted" : "unsorted"]
		const end = columns[destination.droppableId === "sorted" ? "sorted" : "unsorted"]

		// If start is the same as end, we're in the same column
		if ( start === end ) {
			// Start by making a new list without the dragged item
			const newList = start.list.filter(
				( _, idx: number ) => idx !== source.index
			)

			// Then insert the item at the right location
			newList.splice( destination.index, 0, start.list[source.index] )

			// Then create a new copy of the column object
			const newCol = {
				name: start.name,
				id: start.id,
				list: newList
			}

			// Update the state
			setColumns( prevState => ( {
				...prevState,
				[newCol.id]: newCol
			} ) )

			// If we're in the sorted column, we need to update the response
			if( newCol.id === "sorted" ) {
				let currentResponse = ""
				newCol.list.forEach( item => {
					currentResponse += item.id.toString()
				} )

				const newResponse: Response = {
					questionId: props.questionId,
					isText: true,
					value: currentResponse
				}

				// Update the response in the store
				dispatch( examActions.updateResponse( newResponse ) )
			}
		} 
		else {
			// Filter the start list like before
			const newStartList = start.list.filter(
				( _, idx: number ) => idx !== source.index
			)

			// Create a new start column
			const newStartCol = {
				name: start.name,
				id: start.id,
				list: newStartList
			}

			// Make a new end list array
			const newEndList = end.list

			// Insert the item into the end list
			newEndList.splice( destination.index, 0, start.list[source.index] )

			// Create a new end column
			const newEndCol = {
				name: end.name,
				id: end.id,
				list: newEndList
			}

			// Update the state
			setColumns( prevState => ( {
				...prevState,
				[newStartCol.id]: newStartCol,
				[newEndCol.id]: newEndCol
			} ) )

			let currentResponse = ""
			if ( newStartCol.id === "sorted" ) {
				newStartCol.list.forEach( item => {
					currentResponse += item.id
				} )	
			}
			else {
				newEndCol.list.forEach( item => {
					currentResponse += item.id
				} )
			}

			const newResponse: Response = {
				questionId: props.questionId,
				isText: true,
				value: currentResponse
			}

			// Update the response in the store
			dispatch( examActions.updateResponse( newResponse ) )
		}
	}

	// Render the component
	return (
		<StyledParsonsProblem>
			<Label>{question?.text}</Label>
			<DragDropContext onDragEnd={onDragEnd} >
				<StyledColumns>
					<ParsonsColumn disabled={props.disabled || false} column={columns.unsorted} />
					<ParsonsColumn disabled={props.disabled || false} column={columns.sorted} />
				</StyledColumns>
			</DragDropContext>
		</StyledParsonsProblem>
	)
} 
)
ParsonsProblem.displayName = "ParsonsProblem"