// Copyright 2022 under MIT License
import React from "react"
import ColumnItem from "./columnItem"
import { Droppable } from "react-beautiful-dnd"
import styled from "styled-components"
import { Colors, Label } from "@blueprintjs/core"
import { Column } from "../App"

/**
 * Props for ParsonsColumn
 */
interface ParsonsColumnProps {
	column: Column
	disabled?: boolean
}

/**
 * Style for the Column component for Parson's Problem component
 */
const StyledParsonsColumn = styled.div`
	display: flex;
	flex-direction: column;
`

/** 
 * Style for the List component for the Column component for the Parson's
 * Problem component.
*/
const StyledList = styled.div`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	border: 1px solid ${Colors.BLACK};
	border-radius: 2px;
`

/**
 * ParsonsColumn Component
 * 
 * This component renders a column in a ParsonsProblem. Each column
 * has ColumnItems that can be drug back and forth
 */
const ParsonsColumn = React.memo( ( props: ParsonsColumnProps ) => {

	// Render the component
	return (
		<Droppable droppableId={props.column.id}>
			{( provided ) => (
				<StyledParsonsColumn>
					<Label>{props.column.name}</Label>
					<StyledList {...provided.droppableProps} ref={provided.innerRef}>
						{props.column.list.map( ( item, index ) => (
							<ColumnItem 
								key={item.id} 
								item={item} 
								index={index} 
								disabled={props.disabled}
							/>
						) )}
						{provided.placeholder}
					</StyledList>
				</StyledParsonsColumn>
			)}
		</Droppable>
	)
} )
ParsonsColumn.displayName = "ParsonsColumn"

export default ParsonsColumn
