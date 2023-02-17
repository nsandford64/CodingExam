// Copyright 2022 under MIT License
import { Colors, InputGroup } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Submission } from "../App"
import { useAppSelector } from "../app/hooks"
import { selectQuestionById, selectToken } from "../slices/examSlice"

/**
 * Props for the GradingGrid component
 */
interface GradingGridProps {
	questionId: number
}

/**
 * Style for the GradingGrid component
 */
const StyledGradingGrid = styled.div`
	display: grid;

	& table, th, td {
		border: 1px solid ${Colors.LIGHT_GRAY3};
		border-collapse: collapse;
	}

	& td {
		padding: 5px;
	}
`

/**
 * GradingGrid Component
 * 
 * This component displays a grid of students and their responses
 * for a given question. It also allows the Instructor to 
 * submit grades to the database for each question and student
 */
export const GradingGrid = React.memo( ( props: GradingGridProps ) => {
	/**
	 * Selectors
	 */
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Token from the store
	const token = useAppSelector( selectToken )

	/**
	 * State
	 */
	// The array of submissions stored in the database that need to be updated and displayed
	const [ submissions, setSubmissions ] = React.useState( [] as Submission[] )

	/**
	 * Callbacks
	 */
	// Called whenever a new score is inputted - updates submissions to reflect the change
	const updateSubmission = React.useCallback( ( index: number, score: number ) => {
		const newSubmissions = [ ...submissions ]
		newSubmissions[index] = { ...newSubmissions[index], scoredPoints: score}

		setSubmissions( newSubmissions )
	}, [ submissions ] )

	// Updates the submissions in the database
	const updateDatabase = React.useCallback( async () => {
		await fetch( "/api/instructor/grade", {
			method: "POST",
			body: JSON.stringify( submissions ),
			// Adding headers to the request
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": token
			}
		} )
	}, [ submissions ] )

	/**
	 * Effects
	 */
	// Called whenever the question changes - populates the submissions state from the database
	React.useEffect( () => {
		const fetchSubmissions = async () => {
			const res = await fetch( "/api/instructor/responsesfromquestion", {
				// Adding headers to the request
				headers: {
					"Content-type": "application/json; charset=UTF-8",
					"token": token,
					"questionId": props.questionId.toString()
				}
			} )
			const json = await res.json()
			const newSubmissions: Submission[] = json.submissions

			setSubmissions( newSubmissions )
		}

		fetchSubmissions()
	}, [ question ] )

	/**
	 * Render
	 */
	return (
		<StyledGradingGrid>
			<table>
				<thead>
					<tr>
						<th>Student</th>
						<th>Submission</th>
						<th>Grade</th>
					</tr>
				</thead>
				<tbody>
					{submissions.map( ( submission, index ) => (
						<tr key={index}>
							<td>{submission.fullName}</td>
							<td>{submission.isText ? submission.value : ( question?.answers ? question?.answers[submission.value as number] : "" )}</td>
							<td>
								<InputGroup 
									value={submission.scoredPoints.toString()}
									onChange={e => updateSubmission( index, parseInt( e.target.value ) )}
									onBlur={updateDatabase}
								/>
							</td>
						</tr>
					) )}
				</tbody>
			</table>
		</StyledGradingGrid>
	)
} )
GradingGrid.displayName = "GradingGrid"
