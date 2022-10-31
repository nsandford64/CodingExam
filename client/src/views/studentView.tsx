// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import * as React from "react"
import styled from "styled-components"
import { useAppSelector } from "../app/hooks"
import { selectResponseState } from "../slices/examSlice"
import { ExamView } from "./examView"

interface StudentViewProps {
	token: string
}

const StyledStudentView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const StudentView = React.memo( ( props: StudentViewProps ) => {
	const responseState = useAppSelector( selectResponseState )

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
