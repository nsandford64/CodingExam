// Copyright 2022 under MIT License
import { Colors, InputGroup, Tag, TextArea } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Submission } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectQuestionById, selectSubmissionsByQuestionId, selectToken } from "../slices/examSlice"
import { QuestionSwitch } from "../views/examView"

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
	margin-left: 10px;
	flex: 1;

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
	// Dispatches an action to the store
	const dispatch = useAppDispatch()
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( state, props.questionId ) )
	// Token from the store
	const token = useAppSelector( selectToken )
	// Submissions from the store
	const submissions = useAppSelector( state => selectSubmissionsByQuestionId( state, props.questionId ) )

	/**
	 * Callbacks
	 */
	// Called whenever a new score is inputted - updates submissions to reflect the change
	const updateGradeSubmission = React.useCallback( ( submission: Submission, score: number ) => {
		const newSubmission: Submission = {
			...submission,
			scoredPoints: score
		}

		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [ submissions ] )

	
	const updateFeedbackSubmission = React.useCallback( ( submission: Submission, feedback: string ) => {
		const newSubmission: Submission = {
			...submission,
			feedback: feedback
		}

		dispatch( examActions.updateSubmission( newSubmission ) )
	}, [ submissions ] )

	// Updates the submissions in the database
	const updateDatabase = React.useCallback( async () => {
		await fetch( "/api/instructor/gradesubmission", {
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
	 * Render
	 */
	return (
		<StyledGradingGrid>
			<h3>{question?.text}</h3>
			<table>
				<thead>
					<tr>
						<th>Student</th>
						<th>Submission</th>
						<th>Feedback</th>
						<th>Grade</th>
					</tr>
				</thead>
				<tbody>
					{submissions.map( ( submission, index ) => (
						<tr key={index}>
							<td>{submission.fullName}</td>
							<td style={{ width: 600 }}>
								<QuestionSwitch 
									disabled
									questionId={props.questionId}
									canvasUserId={submission.canvasUserId}
								/>
							</td>
							<td>
								<TextArea
									value={submission.feedback || ""}
									onChange={ e => updateFeedbackSubmission( submission, e.target.value || "" )}
									onBlur={updateDatabase}
								/>
							</td>
							<td style={{ width: 100 }}>
								<InputGroup 
									value={submission.scoredPoints?.toString() || "0"}
									onChange={e => updateGradeSubmission( submission, parseInt( e.target.value ) || 0 )}
									onBlur={updateDatabase}
									style={{ textAlign: "right", position: "relative" }}
									rightElement={
										<Tag minimal>/ {question?.pointsPossible}</Tag>
									}
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
