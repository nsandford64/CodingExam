// Copyright 2022 under MIT License

import React from "react"
import Item from "./item"
import { Droppable } from "react-beautiful-dnd"
import styled from "styled-components"

/** Interface for the Column objects containing the id and a list of 
*	strings containing the code fragments.
*/
interface ColumnProps {
  col: {
    id: string;
    list: string[];
  };
}

/**
 * Style for the Column component for Parson's Problem component
 */
const StyledColumn = styled.div`
	padding: 24px 0;
	display: flex;
	flex-direction: column;
	margin-top: 8;

	h2: {
		margin: 0;
		padding: 0 16px;
	}
    `
/** 
 * Style for the List component for the Column component for the Parson's
 * Problem component.
*/
const StyledList = styled.div`
	background-color: #ddd;
	border-radius: 8;
	padding: 16;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	margin-top: 8;
`

// Renders the Column component to the Parson's Problems component
const Column: React.FC<ColumnProps> = ( { col: { list, id } } ) => {
	return (
		<Droppable droppableId={id}>
			{( provided ) => (
				<StyledColumn>
					<h2>{id}</h2>
					<StyledList {...provided.droppableProps} ref={provided.innerRef}>
						{list.map( ( text, index ) => (
							<Item key={text} text={text} index={index} />
						) )}
						{provided.placeholder}
					</StyledList>
				</StyledColumn>
			)}
		</Droppable>
	)
}

export default Column
