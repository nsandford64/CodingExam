// Copyright 2022 under MIT License
const express = require( "express" )
const axios = require( "axios" )
const router = express.Router()
const jwt = require( "jsonwebtoken" )
const OAuth1Signature = require( "oauth1-signature" )
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

// Gets the users who have taken a particular exam for the instructor view
router.get( "/examtakers", instructorOnly, async( req, res ) => {
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get( "db" )

	//Query the database for the students that have taken a particular exam
	const users = await knex
		.select( [ "canvas_user_id as canvasUserId", "full_name as fullName" ] )
		.from( "exams_users" )
		.innerJoin( "exams", "exams.id", "exams_users.exam_id" )
		.innerJoin( "users", "users.id", "exams_users.user_id" )
		.where( "canvas_assignment_id", assignmentID )

	// Sends the list of users from the database
	res.json( {users} )
} )

/**
 * Gets the student responses for a particular question for grading purposes
 */
router.get( "/responsesfromquestion", instructorOnly, async( req, res ) => {
	const {role, assignmentID, userID} = req.session
	const questionID = req.headers.questionid
	const knex = req.app.get( "db" )

	// Gets the appropriate rows from the student responses table
	const results = await knex
		.select( "student_responses.id", "student_responses.is_text_response", "student_responses.text_response", 
			"student_responses.answer_response", "student_responses.question_id", "users.canvas_user_id",
			"users.full_name", "student_responses.scored_points" )
		.from( "student_responses" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.where( "exam_questions.id", questionID )

	// Sends the rows back in the form of a submissions typescript object
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

	res.send( {submissions} )
} )

// Enters instructor feedback into the database
router.post( "/feedback", instructorOnly, async( req, res ) => {
	const {role, assignmentID} = req.session
	const userID = req.headers.userid	
	const knex = req.app.get( "db" )
	/*
	// req.body.questionId is NOT actually the question id, 
	// but rather the index of the question in an array
	// of all exam questions. Thus, we must fetch all
	// questions and identify the one we want.
	const questionIndex = req.body.questionId
	const questions = await knex
		.from("exam_questions")
		.innerJoin("exams", "exams.id", "exam_questions.exam_id")
		.where('exams.canvas_assignment_id', assignmentID)
	const question = questions[questionIndex]
	console.log(
		questionIndex,
		question,
		questions
	)
*/
	// We must determine the student this feedback is for
	const student = await knex( "users" )
		.where( "canvas_user_id", userID )
		.first()
		
	// The req.body is an array of feedback
	// insert it into the database one item 
	// at a time, and don't send the response
	// until all have been added
	await Promise.all( req.body.map( async feedback => {
		await knex
			.update( {instructor_feedback: feedback.value} )
			.from( "student_responses" )
			.where( {
				question_id: feedback.questionId, 
				user_id: student.id
			} )
	} ) )
			
	// Send a valid submission response to the user
	res.send( {
		"response": "Valid submission"
	} )
} )

// Gets a non-conflicting database id for a new question
router.get( "/newquestionid", instructorOnly, async( req, res ) => {
	const knex = req.app.get( "db" )
	// Use the postgres nextval() function to grab a new value for examQuestions.id
	// This also advances the corresponding sequence, so it will not be duplicated
	const [ nextID ] = await knex.raw( "SELECT nextval(pg_get_serial_sequence('exam_questions', 'id')) as newID" )
	res.send( nextID )
} )

// Creates the questions for an exam when the instructor submits a question set
router.post( "/createexam", instructorOnly, async( req, res ) => {
	//console.log( req.body )
	const {role, assignmentID, userID} = req.session
	const knex = req.app.get( "db" )

	/*
		Get the internal database exam.id based on the Canvas assignmentID
		from the request token. Needed for inserting new questions.
		Also creates the exam for the Canvas assignmentID if it does not 
		yet exist.
	*/
	let [ exam ] = await knex( "exams" )
		.insert( {
			canvas_assignment_id: assignmentID
		} )
		.onConflict( "canvas_assignment_id" )
		.merge()
		.returning( "*" )

	// Create or update the exam questions 
	for ( const question of req.body ) {
		/* Determine answer data based on question type. 
		 * Answer data is stored in a JSON column in the db
		 */
		let answerData = null
		// 1 is MultipleChoice
		if( question.type === 1 )
		{
			answerData = {
				correctAnswer: question.correctAnswer,
				answers: question.answers
			}
		}
		// 3 is True/False 
		if( question.type === 3 )
		{
			answerData = {
				correctAnswer: true && question.correctAnswer
			}
		}
		// 5 is Parsons Problems
		if ( question.type === 5 ) 
		{
			answerData = { 
				answers: question.answers,
				correctAnswer: question.parsonsAnswer }
		}
						
		// Inserts the question into the database and returns the questionID for inserting potential answers
		const result = await knex( "exam_questions" )
			.insert( {
				question_text: question.text,
				question_type_id: question.type,
				exam_id: exam.id,
				answer_data: answerData,
				points_possible: question.pointsPossible
			} )
			.returning( "id" )
		//console.log( "result of exam creation:", result )
		
	}
			
	// Send a valid submission response to the user
	res.send( {
		"response": "Valid submission"
	} )
} )

/**
 * Endpoint for updating a student's score on a question after it has been graded
 */
router.post( "/grade", instructorOnly, async( req, res ) => {
	const {role, assignmentID } = req.session
	const knex = req.app.get( "db" )

	for ( const submission of req.body ) {
		const canvasUserID = submission.canvasUserId
		const questionID = submission.questionId
		const score = submission.scoredPoints

		const userID = await knex
			.select( "id" )
			.from( "users" )
			.where( "canvas_user_id", canvasUserID )
			.first()

		await knex
			.update( {scored_points: score} )
			.from( "student_responses" )
			.where( {
				question_id: questionID,
				user_id: userID
			} )
	}

	res.sendStatus( 200 )
} )

/**
 * Submits the grades for a particular assignment to Canvas in one
 * single batch
 */
router.post( "/submitgrades", instructorOnly, async( req, res ) => {
	const {role, assignmentID } = req.session
	const knex = req.app.get( "db" )

	// Updates the grades for a particular assignment (recalculates scored points for the students)
	await updateGrades( knex, assignmentID )

	// Gets the exam ID and total points of the exam grades are being submitted for
	const examData = await knex
		.select( "total_points", "id" )
		.from( "exams" )
		.where( {canvas_assignment_id: assignmentID} )
		.first()

	/**
	* Gets the outcome service URL and result sourcedid for the student's
	* assignment from the corresponding row in the exams_users table
	*/
	const gradeSubmissions = await knex
		.select( "outcome_service_url", "result_sourcedid", "exams_users.ScoredPoints" )
		.from( "exams_users" )
		.where( { 
			exam_id: examData.id,
			HasTaken: true
		} )

	for ( const submission of gradeSubmissions ) {

		/**
		 * Makes sure the grade value being sent to canvas isn't over 100%
		 * Pretty sure it will mess with Canvas LTI
		 */
		let grade = submission.ScoredPoints / examData.total_points
		if ( grade > 1 ) {
			grade = 1
		}

		/**
		* XML message that Canvas expects when submitting a grade
		*/
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
			<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
			<imsx_POXHeader>
				<imsx_POXRequestHeaderInfo>
				<imsx_version>V1.0</imsx_version>
				<imsx_messageIdentifier>999999123</imsx_messageIdentifier>
				</imsx_POXRequestHeaderInfo>
			</imsx_POXHeader>
			<imsx_POXBody>
				<replaceResultRequest>
				<resultRecord>
					<sourcedGUID>
					<sourcedId>${submission.result_sourcedid}</sourcedId>
					</sourcedGUID>
					<result>
					<resultScore>
						<language>en</language>
						<textString>${grade}</textString>
					</resultScore>
					</result>
				</resultRecord>
				</replaceResultRequest>
			</imsx_POXBody>  
			</imsx_POXEnvelopeRequest>`
  

		// Oauth signature that also needs to be sent with the grade
		const signature = OAuth1Signature( {
			consumerKey: process.env.CODING_EXAM_LTI_CLIENT_KEY,
			consumerSecret: process.env.CODING_EXAM_LTI_CLIENT_SECRET,
			url: submission.outcome_service_url,
			method: "POST",
			queryParams: {} // if you need to post additional query params, do it here
		} )

		/* We use Axios instead of fetch API here for the HTTP request to the LTI provider
		* This is done to simplify the URL parameters sent, as there are several
		* Also, this code snippet was provided by Dr. Bean's Canvas Group Peer Evaluation repository, so we know it works
		*/
		try {
			const gradeResponse = await axios.request( {
				url: submission.outcome_service_url,
				params: signature.params,
				method: "post",
				headers: { "Content-Type": "application/xml" },
				data: xml,
			} )
		}
		catch( error ) {
			console.log( "Error, are you running in canvas?" )
			console.log( error )
			res.send( {response: "error"} )
		}
	}
	res.send( { status: 200 } )
} )

/**
 * Updates the total_points field in the exams table (in the case that new questions are added) as 
 * well as the ScoredPoints field in the exams_users table (in the case that a student's exam has
 * been graded)
 * @param {*} knex database connection
 * @param {*} assignmentID Canvas assignment ID for the current exam
 */
async function updateGrades( knex, assignmentID ) {
	/**  
	 * Sums the points_possible value from the exam_questions table for the rows
	 * that belong to a particular exam
	 */
	const totalPoints = await knex
		.select( "exams.id" )
		.sum( { points_possible: "points_possible" } )
		.from( "exam_questions" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.canvas_assignment_id", assignmentID )
		.groupBy( "exams.id" )
		.first()

	// Database id of the exam
	const examID = totalPoints.id
	
	/**
	 * Updates the total_points row for the exam that was summed in the previous query
	 */
	await knex
		.update( { total_points: parseInt( totalPoints.points_possible ) } )
		.from( "exams" )
		.where( "canvas_assignment_id", assignmentID )

	/**
	 * Sums the scored_points value for each sstudent from the student_responses table
	 * Also gets the corresponding database user ID for each sum
	 */
	const scoredPoints = await knex
		.select( "student_responses.user_id" )
		.sum( {scored_points: "scored_points"} )
		.from( "student_responses" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.canvas_assignment_id", assignmentID )
		.groupBy( "student_responses.user_id" )

	/**
	 * For each of the students that have taken the exam, update the ScoredPoints 
	 * field in the exams_users table for the corresponding student
	 */
	for( const score of scoredPoints ){
		await knex
			.update( { ScoredPoints: score.scored_points } )
			.from( "exams_users" )
			.where( "user_id", score.user_id )
			.where( "exam_id", examID )
	}
}

/** 
 * Middleware function that some of the Instructor only endpoints are
 * passed through.
 * Sends an invalid request message if the sender is not an instructor
 * */
function instructorOnly( req, res, next ) 
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