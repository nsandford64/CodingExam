import { enableMapSet } from "immer"
import { Feedback, Question, QuestionType, Response } from "../../App"
import examReducer, {
	examActions,
	ExamState
} from "../examSlice"
enableMapSet()

describe( "exam reducer", () => {
	const initialState: ExamState = {
		questionIds: [],
		questionsMap: new Map<number, Question>(),
		responseIds: [],
		responsesMap: new Map<number, Response>(),
		responseState: "",
		feedbackIds: [],
		feedbackMap: new Map<number, Feedback>()
	}

	it( "should handle initial state", () => {
		expect( examReducer( undefined, { type: "unknown" } ) ).toEqual( {
			questionIds: [],
			questionsMap: new Map<number, Question>(),
			responseIds: [],
			responsesMap: new Map<number, Response>(),
			responseState: ""
		} )
	} )

	it( "should handle setQuestionIds", () => {
		const questionIds = [ 1, 2, 3 ]

		const actual = examReducer( initialState, examActions.setQuestionIds( questionIds ) )
		expect( actual.questionIds ).toEqual( questionIds )
	} )

	it( "should handle setQuestionsMap", () => {
		const question: Question = {
			id: 1,
			answers: [ "test" ],
			text: "test",
			type: QuestionType.TrueFalse
		}
		const questionsMap = new Map<number, Question>( [
			[ 1, question ]
		] )

		const actual = examReducer( initialState, examActions.setQuestionsMap( questionsMap ) )
		expect( actual.questionsMap ).toEqual( questionsMap )
	} )

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
			value: "test",
			isText: true
		}

		const actual = examReducer( initialState, examActions.updateResponse( response ) )
		expect( actual.responsesMap.get( response.questionId ) ).toEqual( response )
	} )

	it( "should handle setResponseState", () => {
		const actual = examReducer( initialState, examActions.setResponseState( "test" ) )
		expect( actual.responseState ).toEqual( "test" )
	} )
} )