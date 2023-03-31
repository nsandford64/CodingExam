// Copyright 2022 under MIT License
import { Label, Slider } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { Confidence, ComponentProps } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { examActions, selectConfidenceById } from "../slices/examSlice"

/**
 * Style for the ConfidenceRating component
 */
const StyledConfidence = styled.div`
	padding: 10px;
	border-top: 1px solid grey;
`

/**
 * ConfidenceRating Component
 * 
 * This component allows the user to select a confidence rating
 * representing how confident they are in their answer.
 */
export const ConfidenceRating = React.memo( ( props: ComponentProps ) => {
	/**
	 * Selectors
	 */
	// Dispatches an event to the store
	const dispatch = useAppDispatch()
	// Response from the store
	const confidence = useAppSelector( state => selectConfidenceById( state, props.questionId ) )

	/**
	 * Callbacks
	 */
	/*
	Called when the user selects one of the radio buttons - it
	calls the updateResponse delegate to update the state in the App
	to reflect their choice.
	*/
	const handleChange = React.useCallback( ( value: number ) => {
		// Create a new response object
		const newConfidence: Confidence = {
			questionId: props.questionId,
			value: value
		}
		// Update the response in the store
		dispatch( examActions.updateConfidence( newConfidence ) )
	}, [] )

	/**
	 * Render
	 */
	return (
		<StyledConfidence>
			<Label>Mark your confidence in your answer (0 = Low, 5 = High)</Label>
			<Slider
				min={0}
				max={5}
				stepSize={1}
				labelStepSize={1}
				onChange={handleChange}
				value={confidence?.value || 0}
				disabled={props.disabled}
			/>
		</StyledConfidence>
	)
} )
ConfidenceRating.displayName = "ConfidenceRating"
