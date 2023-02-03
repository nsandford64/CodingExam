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
		.select( "exam_questions.id as id", "question_text as text", "question_type_id as type", "answer_data" )
		.from( "exam_questions" )
		.leftJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.leftJoin( "question_types", "question_types.id", "exam_questions.question_type_id" )
		.where( "exams.canvas_assignment_id", assignmentID )

	// We need to 'rehydrate' questions that have answer data 
	// and also limit what data is available depending on user role
	questions.map( question => {
		//console.log( "answer_data", question.answer_data )
		// multiple choice
		if( question.type === 1 ) {
			question.answers = question.answer_data.answers 
			if( role == "Instructor" ) question.correctAnswer = question.answer_data.correctAnswer
		}
		// true/false 
		if( question.type === 3 && role == "Instructor" ) {
			question.correctAnswer = question.answer_data.correctAnswer
		}
		// remove the question_data property from the question
		delete question.answer_data
		// return the modified question
		return question
	} )

	res.json( {questions} )
} )

// Get a list of responses for a given assignmentID and CanvasUserID
router.get( "/responses", async ( req, res ) => {
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

	// Map all result rows into an array of Response objects
	const responses = results.map( row => {
		return {
			questionId: row.question_id,
			isText: row.is_text_response,
			value: row.is_text_response ? row.text_response : row.answer_response
		}
	} )

	// Send an array of Responses to the Client
	res.send( {responses} )
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
		//console.log( {response} )
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

	//console.log( {responses} )

	// Insert each response into the StudentResponse table
	await knex( "student_responses" )
		.insert( responses )

	// Insert each response into the StudentResponse table
	await knex( "student_responses" )
		.insert( responses )

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

// Instructor endpoints start

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

// Enters instructor feedback into the database
router.post( "/instructorfeedback", instructorOnly, async( req, res ) => {
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
						
		// Inserts the question into the database and returns the questionID for inserting potential answers
		const result = await knex( "exam_questions" )
			.insert( {
				question_text: question.text,
				question_type_id: question.type,
				exam_id: exam.id,
				answer_data: answerData
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
 * Endpoint for sending a grade for a student's exam to Canvas (or LTI provider)
 */
router.post( "/grade", instructorOnly, async( req, res ) => {
	const {role, assignmentID } = req.session
	const userID = req.headers.userid
	const grade = req.body.grade
	const knex = req.app.get( "db" )

	/**
	 * Gets the database exam and user ID needed to filter the
	 * exams_users table and get the desired row in that table
	 */
	const filter = await knex
		.select( "exam_id", "user_id" )
		.from( "exams_users" )
		.innerJoin( "exams", "exams.id", "exams_users.exam_id" )
		.innerJoin( "users", "users.id", "exams_users.user_id" )
		.where( {
			canvas_assignment_id: assignmentID,
			canvas_user_id: userID
		} )

	/**
	 * Gets the outcome service URL and result sourcedid for the student's
	 * assignment from the corresponding row in the exams_users table
	 */
	const gradeInfo = await knex
		.select( "outcome_service_url", "result_sourcedid" )
		.from( "exams_users" )
		.where( { 
			exam_id: filter[0].exam_id,
			user_id: filter[0].user_id 
		} )

	const resultSourcedid = gradeInfo[0].result_sourcedid
	const outcomeServiceURL = gradeInfo[0].outcome_service_url


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
              <sourcedId>${resultSourcedid}</sourcedId>
            </sourcedGUID>
            <result>
              <resultScore>
                <language>en</language>
                <textString>${grade/100}</textString>
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
		url: outcomeServiceURL,
		method: "POST",
		queryParams: {} // if you need to post additional query params, do it here
	} )

	/* We use Axios instead of fetch API here for the HTTP request to the LTI provider
	* This is done to simplify the URL parameters sent, as there are several
	* Also, this code snippet was provided by Dr. Bean's Canvas Group Peer Evaluation repository, so we know it works
	*/
	const gradeResponse = await axios.request( {
		url: outcomeServiceURL,
		params: signature.params,
		method: "post",
		headers: { "Content-Type": "application/xml" },
		data: xml,
	} )

	if ( gradeResponse.status == 200 ) {
		res.send( { response: "Valid submission" } )
	}
	else {
		res.send( { response: "Invalid submission" } )
	}
	
} )

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
