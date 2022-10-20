// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const { Pool } = require( "pg" )

// Sample credentials for PostGres database
const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

// Get a list of questions from the requested examid
router.get( "/questions", async function( req, res ) {
	const pool = new Pool( credentials )

	// Query the database for a list of questions with a given ExamID
	const results = await pool.query( `
		SELECT EQ.QuestionID, EQ.QuestionText, EQ.HasCorrectAnswers, EQ.QuestionType, EQ.ExamID,
			QA.AnswerID, QA.CorrectAnswer, QA.AnswerIndex, QA.AnswerText
		FROM "CodingExam".ExamQuestion EQ
		LEFT JOIN "CodingExam".QuestionAnswer QA ON QA.QuestionID = EQ.QuestionID
		WHERE ExamID = 1
		ORDER BY EQ.QuestionID, QA.AnswerIndex
	` )

	await pool.end()

	// Map each row in results to a new Question object that can be parsed by the Client
	const map = new Map()
	results.rows.forEach( row => map.set( row.questionid, {
		id: row.questionid,
		text: row.questiontext,
		type: row.questiontype,
		answers: []
	} ) )
	results.rows.forEach( row => {
		const object = map.get( row.questionid )
		const answers = object.answers
		
		const newAnswers = [ ...answers, row.answertext ]
		map.set( row.questionid, {
			...object,
			answers: newAnswers
		} )
	} )

	// Sends an array of questions to the Client
	res.send( {
		questions: Array.from( map.values() )
	} )
} )

// Get a list of responses for a given ExamID and CanvasUserID
router.get( "/responses", async ( req, res ) => {
	const pool = new Pool( credentials )

	const results = await pool.query( `
		SELECT SR.QuestionID, SR.IsTextResponse, SR.TextResponse, SR.AnswerResponse
		FROM "CodingExam".StudentResponse SR 
		INNER JOIN "CodingExam".ExamQuestion EQ ON EQ.QuestionID = SR.QuestionID
		INNER JOIN "CodingExam".Exam E ON E.ExamID = EQ.ExamID
		WHERE E.CanvasExamID = 'a94f149b-336c-414f-a05b-8b193322cbd8' AND SR.CanvasUserID = '668ce32912fc74ec7e60cc59f32f304dc4379617'
		ORDER BY SR.QuestionID
	` )

	// Map all result rows into an array of Response objects
	const responses = results.rows.map( row => {
		return {
			questionId: row.questionid,
			isText: row.istextresponse,
			value: row.istextresponse ? row.textresponse : row.answerresponse
		}
	} )

	// Send an array of Responses to the Client
	res.send( {
		responses: responses
	} )
} )

// Inserts an answer into the StudentResponse table in the database
router.post( "/", async ( req, res ) => {
	const pool = new Pool( credentials )
	
	// Insert each response into the StudentResponse table
	await req.body.forEach( response => {
		if ( typeof response.value === "string" ) {
			pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
				VALUES (TRUE, '${response.value}', ${response.questionId}, '668ce32912fc74ec7e60cc59f32f304dc4379617')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET TextResponse = '${response.value}';
			` )
		}
		else {
			pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
				VALUES (FALSE, ${response.value}, ${response.questionId}, '668ce32912fc74ec7e60cc59f32f304dc4379617')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET AnswerResponse = ${response.value};
			` )
		}
	} )

	await pool.end()

	// Respond a success message to the poster
	res.send( {
		"response": "Valid submission"
	} )
} )
module.exports = router
