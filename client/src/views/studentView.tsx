// Copyright 2022 under MIT License
import * as React from "react"
import styled from "styled-components"
import { useAppSelector } from "../app/hooks"
import { selectResponseState } from "../slices/examSlice"
import { ExamView } from "./examView"

/**
 * Props for StudentView
 */
interface StudentViewProps {
	token: string
}

/**
 * Style for StudentView
 */
const StyledStudentView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * StudentView Component
 * 
 * This component renders an ExamView and allows them to take 
 * the exam
 */
export const StudentView = React.memo( ( props: StudentViewProps ) => {

	// responseState from the store
	const responseState = useAppSelector( selectResponseState )

	// Render the component
	return (
		<StyledStudentView>
			<h1>{responseState}</h1>
			<ExamView 
				token={props.token}
			/>
		</StyledStudentView>
	)
} )
StudentView.displayName = "StudentView"

