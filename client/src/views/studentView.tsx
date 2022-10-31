// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import * as React from "react"
import styled from "styled-components"
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
	return (
		<StyledStudentView>
			<ExamView 
				token={props.token}
			/>
		</StyledStudentView>
	)
} )
StudentView.displayName = "StudentView"
