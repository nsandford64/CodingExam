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
	width: 600px;
`

/**
 * App Component
 * 
 * Main entry to the application - this determines when view should
 * be displayed to the user
 */
export const App = React.memo( () => {

	const dispatch = useAppDispatch()

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
	 * Runs on render - determines the user's role based on their JWT token
	 */
	React.useEffect( () => {
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

	// Render the component
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
	disabled?: boolean
	questionId: number // Specific questionId of the given question
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
	parsonsAnswer?: string
}

/**
* Item Type
*
* This type defines what an item is in the Parsons Problem question type
* Each item has an id and text to display
*/ 
export type Item = {
	id: number
	text: string
}

/**
 * Column Type
 * 
 * This type defines what a column is in the Prasons Problem question type
 * Each column has a list of items, a name, and an id
 */
export type Column = {
	list: Item[]
	name: string
	id: string
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
 * Feedback Type
 * 
 * This type defines what feedback from the instruction should look like.
 * Each feedback has a questionId and a value.
 */
export type Feedback = {
	questionId: number
	value: string
}

/**
 * Confidence Type
 * 
 * This type defines what confidence for the student's response should look like.
 * Each confidence has a questionId and a value.
 */
export type Confidence = {
	questionId: number
	value: number
}

/**
 * User Type
 * 
 * This type allows a user's name to be associated with it canvasUserId that is stored
 * in the database.
 * Each user has a canvasUserId and a fullName
 */
export type User = {
	canvasUserId: string
	fullName: string
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

export const LANGUAGE_CHOICES = [
	"java",
	"python",
	"csharp"
]
