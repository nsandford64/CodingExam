// Copyright 2022 under MIT License
// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { User } from "../App"
import { useAppSelector } from "../app/hooks"
import { store } from "../app/store"
import { selectFeedbackMap } from "../slices/examSlice"
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
	const feedbackMap = useAppSelector( selectFeedbackMap )

	const handleStudentClick = React.useCallback( ( id: string ) => {
		setShowStudentList( false )
		setCanvasUserId( id )
	}, [] )

	const handleFeedbackClick = React.useCallback( async () => {
		const data = await fetch( "http://localhost:9000/api/instructorfeedback", {
			method: "POST",
			body: JSON.stringify(
				Array.from( feedbackMap.values() )
			),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": props.token,
				"userid": canvasUserId
			}
		} )

		const json = await data.json()
		console.log( json )
		setShowStudentList( true )

	}, [ feedbackMap, canvasUserId ] )

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
					disabled={showStudentList}
					text="Back"
					minimal
					intent={Intent.PRIMARY}
					onClick={() => setShowStudentList( true )}
				/>
				<h3>Student List</h3>
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
							alignText="left"
						/>
					) )}
				</StyledStudentListContainer>
			)}
			{!showStudentList && (
				<>
					<ExamView 
						disabled
						feedback={true}
						canvasUserId={canvasUserId}
						token={props.token}
					/>
					<Button 
						text={"Submit Feedback"}
						onClick={() => handleFeedbackClick()}
					/>
				</>
			)}
		</StyledInstructorView>
	)
} )
InstructorView.displayName = "InstructorView"