//Copyright 2022 under MIT License
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
		SELECT *
		FROM "CodingExam".ExamQuestion EQ
		LEFT JOIN "CodingExam".QuestionAnswer QA ON QA.QuestionID = EQ.QuestionID
		WHERE ExamID = 1
		ORDER BY EQ.QuestionID, QA.AnswerIndex
	` )

	await pool.end()
	console.log( results.rows )

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

/**
 * Inserts an answer into the StudentResponse table in the database
 */
router.post( "/", async ( req, res ) => {
	const pool = new Pool( credentials )

	await req.body.answers.forEach( answer => {
		pool.query( `
			INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
			VALUES (FALSE, ${answer.answerresponse}, ${answer.questionid}, ${answer.userid});
		` )
	} )

	const results = await pool.query( `
		SELECT *
		FROM "CodingExam".StudentResponse
		WHERE QuestionID = ${req.body.questionID};
	` )

	await pool.end()

	/* Respond a success message to the poster */
	res.send( {
		answer: `You requested: ${results.rows[results.rows.length - 1].answerresponse}`
	} )
} )

module.exports = router
