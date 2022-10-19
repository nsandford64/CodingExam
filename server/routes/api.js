// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const { Pool } = require( "pg" )

/* Sample credentials for PostGres database */
const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

/**
 * Get a list of questions from the requested examid
 */
router.get( "/questions", async function( req, res ) {
	const pool = new Pool( credentials )

	const results = await pool.query( `
		SELECT EQ.QuestionID, EQ.QuestionText, EQ.HasCorrectAnswers, EQ.QuestionType, EQ.ExamID,
			QA.AnswerID, QA.CorrectAnswer, QA.AnswerIndex, QA.AnswerText
		FROM "CodingExam".ExamQuestion EQ
		LEFT JOIN "CodingExam".QuestionAnswer QA ON QA.QuestionID = EQ.QuestionID
		WHERE ExamID = 1
		ORDER BY EQ.QuestionID, QA.AnswerIndex
	` )

	await pool.end()

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

	/* Sends a question object to the requester */
	res.send( {
		questions: Array.from( map.values() )
	} )
} )

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

	const responses = results.rows.map( row => {
		return {
			questionId: row.questionid,
			isText: row.istextresponse,
			value: row.istextresponse ? row.textresponse : row.answerresponse
		}
	} )

	res.send( {
		responses: responses
	} )
} )

/**
 * Inserts an answer into the StudentResponse table in the database
 */
router.post( "/", async ( req, res ) => {
	const pool = new Pool( credentials )
	
	await req.body.forEach( answer => {
		if ( typeof answer.value === "string" ) {
			pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
				VALUES (TRUE, '${answer.value}', ${answer.questionId}, '668ce32912fc74ec7e60cc59f32f304dc4379617')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET TextResponse = '${answer.value}';
			` )
		}
		else {
			pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
				VALUES (FALSE, ${answer.value}, ${answer.questionId}, '668ce32912fc74ec7e60cc59f32f304dc4379617')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET AnswerResponse = ${answer.value};
			` )
		}
	} )

	await pool.end()

	/* Respond a success message to the poster */
	res.send( {
		"response": "Valid submission"
	} )
} )

module.exports = router
