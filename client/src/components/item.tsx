// Copyright 2022 under MIT License

import React from "react"
import { Draggable } from "react-beautiful-dnd"
import styled from "styled-components"

/** Interface for the Column objects containing the text of the code
*   fragment and the index of where the item started from.  
*/
interface ItemProps {
  text: string
  index: number
}

/** 
 * Style for the Item component for the Column component for the 
 * Parson's Problem component
*/
const StyledItem = styled.div`
	background-color: #eee;
	border-radius: 4;
	padding: 4px 8px;
	transition: background-color .8s ease-out;
	margin-top: 8;

	:hover {
		background-color: #fff;
		transition: background-color .1s ease-in;
	}
`

// Renders the Item component for the Column component for the Parson's Problems component
const Item: React.FC<ItemProps> = ( { text, index } ) => {
	return (
		<Draggable draggableId={text} index={index}>
			{provided => (
				<StyledItem
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					{text}
				</StyledItem>
			)}
		</Draggable>
	)
}

export default Item
