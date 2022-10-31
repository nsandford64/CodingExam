// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { User } from "../App"
import { ExamView } from "./examView"

interface InstructorViewProps {
	token: string
}

const StyledInstructorView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

const StyledHeaderContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px;
`

const StyledStudentListContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const InstructorView = React.memo( ( props: InstructorViewProps ) => {

	const [ users, setUsers ] = React.useState( [] as User[] )
	const [ showStudentList, setShowStudentList ] = React.useState( true )
	const [ canvasUserId, setCanvasUserId ] = React.useState( "" )

	const handleStudentClick = React.useCallback( ( id: string ) => {
		setShowStudentList( false )
		setCanvasUserId( id )
	}, [] )

	React.useEffect( () => {
		const initUsers = async () => {
			const data = await fetch( "http://localhost:9000/api/examtakers", {
				headers: {
					"token": props.token
				}
			} )

			const json = await data.json()
			const users: User[] = json.users

			setUsers( users )
		}

		initUsers()
	}, [] )

	return (
		<StyledInstructorView>
			<StyledHeaderContainer>
				<Button 
					text="Back"
					minimal
					intent={Intent.PRIMARY}
					onClick={() => setShowStudentList( true )}
				/>
				<p>InstructorView</p>
			</StyledHeaderContainer>
			{showStudentList && (
				<StyledStudentListContainer>
					{users.map( user => (
						<Button 
							key={user.canvasUserId}
							text={user.fullName}
							minimal
							intent={Intent.NONE}
							onClick={() => handleStudentClick( user.canvasUserId )}
						/>
					) )}
				</StyledStudentListContainer>
			)}
			{!showStudentList && (
				<ExamView 
					disabled
					feedback={true}
					canvasUserId={canvasUserId}
					token={props.token}
				/>
			)}
		</StyledInstructorView>
	)
} )
InstructorView.displayName = "InstructorView"