// Copyright 2022 under MIT License
import { Button, Intent, TextArea } from "@blueprintjs/core"
import * as React from "react"
import { initializeConnect } from "react-redux/es/components/connect"
import styled from "styled-components"
import { IndentStyle } from "typescript"
import { User } from "../App"
import { useAppSelector } from "../app/hooks"
import { selectFeedbackMap, selectToken } from "../slices/examSlice"
import { CreateExamView } from "./createExamView"
import { ExamView } from "./examView"

/**
 * Style for InstructorView
 */
const StyledInstructorView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * Style for the header elements
 */
const StyledHeaderContainer = styled.div`
	text-align: center;
	width: 100%;
`

/**
 * Style for the top buttons
 */
const StyledButtonContainer = styled.div`
	display: flex;
	justify-content: space-between;
`

/**
 * Style for the list of students
 */
const StyledStudentListContainer = styled.div`
	display: flex;
	flex-direction: column;
`

/**
 * InstructorView Component
 * 
 * This component renders when the Instructor is viewing the application.
 * They are presented with a list of their students that have taken the exam.
 * They can click on a student and view their responses, as well as leave
 * feedback.
 */
export const InstructorView = React.memo( () => {

	const token = useAppSelector( selectToken )

	// State that holds the array of Users
	const [ users, setUsers ] = React.useState( [] as User[] )
	// State that determines which view should be shown to the user
	const [ view, setView ] = React.useState( "studentListView" as View )
	// State that holds any display messages
	const [ displayStatus, setDisplayStatus ] = React.useState( "" )
	// State that holds the selected student's canvasUserId
	const [ canvasUserId, setCanvasUserId ] = React.useState( "" )
	// State that holds the grade for the currently selected student
	const [ grade, setGrade ] = React.useState( 0 )

	// feedbackMap from the store
	const feedbackMap = useAppSelector( selectFeedbackMap )

	/**
	 * Called when a student is clicked - tells the InstructorView
	 * to render that student's responses
	 */
	const handleStudentClick = React.useCallback( ( id: string ) => {
		setDisplayStatus( "" )
		setView( "examView" )
		setCanvasUserId( id )
	}, [] )

	const handleCreateExamClick = React.useCallback( () => {
		setDisplayStatus( "" )
		setView( "createExamView" )

	}, [] )

	/**
	 * Called when the Instructor clicks the "Submit Feedback" button -
	 * updates feedback in the store
	 */
	const handleFeedbackClick = React.useCallback( async () => {
		const data = await fetch( "/api/instructorfeedback", {
			method: "POST",
			body: JSON.stringify(
				Array.from( feedbackMap.values() )
			),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": token,
				"userid": canvasUserId
			}
		} )

		const json = await data.json()
		console.log( json )

		setView( "studentListView" )

		let status = "Feedback Submission Unsuccessful"
		if( json.response == "Valid submission" ) {
			status = "Feedback Submitted"
		}
		setDisplayStatus( status )

	}, [ feedbackMap, canvasUserId ] )

	const handleGradeClick = React.useCallback( async () => {
		const data = await fetch( "/api/grade", {
			method: "POST",
			body: JSON.stringify( { "grade": grade } ),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": token,
				"userid": canvasUserId
			}
		} )

		const json = await data.json()
		console.log( json )

		setView( "studentListView" )

		let status = "Grade Submission Unsuccessful"
		if ( json.response == "Valid submission" ) {
			status = "Grade Submitted"
		}
		console.log( "Entered grade: " + grade )
		setGrade( 0 )
		setDisplayStatus( status )

	}, [ displayStatus, canvasUserId, grade ] )

	/**
	 * Called on render - pulls in the list of students that have taken
	 * the exam
	 */
	React.useEffect( () => {
		const initUsers = async () => {
			const data = await fetch( "/api/examtakers", {
				headers: {
					"token": token
				}
			} )

			const json = await data.json()
			const users: User[] = json.users

			setUsers( users )
		}

		initUsers()
	}, [] )

	// Render the component
	return (
		<StyledInstructorView>
			<StyledHeaderContainer>
				{displayStatus && (
					<h2>{displayStatus}</h2>
				)}	
				<StyledButtonContainer>
					<Button 
						disabled={view === "studentListView"}
						text="Back"
						minimal
						intent={Intent.PRIMARY}
						onClick={() => setView( "studentListView" )}
					/>
					{view === "studentListView" && (
						<Button 
							text="Create Exam"
							onClick={() => handleCreateExamClick()}
						/>
					)}
					{view !== "studentListView" && view !== "createExamView" && (
						<>
							<TextArea
								style={{ maxHeight: "30px", resize: "none" }}
								intent={Intent.PRIMARY}
								onChange={e => setGrade( parseInt( e.target.value ) || 0 )}
							/>
							<Button
								text="Grade"
								minimal
								intent={Intent.PRIMARY}
								onClick={() => handleGradeClick()}
							/>
						</>
					)}
				</StyledButtonContainer>
				{view === "studentListView" && (
					<h3>Student List</h3>
				)}
			</StyledHeaderContainer>
			{view === "createExamView" && (
				<CreateExamView />
			)}
			{view === "studentListView" && (
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
			{view === "examView" && (
				<>
					<ExamView 
						disabled
						feedback={true}
						review={false}
						canvasUserId={canvasUserId}
					/>
					<Button 
						text={"Submit Feedback"}
						onClick={() => handleFeedbackClick()}
						fill
					/>
				</>
			)}
		</StyledInstructorView>
	)
} )
InstructorView.displayName = "InstructorView"

type View = 
	"studentListView" 
  | "examView"
  | "createExamView"