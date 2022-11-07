// Copyright 2022 under MIT License
import { Spinner } from "@blueprintjs/core"
import React from "react"
import { InstructorView } from "./views/instructorView"
import { StudentView } from "./views/studentView"

declare global {
    interface Window {
        __INITIAL_DATA__:unknown
    }
}

/**
 * App Component
 * 
 * Main entry to the application - this determines when view should
 * be displayed to the user
 */
export const App = React.memo( () => {

	// State that determines if the App is in a loading state
	const [ loading, setLoading ] = React.useState( true )
	// State that holds whethere the InstructorView or the StudentView should be rendered
	const [ showInstructorView, setShowInstructorView ] = React.useState( false )
	// State that holds whether the exam has already been taken
	const [ taken, setTaken ] = React.useState( false )


	// Stores the JWT token
	const token = String( window.__INITIAL_DATA__ )

	// Debug instructor token
	//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NpZ25tZW50SUQiOiIwMWNmMTBjNS1mNWQzLTQ2NmUtYjcxNi01M2YyYjBiY2QzYjQiLCJ1c2VySUQiOiIyYjdhMmVhOWYyOGJjMzEyNzUzNjQwYjBjMWNjNTM3ZmE4NWM1YTQ5Iiwicm9sZXMiOiJJbnN0cnVjdG9yIiwiaWF0IjoxNjY2OTcyODM4fQ.n9qkthHs0HhonpjD4yFNA7RLRqrzK1lavWzvBIGn_y8"
	
	// Debug learner token
	// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NpZ25tZW50SUQiOiIwMWNmMTBjNS1mNWQzLTQ2NmUtYjcxNi01M2YyYjBiY2QzYjQiLCJ1c2VySUQiOiIyYjdhMmVhOWYyOGJjMzEyNzUzNjQwYjBjMWNjNTM3ZmE4NWM1YTQ5Iiwicm9sZXMiOiJMZWFybmVyIiwiaWF0IjoxNjY3NTA3ODM0fQ.SIpwxp9p6SXHfjDcDHkYO8cp0jLAEOnEVCxEeDrvCWs"
	
	/**
	 * Runs on render - determines the user's role based on their JWT token
	 */
	React.useEffect( () => {
		// Gets the user's role depending on their token
		const getRole = async () => {			
			// Fetch role
			const data = await fetch( "http://localhost:9000/api/role", {
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
	}, [] )

	// Render the component
	return (
		<>
			{loading && (
				<Spinner 
					size={50}
				/>
			)}
			{!loading && (
				<>
					{showInstructorView && (
						<InstructorView token={token} />
					)}
					{!showInstructorView && (
						<StudentView disabled={taken} token={token} />
					)}
				</>
			)}
		</>
	)
} )
App.displayName = "App"

/**
 * Question Type
 * 
 * This type defines what an exam question should look like.
 * Each question has a unique id, text, type, and an array of answers
 */
export type Question = {
	id: number // Unique id for identification in the database
	text: string // Question text to display to user
	type: QuestionType // Type of the Question
	answers: string[] // Array of answers choices to present to the user
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
 * QuestionType Enum
 * 
 * This enum maps a database QuestionType to a more readable
 * format for development.
 */
export enum QuestionType {
	MultipleChoice = 1,
	ShortAnswer = 2,
	TrueFalse = 3,
	CodingAnswer = 4
}
