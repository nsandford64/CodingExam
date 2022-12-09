// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const jwt = require( "jsonwebtoken" )
const { default: knex } = require("knex")
const { Pool } = require( "pg" )

// Credentials for PostGres database
const credentials = require('../knexfile').connection

/* All api calls require the request to have 
 * a valid token, so this middleware function
 * ensures that is the case, or serves a 403
 * Unauthorized error
 */
router.use(async function(req, res, next) {
	const token = req.headers.token
	// Send an unauthorized request response if the request doesn't have a token
	if ( !token ) res.status(403)
	// Decodes the token and returns the role contained within it
	// Store these in the req.session so they are available 
	// in downstream methods
	else jwt.verify( token, "token_secret", ( err, object ) => {
		if(err) {
			console.error(err);
			res.status(403)
			return
		}
		req.session = {
			role: object.roles,
			assignmentID: object.assignmentID,
			userID: object.userID
		} 
		console.log('token session:', req.session)
		next()
	})
})

/* Endpoint of the API router that returns the role within the token
   Also returns if the client has taken the exam or not
*/
router.get( "/role", async function ( req, res ) {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get('db')
	let taken = false
	
	if(role == "Student")
	{
		// Query the database to see if the client has taken the exam yet
		const results = await knex.raw( `
			SELECT *
			FROM exams_users eu 
				INNER JOIN exams e ON e.id = eu.exam_id
				INNER JOIN users u ON u.id = eu.user_id
			WHERE e.canvas_assignment_id = :assignmentID AND u.canvas_user_id = :userID
		`, {assignmentID, userID})

		taken = results.rows[0].has_taken
	}

	// Sends back the role of the client along with if they have taken the exam
	res.json( {
		role: role,
		taken: taken
	} )
})

// Get a list of questions from the requested assignmentID
router.get( "/questions", async function( req, res ) {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get('db')

	let questions = await knex
		.select('exam_questions.id as id', 'question_text as text', 'question_type_id as type', 'answer_data')
		.from('exam_questions')
		.leftJoin('exams', 'exams.id', 'exam_questions.exam_id')
		.leftJoin('question_types', 'question_types.id', 'exam_questions.question_type_id')
		.where('exams.canvas_assignment_id', assignmentID)

	// We need to 'rehydrate' questions that have answer data 
	// and also limit what data is available depending on user role
	questions.map(question => {
		console.log('answer_data', question.answer_data)
		// multiple choice
		if(question.type === 1) {
			question.answers = question.answer_data.answers 
			if(role == "Instructor") question.correctAnswer = question.answer_data.correctAnswer
		}
		// true/false 
		if(question.type === 3 && role == "Instructor") {
			question.correctAnswer = question.answer_data.correctAnswer
		}
		// remove the question_data property from the question
		delete question.answer_data
		// return the modified question
		return question
	})

	res.json({questions})
})

// Get a list of responses for a given assignmentID and CanvasUserID
router.get( "/responses", async ( req, res ) => {
	const {role, assignmentID} = req.session
	let {userID} = req.session
	const knex = req.app.get('db')

	/* If the sender's role is an instructor, they are on the instructor view and the userID in the token won't match
		the responses they are trying to get. Because of this, a userID header is used to denote the student whose
		responses need to be fetched
	*/
	if ( role === "Instructor" ) {
		userID = req.headers.userid
	}

	const results = await knex.select('*')
		.from('student_responses')
		.innerJoin('users', 'users.id', 'student_responses.user_id')
		.innerJoin('exam_questions', 'exam_questions.id', 'student_responses.question_id')
		.innerJoin('exams', 'exams.id', 'exam_questions.exam_id')
		.where('exams.canvas_assignment_id', assignmentID)
		.where('users.canvas_user_id', userID)

/*
		// Query the database for a particular student's responses for a particular exam
		const results = await pool.query( `
		SELECT SR.QuestionID, SR.IsTextResponse, SR.TextResponse, SR.AnswerResponse
		FROM StudentResponse SR 
		INNER JOIN ExamQuestion EQ ON EQ.QuestionID = SR.QuestionID
		INNER JOIN Exam E ON E.assignmentID = EQ.assignmentID
		WHERE E.CanvasassignmentID = '${assignmentID}' AND SR.CanvasUserID = '${userID}'
		ORDER BY SR.QuestionID
	` )
*/
	// Map all result rows into an array of Response objects
	const responses = results.map(row => {
		return {
			questionId: row.question_id,
			isText: row.is_text_response,
			value: row.is_text_response ? row.text_response : row.answer_response
		}
	})

	// Send an array of Responses to the Client
	res.send({responses})
})

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
		let userID, assignmentID
		jwt.verify( token, "token_secret", ( err, object ) => {
			userID = object.userID
			assignmentID = object.assignmentID
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
				INSERT INTO StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
				VALUES (TRUE, '${stringValue}', ${response.questionId}, '${userID}')
				ON CONFLICT (QuestionID, CanvasUserID) DO UPDATE
					SET TextResponse = '${stringValue}';
			` )
			}
			// Query to insert a non-text response into the database
			else {
				pool.query( `
				INSERT INTO StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
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
				UPDATE UserExam UEO
				SET HasTaken = TRUE
				FROM UserExam AS UE
					INNER JOIN Exam AS E ON UE.assignmentID = E.assignmentID
					INNER JOIN Users AS U ON UE.UserID = U.UserID
				WHERE E.CanvasassignmentID = '${assignmentID}' AND U.CanvasUserID = '${userID}'
					AND UE.UserID = UEO.UserID AND UE.assignmentID = UEO.assignmentID
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
	const {role, assignmentID} = req.session
	let {userID} = req.session
	const knex = req.app.get('db')

	/* When in the instructor view, the userID from the token will be the instructors, but the feedback
		will need to be the student whose feedback they are getting. Because of this, a userID header is
		sent with the userID of the student they are viewing
	*/
	if ( role === "Instructor" ) {
		userID = req.headers.userid
	}

	const feedback = await knex
		.select("question_id as questionId", "instructor_feedback as value")
		.from("student_responses")
		.innerJoin("exam_questions", "exam_questions.id", "student_responses.question_id")
		.innerJoin("exams", "exams.id", "exam_questions.exam_id")
		.innerJoin("users", "users.id", "student_responses.user_id")
		.where('exams.canvas_assignment_id', assignmentID)
		.where('users.canvas_user_id', userID)
		.orderBy("question_id")

		/*
		// Queries the database for feedback for a particular user and exam
		const results = await pool.query( `
		SELECT SR.QuestionID, SR.InstructorFeedback
		FROM StudentResponse SR 
		INNER JOIN ExamQuestion EQ ON EQ.QuestionID = SR.QuestionID
		INNER JOIN Exam E ON E.assignmentID = EQ.assignmentID
		WHERE E.CanvasassignmentID = '${assignmentID}' AND SR.CanvasUserID = '${userID}'
		ORDER BY SR.QuestionID
	` )
	*/

	// Send an array of Responses to the Client
	res.send({feedback})
})

// Instructor endpoints start

// Gets the users who have taken a particular exam for the instructor view
router.get( "/examtakers", instructorOnly, async( req, res ) => {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get('db')

	//Query the database for the students that have taken a particular exam
	const results = await knex.raw( `
	SELECT U.Canvas_User_ID, U.Full_Name
	FROM Exams E
	INNER JOIN Exams_Users UE ON UE.Exam_ID = E.ID
	INNER JOIN Users U ON U.ID = UE.User_ID
	WHERE E.canvas_assignment_id = :assignmentID
	ORDER BY U.Full_Name
	`, { assignmentID } )

		// Sends the list of users from the database
		res.json( {
			users: results.rows.map( row => ( {
				canvasUserId: row.canvasuserid,
				fullName: row.fullname
			} ) )
		} )
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
					UPDATE StudentResponse
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
router.post( "/createexam", instructorOnly, async( req, res ) => {
	console.log( req.body )
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get('db')

	/*
		Get the internal database exam.id based on the Canvas assignmentID
		from the request token. Needed for inserting new questions.
		Also creates the exam for the Canvas assignmentID if it does not 
		yet exist.
	*/
	let [exam] = await knex('exams')
		.insert({
			canvas_assignment_id: assignmentID
		})
		.onConflict('canvas_assignment_id')
		.merge()
		.returning('*')

	// Create or update the exam questions 
	for ( const question of req.body ) {
console.log('question', question)
		/* Determine answer data based on question type. 
		 * Answer data is stored in a JSON column in the db
		 */
		let answerData = null
		// 1 is MultipleChoice
		if(question.type === 1)
		{
			answerData = {
				correctAnswer: question.correctAnswer,
				answers: question.answers
			}
		}
		// 3 is True/False 
		if(question.type === 3)
		{
			answerData = {
				correctAnswer: true && question.correctAnswer
			}
		}
						
		// Inserts the question into the database and returns the questionID for inserting potential answers
		const result = await knex('exam_questions')
			.insert({
				question_text: question.text,
				question_type_id: question.type,
				exam_id: exam.id,
				answer_data: answerData
			})
			.returning('id')
		console.log('result of exam creation:', result)
		
	}
			
	// Send a valid submission response to the user
	res.send( {
		"response": "Valid submission"
	} )
} )

// Sends an invalid request message if the sender is not an instructor
function instructorOnly(req, res, next) 
{
	const {role} = req.session
	if ( role != "Instructor" ) {
		res.json( {
			response: "Invalid request: not an instructor"
		} )
	} else {
		next()
	}
}

module.exports = router
