import { enableMapSet } from "immer"
import { Confidence, Feedback, Question, QuestionType, Response } from "../../App"
import examReducer, {
	examActions,
	ExamState
} from "../examSlice"
enableMapSet()

const question: Question = {
	id: 1,
	answers: [ "test" ],
	text: "test",
	type: QuestionType.TrueFalse
}

describe( "exam reducer", () => {
	const initialState: ExamState = {
		questionIds: [],
		questionsMap: new Map<number, Question>(),
		responseIds: [],
		responsesMap: new Map<number, Response>(),
		responseState: "",
		confidenceIds: [],
		confidenceMap: new Map<number, Confidence>(),
		feedbackIds: [],
		feedbackMap: new Map<number, Feedback>(),
		nextQuestionId: 10,
		token: ""
	}

	it( "should handle initial state", () => {
		expect( examReducer( undefined, { type: "unknown" } ) ).toEqual( {
			questionIds: [],
			questionsMap: new Map<number, Question>(),
			responseIds: [],
			responsesMap: new Map<number, Response>(),
			responseState: "",
			confidenceIds: [],
			confidenceMap: new Map<number, Confidence>(),
			feedbackIds: [],
			feedbackMap: new Map<number, Feedback>(),
			nextQuestionId: 10,
			token: ""
		} )
	} )

	/**
	 * Questions
	 */
	it( "should handle setQuestionIds", () => {
		const questionIds = [ 1, 2, 3 ]

		const actual = examReducer( initialState, examActions.setQuestionIds( questionIds ) )
		expect( actual.questionIds ).toEqual( questionIds )
	} )

	it( "should handle setQuestionsMap", () => {
		const questionsMap = new Map<number, Question>( [
			[ 1, question ]
		] )

		const actual = examReducer( initialState, examActions.setQuestionsMap( questionsMap ) )
		expect( actual.questionsMap ).toEqual( questionsMap )
	} )

	it( "should handle updateQuestion", () => {
		let actual = examReducer( initialState, examActions.updateQuestion( question ) )
		expect( actual.questionIds.length ).toEqual( 1 )
		expect( actual.questionIds.includes( 1 ) ).toEqual( true )
		expect( actual.questionsMap.get( 1 ) ).toEqual( question )

		const updatedQuestion = {
			...question,
			text: "updated"
		}

		actual = examReducer( actual, examActions.updateQuestion( updatedQuestion ) )
		expect( actual.questionIds.length ).toEqual( 1 )
		expect( actual.questionIds.includes( 1 ) ).toEqual( true )
		expect( actual.questionsMap.get( 1 ) ).toEqual( updatedQuestion )
	} )

	it( "should handle deleteQuestion", () => {
		let actual = examReducer( initialState, examActions.updateQuestion( question ) )
		actual = examReducer( actual, examActions.deleteQuestion( question.id ) )
		expect( actual.questionIds.length ).toEqual( 0 )
		expect( actual.questionIds.includes( 1 ) ).toBe( false )
		expect( actual.questionsMap.get( 1 ) ).toEqual( undefined )
	} )

	/**
	 * Responses
	 */
	it( "should handle setResponseIds", () => {
		const responseIds = [ 1, 2, 3 ]

		const actual = examReducer( initialState, examActions.setResponseIds( responseIds ) )
		expect( actual.responseIds ).toEqual( responseIds )
	} )

	it( "should handle setResponsesMap", () => {
		const response: Response = {
			questionId: 1,
			value: "test",
			isText: true
		}
		const responsesMap = new Map<number, Response>( [
			[ 1, response ]
		] )

		const actual = examReducer( initialState, examActions.setResponsesMap( responsesMap ) )
		expect( actual.responsesMap ).toEqual( responsesMap )
	} )

	it( "should handle updateResponse", () => {
		const response: Response = {
			questionId: 1,
			value: "update",
			isText: true
		}

		const actual = examReducer( initialState, examActions.updateResponse( response ) )
		expect( actual.responsesMap.get( response.questionId ) ).toEqual( response )
	} )

	/**
	 * ResponseState
	 */
	it( "should handle setResponseState", () => {
		const actual = examReducer( initialState, examActions.setResponseState( "test" ) )
		expect( actual.responseState ).toEqual( "test" )
	} )

	/**
	 * Feedback
	 */
	it( "should handle setFeedbackIds", () => {
		const feedbackIds = [ 1, 2, 3 ]

		const actual = examReducer( initialState, examActions.setFeedbackIds( feedbackIds ) )
		expect( actual.feedbackIds ).toEqual( feedbackIds )
	} )

	it( "should handle setFeedbackMap", () => {
		const feedBack: Feedback = {
			questionId: 1,
			value: "test",
		}
		const feedbackMap = new Map<number, Feedback>( [
			[ 1, feedBack ]
		] )

		const actual = examReducer( initialState, examActions.setFeedbackMap( feedbackMap ) )
		expect( actual.feedbackMap ).toEqual( feedbackMap )
	} )

	it( "should handle updateFeedback", () => {
		const feedback: Feedback = {
			questionId: 1,
			value: "update",
		}

		const actual = examReducer( initialState, examActions.updateFeedback( feedback ) )
		expect( actual.feedbackMap.get( feedback.questionId ) ).toEqual( feedback )
	} )

	/**
	 * NextQuestionId
	 */
	it( "should handle incrementNextQuestionId", () => {
		const actual = examReducer( initialState, examActions.incrementNextQuestionId() )
		expect( actual.nextQuestionId ).toEqual( 1 )
	} )

	/**
	 * Token
	 */
	it( "should handle setToken", () => {
		const actual = examReducer( initialState, examActions.setToken( "test" ) )
		expect( actual.token ).toEqual( "test" )
	} )
} )