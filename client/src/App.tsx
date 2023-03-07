// Copyright 2022 under MIT License
import React from "react"
import styled from "styled-components"
import { useAppDispatch } from "./app/hooks"
import { examActions } from "./slices/examSlice"
import { InstructorView } from "./views/instructorView"
import { StudentView } from "./views/studentView"

// Interface code to help the client grab the token from the index.html file
declare global {
    interface Window {
        __INITIAL_DATA__:unknown
    }
}

/**
 * Style for the App
 */
const StyledApp = styled.div`
	padding: 25px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * Style to control the width of each View
 */
const StyledViewContainer = styled.div`
`

/**
 * App Component
 * 
 * Main entry to the application - this determines when view should
 * be displayed to the user
 */
export const App = React.memo( () => {
	/**
	 * Selectors
	 */
	// Dispatch an action to the store
	const dispatch = useAppDispatch()

	/**
	 * State
	 */
	// State that determines if the App is in a loading state
	const [ loading, setLoading ] = React.useState( true )
	// State that holds whether the InstructorView or the StudentView should be rendered
	const [ showInstructorView, setShowInstructorView ] = React.useState( false )
	// State that holds whether the exam has already been taken
	const [ taken, setTaken ] = React.useState( false )

	// Stores the JWT token
	//const token = String( window.__INITIAL_DATA__ )

	// Debug instructor token
	const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NpZ25tZW50SUQiOiJleGFtcGxlLWV4YW0iLCJmdWxsTmFtZSI6IkV4YW1wbGUgSW5zdHJ1Y3RvciIsInVzZXJJRCI6ImV4YW1wbGUtaW5zdHJ1Y3RvciIsInJvbGVzIjoiSW5zdHJ1Y3RvciIsImlhdCI6MTY3NTM3NzcxOH0.aH9JLLUHpRRJuhLQ-xmmEF2D1j6pu1iBXD5vP3mJxnE"
	
	// Debug learner token
	//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NpZ25tZW50SUQiOiJleGFtcGxlLWV4YW0iLCJmdWxsTmFtZSI6IkV4YW1wbGUgTGVhcm5lciIsInVzZXJJRCI6ImV4YW1wbGUtbGVhcm5lciIsInJvbGVzIjoiTGVhcm5lciIsImlhdCI6MTY3NTM3NzYzOH0.HFMJmkONPDCcKVwAmfjhz0jllgG14S3yf4HmWjsJkhw"
	
	/**
	 * Effects
	 */
	/*
	Runs on render - determines the user's role based on their JWT token
	*/
	React.useEffect( () => {
		// Prompts the user before letting them reload
		const preventUnload = ( event: BeforeUnloadEvent ) => {
			const message = "You are about to navigate away, and your entered data will not be saved. Are you sure you want to leave?"
			event.preventDefault()
			event.returnValue = message
		}
		window.addEventListener( "beforeunload", preventUnload )

		// Gets the user's role depending on their token
		const getRole = async () => {			
			// Fetch role
			const data = await fetch( "/api/role", {
				headers: {
					"token": token
				}
			} )
			
			const json = await data.json()
			
			setTaken( json.taken )

			if( json.role === "Instructor" ) {
				setShowInstructorView( true )
			}

			setLoading( false )
		}

		// Calls the async function
		getRole()

		// Set the token in the store
		dispatch( examActions.setToken( token ) )
	}, [] )

	/**
	 * Render
	 */
	return (
		<StyledApp>
			{!loading && (
				<StyledViewContainer>
					{showInstructorView && (
						<InstructorView />
					)}
					{!showInstructorView && (
						<StudentView disabled={taken} />
					)}
				</StyledViewContainer>
			)}
		</StyledApp>
	)
} )
App.displayName = "App"

/**
 * Exam Type
 * 
 * This type defines what an exam should look like.
 * Each exam has a list of questions and a list of correctAnswers
 */
export type Exam = {
	questions: Question[],
	correctAnswers: ( string | number )[]
}
	
/*
 * ComponentProps Interface
 * 
 * This interface establishes a common point between each question
 * component.
 * Each component can be disabled and has a questionId
 */
export interface ComponentProps {
	disabled?: boolean // Whether it should be disabled or not
	questionId: number // Specific questionId of the given question
	canvasUserId?: string // The canvasUserId that should be pulled from the DB
	headerShown?: boolean // Whether the header should be shown or not
	editable?: boolean // Whether this component is editable or not
	editQuestion: ( newQuestion: Question ) => void // Function to update a question in the store
}

/**
 * Question Type
 * 
 * This type defines what an exam question should look like.
 * Each question has a unique id, text, type, a correct answer, and an array of answers
 */
export type Question = {
	id: number // Unique id for identification in the database
	text: string // Question text to display to user
	type: QuestionType // Type of the Question
	answers: string[] // Array of answers choices to present to the user
	correctAnswer?: number // Correct answer for the question
	parsonsAnswer?: string // Correct answer for a Parson's Problem
	pointsPossible: number // Number of points this question is worth
}

/**
* Item Type
*
* This type defines what an item is in the Parsons Problem question type
* Each item has an id and text to display
*/ 
export type Item = {
	id: number // Unique id for draggable
	text: string // Text to be displayed in the Item
}

/**
 * Column Type
 * 
 * This type defines what a column is in the Prasons Problem question type
 * Each column has a list of items, a name, and an id
 */
export type Column = {
	list: Item[] // List of Items to be displayed
	name: string // Name to be displayed
	id: string // Unique id to keep track of the column
}

/**
 * Response Type
 * 
 * This type defines what a response from the user should look like.
 * Each response has a questionId, isText flag, and a value
 */
export type Response = {
	questionId: number // Specific questionId that this Response relates to
	isText?: boolean // Whether this is a text Response
	value: number | string // The actual value of the Response 
}

/**
 * Submission Type
 * 
 * This type defines what submission should like for grading purposes
 */
export type Submission = {
	questionId: number // QuestionId in the DB that this submission relates to
	isText?: boolean // Whether this Submission is a text submission or not
	value: number | string // Value of the submission
	canvasUserId?: string // CanvasId of the user that submitted this submission
	fullName?: string // Full name of the user
	scoredPoints?: number // Points that are entered by the instructor
}

/**
 * Feedback Type
 * 
 * This type defines what feedback from the instruction should look like.
 * Each feedback has a questionId and a value.
 */
export type Feedback = {
	questionId: number // QuestionId that this feedback applies to
	value: string // Value of the feedback
}

/**
 * Confidence Type
 * 
 * This type defines what confidence for the student's response should look like.
 * Each confidence has a questionId and a value.
 */
export type Confidence = {
	questionId: number // QuestionId that this confidence rating applies to
	value: number // Value between 0 and 5
}

/**
 * User Type
 * 
 * This type allows a user's name to be associated with it canvasUserId that is stored
 * in the database.
 * Each user has a canvasUserId and a fullName
 */
export type User = {
	canvasUserId: string // UserId that ties this User to Canvas
	fullName: string // Full name of the user
}

/**
 * QuestionType Enum
 * 
 * This enum maps a database QuestionType to a more readable
 * format for development.
 */
export enum QuestionType {
	None = 0,
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3,
	CodingAnswer = 4,
	ParsonsProblem = 5
}

/**
 * LANGUAGE_CHOICES array
 * 
 * This is a list of valid language choices for the instructor to choose
 * from when creating an exam
 */
export const LANGUAGE_CHOICES = [
	"java",
	"python",
	"csharp"
]
