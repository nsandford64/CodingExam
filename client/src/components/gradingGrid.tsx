// Copyright 2022 under MIT License
import { Colors, InputGroup, Label, TextArea } from "@blueprintjs/core"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { Response, ComponentProps, Question, Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectResponseById, selectToken } from "../slices/examSlice"

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
 * for a given question
 */
export const GradingGrid = React.memo( ( props: GradingGridProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Token from the store
	const token = useAppSelector( selectToken )

	/**
	 * State
	 */
	const [ submissions, setSubmissions ] = React.useState( [] as Submission[] )

	const updateSubmission = React.useCallback( ( index: number, score: number ) => {
		const newSubmissions = [ ...submissions ]
		newSubmissions[index] = { ...newSubmissions[index], scoredPoints: score}

		setSubmissions( newSubmissions )
	}, [ submissions ] )

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

	// Render the component
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
