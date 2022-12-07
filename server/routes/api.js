// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const { Pool } = require( "pg" )
const jwt = require( "jsonwebtoken" )

// Credentials for PostGres database
const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

/* Endpoint of the API router that returns the role within the token
   Also returns if the client has taken the exam or not
*/
router.get( "/role", async function ( req, res ) {
	// Send an invalid request response if the reqeust doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decodes the token and returns the role contained within it
		const token = req.headers.token
		let role, userID, examID
		jwt.verify( token, "token_secret", ( err, object ) => {
			role = object.roles
			examID = object.assignmentID
			userID = object.userID
		} )

		const pool = new Pool( credentials )

		let taken = false
		if ( role !== "Instructor" ) {
			
			// Query the database to see if the client has taken the exam yet
			const results = await pool.query( `
			SELECT UE.HasTaken
			FROM "CodingExam".UserExam UE
				INNER JOIN "CodingExam".Exam E ON E.ExamID = UE.ExamID
				INNER JOIN "CodingExam".Users U ON U.UserID = UE.UserID
			WHERE E.CanvasExamID = '${examID}' AND U.CanvasUserID = '${userID}'
		` )

			await pool.end()

			taken = results.rows[0].hastaken
		}
		
		// Sends back the role of the client along with if they have taken the exam
		res.send( {
			role: role,
			taken: taken
		} )
	}
} )

// Get a list of questions from the requested examid
router.get( "/questions", async function( req, res ) {
	// Sends an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decodes the token and gets the examID from it
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
	// Sends an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decodes the token to get the sender's userID, examID, and role
		const token = req.headers.token
		let examID
		let userID
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
			userID = object.userID 
			role = object.roles       
		} )

		/* If the sender's role is an instructor, they are on the instructor view and the userID in the token won't match
			the responses they are trying to get. Because of this, a userID header is used to denote the student whose
			responses need to be fetched
		*/
		if ( role === "Instructor" ) {
			userID = req.headers.userid
		}

		const pool = new Pool( credentials )

		// Query the database for a particular student's responses for a particular exam
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
	// Sends an invalid submission response if the request doesn't have a token
	if( !req.headers.token ) {
		res.send( {
			"response": "Invalid submission"
		} )
	}
	else {
		// Decodes the token to get the userID of the student
		const token = req.headers.token
		let userID, examID
		jwt.verify( token, "token_secret", ( err, object ) => {
			userID = object.userID
			examID = object.assignmentID
		} )
		const pool = new Pool( credentials )
	
		// Insert each response into the StudentResponse table
		await req.body.forEach( response => {
			console.log( response )
			// Query to insert a text response into the database
			if ( typeof response.value === "string" ) {
				// eslint-disable-next-line no-useless-escape
				const stringValue = `${response.value}`.replace( "'", "''" )
				pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
				VALUES (TRUE, '${stringValue}', ${response.questionId}, '${userID}')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET TextResponse = '${stringValue}';
			` )
			}
			// Query to insert a non-text response into the database
			else {
				pool.query( `
				INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
				VALUES (FALSE, ${response.value}, ${response.questionId}, '${userID}')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET AnswerResponse = ${response.value};
			` )
			}
		} )

		/*
			Sets the HasTaken property in the database to true after the exam has been submitted
		*/
		pool.query( `
				UPDATE "CodingExam".UserExam UEO
				SET HasTaken = TRUE
				FROM "CodingExam".UserExam AS UE
					INNER JOIN "CodingExam".Exam AS E ON UE.ExamID = E.ExamID
					INNER JOIN "CodingExam".Users AS U ON UE.UserID = U.UserID
				WHERE E.CanvasExamID = '${examID}' AND U.CanvasUserID = '${userID}'
					AND UE.UserID = UEO.UserID AND UE.ExamID = UEO.ExamID
			` )
			
		await pool.end()

		// Respond a success message to the poster
		res.send( {
			"response": "Valid submission"
		} )
	}
} )

// Gets the instructor feedback for questions, used by both instructor and student view
router.get( "/feedback", async ( req, res ) => {
	// Sends an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {

		// Decode the token to get the examID, userID, and role from the sender
		const token = req.headers.token
		let examID
		let userID
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
			userID = object.userID 
			role = object.roles       
		} )

		/* When in the instructor view, the userID from the token will be the instructors, but the feedback
			will need to be the student whose feedback they are getting. Because of this, a userID header is
			sent with the userID of the student they are viewing
		*/
		if ( role === "Instructor" ) {
			userID = req.headers.userid
		}

		const pool = new Pool( credentials )

		// Queries the database for feedback for a particular user and exam
		const results = await pool.query( `
		SELECT SR.QuestionID, SR.InstructorFeedback
		FROM "CodingExam".StudentResponse SR 
		INNER JOIN "CodingExam".ExamQuestion EQ ON EQ.QuestionID = SR.QuestionID
		INNER JOIN "CodingExam".Exam E ON E.ExamID = EQ.ExamID
		WHERE E.CanvasExamID = '${examID}' AND SR.CanvasUserID = '${userID}'
		ORDER BY SR.QuestionID
	` )

		// Map all result rows into an array of Feedback objects
		const feedback = results.rows.map( row => {
			return {
				questionId: row.questionid,
				value: row.instructorfeedback
			}
		} )

		// Send an array of Responses to the Client
		res.send( {
			feedback: feedback
		} )
	}
} )

// Instructor endpoints start

// Gets the users who have taken a particular exam for the instructor view
router.get( "/examtakers", async( req, res ) => {
	// Sends an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decodes the token and gets the examID and role of the sender
		const token = req.headers.token
		let examID
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			examID = object.assignmentID 
			role = object.roles     
		} )

		// Sends an invalid request message if the sender is not an instructor
		if ( role != "Instructor" ) {
			res.send( {
				response: "Invalid request: not an instructor"
			} )
		}
		else {
			
			const pool = new Pool( credentials )

			//Query's the database for the students that have taken a particular exam
			const results = await pool.query( `
			SELECT U.CanvasUserID, U.FullName
			FROM "CodingExam".Exam E
			INNER JOIN "CodingExam".UserExam UE ON UE.ExamID = E.ExamID
			INNER JOIN "CodingExam".Users U ON U.UserID = UE.UserID
			WHERE E.CanvasExamID = '${examID}'
			ORDER BY U.FullName
			` )

			await pool.end()

			// Sends the list of users from the database
			res.send( {
				users: results.rows.map( row => ( {
					canvasUserId: row.canvasuserid,
					fullName: row.fullname
				} ) )
			} )
		}
	}
} )

// Enters instructor feedback into the database
router.post( "/instructorfeedback", async( req, res ) => {
	// Returns an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decode the token to get the sender's role
		const token = req.headers.token
		let role

		jwt.verify( token, "token_secret", ( err, object ) => {
			role = object.roles     
		} )
		// if the sender isn't an instructor, return an invalid request response
		if ( role != "Instructor" ) {
			res.send( {
				response: "Invalid request: not an instructor"
			} )
		}
		else {
			const userID = req.headers.userid
			const pool = new Pool( credentials )

			// Insert the feedback from the instructor into the database
			await req.body.forEach( question => {
				pool.query( `
					UPDATE "CodingExam".StudentResponse
					SET InstructorFeedback = '${question.value}'
					WHERE QuestionID = ${question.questionId} AND CanvasUserID = '${userID}'
				` )
			} )
			// Send a valid submission response to the user
			res.send( {
				"response": "Valid submission"
			} )
		}
	}
} )

// Creates the questions for an exam when the instructor submits a question set
router.post( "/createexam", async( req, res ) => {
	console.log( req.body )
	// Returns an invalid request response if the request doesn't have a token
	if ( !req.headers.token ) {
		res.send( {
			"response": "Invalid request"
		} )
	}
	else {
		// Decode the token to get the sender's role
		const token = req.headers.token
		let role, CanvasExamID

		jwt.verify( token, "token_secret", ( err, object ) => {
			CanvasExamID = object.assignmentID
			role = object.roles     
		} )
		// if the sender isn't an instructor, return an invalid request response
		if ( role != "Instructor" ) {
			res.send( {
				response: "Invalid request: not an instructor"
			} )
		}
		else {
			// Insert each question into the database
			const pool = new Pool( credentials )

			for ( const question of req.body ) {
				/* 
					Parses whether the question has correct answers by the question type.
					Since that is a server/database field that the client doesn't need to 
					know about, it is determined on server side and not sent by the request
				*/
				let hasCorrectAnswers = "FALSE"
				
				if ( question.type === 1 || question.type === 3 ) {
					hasCorrectAnswers = "TRUE"
				}

				/*
					Gets the internal database examID based on the Canvas assignmentID from the
					request. Needed for inserting new questions.
				*/
				let results = await pool.query( `
					SELECT E.ExamID
					FROM "CodingExam".Exam E
					WHERE E.CanvasExamID = '${CanvasExamID}'
				` )

				const examId = results.rows[0].examid
				
				if ( question.type === 5 ) {
					// Inserts the question into the database and returns the questionID for inserting potential answers
					results = await pool.query( `
					INSERT INTO "CodingExam".ExamQuestion(QuestionText, HasCorrectAnswers, QuestionType, ExamID, ParsonsAnswer)
					VALUES('${question.text}', ${hasCorrectAnswers}, ${question.type}, ${examId}, '${question.parsonsAnswer}')
					RETURNING QuestionID
				` )
				}
				else {
				// Inserts the question into the database and returns the questionID for inserting potential answers
					results = await pool.query( `
						INSERT INTO "CodingExam".ExamQuestion(QuestionText, HasCorrectAnswers, QuestionType, ExamID)
						VALUES('${question.text}', ${hasCorrectAnswers}, ${question.type}, ${examId})
						RETURNING QuestionID
					` )
				}

				const questionId = results.rows[0].questionid
				
				/*
					Inserts the potential answers for each question into the database, using 
					the questionID from the previous insert, .
				*/
				for ( let i = 0; i < question.answers.length; i++ ) {

					/* 
						Parses whether the answer is the correct one. The initial request will denote the
						display index of the correct answer for each question, and since the answers for the questions
						will be in the same order they were displayed, the index of the for loop can be used to 
						mark the right answer as the "correct" answer in the database.
					*/
					let correct = "FALSE"

					if ( question.correctAnswer === i && question.type != 5 ) {
						correct = "TRUE"
					}

					/*
						Inserts the potential answer into the database, with the order the answers were 
						in the request being the order they will be displayed in.
					*/
					await pool.query( `
					INSERT INTO "CodingExam".QuestionAnswer(QuestionID, CorrectAnswer, AnswerIndex, AnswerText)
					VALUES(${questionId}, ${correct}, ${i}, '${question.answers[i]}')
				` )
				}

			}
			
			await pool.end()
			// Send a valid submission response to the user
			res.send( {
				"response": "Valid submission"
			} )
		}
	}
		
} )

module.exports = router
