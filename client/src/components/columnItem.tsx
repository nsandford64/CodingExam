// Copyright 2022 under MIT License
import { Colors } from "@blueprintjs/core"
import React from "react"
import { Draggable } from "react-beautiful-dnd"
import styled from "styled-components"
import { Item } from "../App"

/** 
 * Interface for the Column objects containing the text of the code 
 * fragment and the index of where the item started from.  
 */
interface ColumnItemProps {
	item: Item
	index: number
	disabled?: boolean
}

/** 
 * Style for the Item component for the Column component for the 
 * Parson's Problem component
*/
const StyledItem = styled.div`
	border-radius: 2px;
	padding: 5px 10px;
	margin-bottom: 10px;
	background-color: ${Colors.WHITE};
	background-color: ${Colors.LIGHT_GRAY4};
	font-family: monospace;

	:hover {
		background-color: ${Colors.LIGHT_GRAY5};
		transition: background-color 0.1s ease-in;
	}
`

/**
 * ColumnItem Component
 * 
 * This components represents a draggable item in the Parson's Problem component.
 * The user can click and drag these components between columns to 
 * construct their answer.
 */
const ColumnItem = React.memo( ( props: ColumnItemProps ) => {
	/**
	 * Render
	 */
	return (
		<Draggable 
			draggableId={props.item.text} 
			index={props.index} 
			isDragDisabled={props.disabled}
		>
			{provided => (
				<StyledItem
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					{props.item.text}
				</StyledItem>
			)}
		</Draggable>
	)
} )
ColumnItem.displayName = "ColumnItem"

export default ColumnItem