// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const { Pool } = require( "pg" )
const jwt = require( "jsonwebtoken" )

// Sample credentials for PostGres database
const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

router.get( "/role", async function ( req, res ) {
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		const token = req.headers.token
		let role
		jwt.verify( token, "token_secret", ( err, object ) => {
			role = object.roles 
		} )

		res.send( {
			role: role
		} )
	}
} )

// Get a list of questions from the requested examid
router.get( "/questions", async function( req, res ) {

	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		const token = req.headers.token
		let examID
		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
		} )
		const pool = new Pool( credentials )

		// Query the database for a list of questions with a given ExamID
		const results = await pool.query( `
		SELECT EQ.QuestionID, EQ.QuestionText, EQ.HasCorrectAnswers, EQ.QuestionType, EQ.ExamID,
			QA.AnswerID, QA.CorrectAnswer, QA.AnswerIndex, QA.AnswerText
		FROM "CodingExam".Exam E
		INNER JOIN "CodingExam".ExamQuestion EQ ON EQ.ExamID = E.ExamID
		LEFT JOIN "CodingExam".QuestionAnswer QA ON QA.QuestionID = EQ.QuestionID
		WHERE E.CanvasExamID = '${examID}'
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
	}
} )

// Get a list of responses for a given ExamID and CanvasUserID
router.get( "/responses", async ( req, res ) => {
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		const token = req.headers.token
		let examID
		let userID
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
			userID = object.userID 
			role = object.roles       
		} )

		if ( role === "Instructor" ) {
			userID = req.headers.userid
		}
		
		const pool = new Pool( credentials )

		const results = await pool.query( `
		SELECT SR.QuestionID, SR.IsTextResponse, SR.TextResponse, SR.AnswerResponse
		FROM "CodingExam".StudentResponse SR 
		INNER JOIN "CodingExam".ExamQuestion EQ ON EQ.QuestionID = SR.QuestionID
		INNER JOIN "CodingExam".Exam E ON E.ExamID = EQ.ExamID
		WHERE E.CanvasExamID = '${examID}' AND SR.CanvasUserID = '${userID}'
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
	}
} )

// Inserts an answer into the StudentResponse table in the database
router.post( "/", async ( req, res ) => {
	if( !req.headers.token ) {
		res.send( {
			"response": "Invalid submission"
		} )
	}
	else {
		
		const token = req.headers.token
		let userID
		jwt.verify( token, "token_secret", ( err, object ) => {
			userID = object.userID
		} )
		const pool = new Pool( credentials )
	
		// Insert each response into the StudentResponse table
		await req.body.forEach( response => {
			if ( typeof response.value === "string" ) {
				pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
				VALUES (TRUE, '${response.value}', ${response.questionId}, '${userID}')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET TextResponse = '${response.value}';
			` )
			}
			else {
				pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
				VALUES (FALSE, ${response.value}, ${response.questionId}, '${userID}')
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
	}
} )

//instructor endpoints start
router.get( "/examtakers", async( req, res ) => {
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		const token = req.headers.token
		let examID
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
			role = object.roles     
		} )
		if ( role != "Instructor" ) {
			res.send( {
				response: "Invalid request: not an instructor"
			} )
		}
		else {
			const pool = new Pool( credentials )

			const results = await pool.query( `
			SELECT U.CanvasUserID, U.FullName
			FROM "CodingExam".Exam E
			INNER JOIN "CodingExam".UserExam UE ON UE.ExamID = E.ExamID
			INNER JOIN "CodingExam".Users U ON U.UserID = UE.UserID
			WHERE E.CanvasExamID = '${examID}'
			ORDER BY U.FullName
			` )

			await pool.end()

			res.send( {
				users: results.rows.map( row => ( {
					canvasUserId: row.canvasuserid,
					fullName: row.fullname
				} ) )
			} )
		}
	}
} )

module.exports = router
