// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const jwt = require( "jsonwebtoken" )
const { default: knex } = require( "knex" )
const { Pool } = require( "pg" )

// Credentials for PostGres database
const credentials = require( "../knexfile" ).connection

/** All api calls require the request to have 
 * a valid token, so this middleware function
 * ensures that is the case, or serves a 403
 * Unauthorized error
 */
router.use( async function( req, res, next ) {
	const token = req.headers.token
	// Send an unauthorized request response if the request doesn't have a token
	if ( !token ) res.sendStatus( 403 )
	// Decodes the token and returns the role contained within it
	// Store these in the req.session so they are available 
	// in downstream methods
	else jwt.verify( token, process.env.TOKEN_SECRET, ( err, object ) => {
		if( err ) {
			console.error( err )
			res.sendStatus( 403 )
			return
		}
		req.session = {
			role: object.roles,
			assignmentID: object.assignmentID,
			userID: object.userID
		} 
		//console.log( "token session:", req.session )
		next()
	} )
} )

/* Endpoint of the API router that returns the role within the token
   Also returns if the client has taken the exam or not
*/
router.get( "/role", async function ( req, res ) {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get( "db" )
	let taken = false
	
	if( role == "Learner" )
	{
		// Query the database to see if the client has taken the exam yet
		const response = await knex
			.select( "HasTaken" )
			.from( "exams_users" )
			.innerJoin( "exams", "exams.id", "exams_users.exam_id" )
			.innerJoin( "users", "users.id", "exams_users.user_id" )
			.where( "canvas_user_id", userID )
			.where( "canvas_assignment_id", assignmentID )
			.first()
		if( response && response.HasTaken ) taken = true
		// If the student hasn't taken the exam, we need to "start the clock"
		else await beginUserExam( knex, userID, assignmentID )
	}
	// Sends back the role of the client along with if they have taken the exam
	res.json( {
		role: role,
		taken: taken
	} )
} )

// Get a list of questions from the requested assignmentID
router.get( "/questions", async function( req, res ) {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get( "db" )

	let questions = await knex
		.select( "exam_questions.id as id", "question_text as text", "question_type_id as type", "answer_data", "points_possible" )
		.from( "exam_questions" )
		.leftJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.leftJoin( "question_types", "question_types.id", "exam_questions.question_type_id" )
		.where( "exams.canvas_assignment_id", assignmentID )

	// We need to 'rehydrate' questions that have answer data 
	// and also limit what data is available depending on user role
	questions.map( question => {
		question.pointsPossible = question.points_possible

		// multiple choice
		if( question.type === 1 ) {
			question.answers = question.answer_data.answers 
			if( role == "Instructor" ) question.correctAnswer = question.answer_data.correctAnswer
		}
		// true/false 
		if( question.type === 3 && role == "Instructor" ) {
			question.correctAnswer = question.answer_data.correctAnswer
		}
		// coding answer
		if ( question.type === 4 ) {
			question.language = question.answer_data.language
		}
		// parsons
		if( question.type === 5 ) {
			question.answers = question.answer_data.answers
			if ( role == "Instructor" ) question.parsonsAnswer = question.answer_data.parsonsAnswer
		}
		// remove the question_data property from the question
		delete question.answer_data
		// return the modified question
		return question
	} )

	res.json( {questions} )
} )

// Get a list of responses for a given assignmentID and CanvasUserID
router.get( "/submissions", async ( req, res ) => {
	const {role, assignmentID} = req.session
	let {userID} = req.session
	const knex = req.app.get( "db" )

	/* If the sender's role is an instructor, they are on the instructor view and the userID in the token won't match
		the responses they are trying to get. Because of this, a userID header is used to denote the student whose
		responses need to be fetched
	*/
	if ( role === "Instructor" ) {
		userID = req.headers.userid
	}

	const results = await knex.select( "*" )
		.from( "student_responses" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.canvas_assignment_id", assignmentID )
		.where( "users.canvas_user_id", userID )

	// Map all result rows into an array of Submissions objects
	const submissions = results.map( row => {
		return {
			questionId: row.question_id,
			isText: row.is_text_response,
			value: row.is_text_response ? row.text_response : row.answer_response,
			canvasUserId: row.canvas_user_id,
			fullName: row.full_name,
			scoredPoints: row.scored_points || 0
		}
	} )

	// Send an array of Responses to the Client
	res.send( {submissions} )
} )

// Inserts an answer into the StudentResponse table in the database
router.post( "/", async ( req, res ) => {
	const {role, userID, assignmentID} = req.session
	const knex = req.app.get( "db" )

	// Get the user id for the student
	//console.log( "UserID: " + userID )
	const student = await knex.select( "*" )
		.from( "users" )
		.where( "canvas_user_id", userID )
		.first()
	if( !student ) return res.send( {response: "Invalid Submission - unknown student"} )

	// Get the exam id for the assignment
	const exam = await knex.select( "*" )
		.from( "exams" )
		.where( "canvas_assignment_id", assignmentID )
		.first()
	if( !exam ) return res.send( {response: "Invalid Submission - unknown exam"} )

	// Prepare the student responses for insertion in the database
	const responses = req.body.map( response => {
		if ( typeof response.value === "string" ) {
			return {
				question_id: response.questionId,
				user_id: student.id,
				is_text_response: true,
				text_response: response.value,
				confidence_rating: response.confidence
			} 
		} else {
			return {
				question_id: response.questionId,
				user_id: student.id,
				is_text_response: false,
				answer_response: response.value,
				confidence_rating: response.confidence
			}
		}
	} )

	// Insert each response into the StudentResponse table
	await knex( "student_responses" )
		.insert( responses )
		.onConflict( [ "question_id", "user_id" ] )
		.merge()

	// Set the exam as taken 
	await knex( "exams_users" )
		.insert( {
			user_id: student.id,
			exam_id: exam.id,
			HasTaken: true,
			finished_at: knex.fn.now()
		} )
		.onConflict( [ "exam_id", "user_id" ] )
		.merge()

	autoGrade( knex, userID, assignmentID )

	// Respond a success message to the poster
	res.send( {
		"response": "Valid submission"
	} )
} )

// Gets the student confidence rating for responses, used by both instructor and student view
router.get( "/confidence", async ( req, res ) => {
	const {role, assignmentID} = req.session
	let {userID} = req.session
	const knex = req.app.get( "db" )

	/* When in the instructor view, the userID from the token will be the instructors, but the feedback
		will need to be the student whose feedback they are getting. Because of this, a userID header is
		sent with the userID of the student they are viewing
	*/
	if ( role === "Instructor" ) {
		userID = req.headers.userid
	}

	const confidence = await knex
		.select( "question_id as questionId", "confidence_rating as value" )
		.from( "student_responses" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.where( "exams.canvas_assignment_id", assignmentID )
		.where( "users.canvas_user_id", userID )
		.orderBy( "question_id" )

	// Send an array of Responses to the Client
	res.send( {confidence} )
} )

// Gets the instructor feedback for questions, used by both instructor and student view
router.get( "/feedback", async ( req, res ) => {
	const {role, assignmentID} = req.session
	let {userID} = req.session
	const knex = req.app.get( "db" )

	/* When in the instructor view, the userID from the token will be the instructors, but the feedback
		will need to be the student whose feedback they are getting. Because of this, a userID header is
		sent with the userID of the student they are viewing
	*/
	if ( role === "Instructor" ) {
		userID = req.headers.userid
	}

	const feedback = await knex
		.select( "question_id as questionId", "instructor_feedback as value" )
		.from( "student_responses" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.where( "exams.canvas_assignment_id", assignmentID )
		.where( "users.canvas_user_id", userID )
		.orderBy( "question_id" )

	// Send an array of Responses to the Client
	res.send( {feedback} )
} )

/**
 * A helper function that will automatically grade the multiple choice and true false questions for an exam submission.
 * It does this by getting the questions and their correct answers as well as the student's submissions, compares the values,
 * and updating the appropriate row in the database with either full or no points.
 * 
 * This function is called automatically after a student makes an exam submission.
 * 
 * @param {*} knex Database connection object
 * @param {*} userId Canvas userID of the student who submitted the exam
 * @param {*} assignmentId Canvas assignmentID of the assignment that was submitted
 */
async function autoGrade( knex, userId, assignmentId ) {
	// Get the database user id for the student
	const DBinfo = await getDBInfo( knex, userId, assignmentId )

	// Gets the questions for the exam
	let questions = await knex
		.select( "exam_questions.id as id", "question_type_id as type", "answer_data", "points_possible" )
		.from( "exam_questions" )
		.leftJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.leftJoin( "question_types", "question_types.id", "exam_questions.question_type_id" )
		.where( "exams.canvas_assignment_id", assignmentId )
	
	// We need to 'rehydrate' questions that have answer data 
	// and also limit what data is available depending on user role
	// This snippet is taken from the /questions endpoint and modified for use here
	questions.map( question => {

		// multiple choice
		if( question.type === 1 ) {
			question.correctAnswer = question.answer_data.correctAnswer
		}
		// true/false 
		if( question.type === 3 ) {
			question.correctAnswer = question.answer_data.correctAnswer
		}

		// remove the question_data property from the question
		delete question.answer_data
		// return the modified question
		return question
	} )

	// Query to get the submissions for a student
	const submissions = await knex
		.select( "exam_questions.id as examQuestionsId",
			"student_responses.id as studentResponsesId", "student_responses.answer_response" )
		.from( "exam_questions" )
		.innerJoin( "student_responses", "student_responses.question_id", "exam_questions.id" )
		.where( "exam_questions.exam_id", DBinfo.exam.id )
		.where( "student_responses.user_id", DBinfo.student.id )
		.orderBy( "examQuestionsId" )
		.orderBy( "studentResponsesId" )

	// organize the submissions into a map based on the question ID
	const submissionsMap = new Map()
	submissions.forEach( submission => {
		submissionsMap.set( submission.examQuestionsId, { studentResponsesId: submission.studentResponsesId, 
			answer_response: submission.answer_response } )
	} )

	// Create a map for the new scores after autograding based on the question Id
	const scoresMap = new Map()
	questions.forEach( question => {
		let score = 0
		const submission = submissionsMap.get( question.id )

		if ( question.type === 1 || question.type === 3 ) {
			if ( submission.answer_response == question.correctAnswer ){
				score = question.points_possible
			}
		}
		scoresMap.set( submission.studentResponsesId, score )
	} )

	// Iterate through the new scores in the map and update them accordingly
	for ( const score of scoresMap ) {
		console.log( score )
		await knex
			.update( "scored_points", score[1] )
			.from( "student_responses" )
			.where( "id", score[0] )
	}

}

// Logs the start of a user taking an exam 
async function beginUserExam( knex, userId, assignmentId )
{
	// Get the database user id for the student
	const student = await knex.select( "id" )
		.from( "users" )
		.where( "canvas_user_id", userId )
		.first()

	// Get the exam id for the assignment 
	const exam = await knex.select( "id" )
		.from( "exams" )
		.where( "canvas_assignment_id", assignmentId )
		.first()

	// Create an entry to show the student started the exam now
	// May be a duplicate if the student refreshes the page before 
	// submitting the exam 
	try {
		await knex
			.insert( {
				user_id: student.id,
				exam_id: exam.id,
				started_at: knex.fn.now()
			} )
			.into( "exams_users" )
	} catch( e ) {
		console.error( e )
	}
}

async function getDBInfo( knex, userId, assignmentId ) {
	// Get the database user id for the student
	const student = await knex.select( "id" )
		.from( "users" )
		.where( "canvas_user_id", userId )
		.first()

	// Get the exam id for the assignment 
	const exam = await knex.select( "id" )
		.from( "exams" )
		.where( "canvas_assignment_id", assignmentId )
		.first()

	return { student: student, exam: exam }
}

module.exports = router
