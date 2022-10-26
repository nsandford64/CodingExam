// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import * as React from "react"
import styled from "styled-components"

interface InstructorViewProps {
	token: string
}

const StyledInstructorView = styled.div`

`

export const InstructorView = React.memo( ( props: InstructorViewProps ) => {


	return (
		<h1>Instructor View</h1>
	)
} )
InstructorView.displayName = "InstructorView"