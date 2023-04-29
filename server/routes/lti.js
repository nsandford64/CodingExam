// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )
const fs = require( "fs" )
const app = require( "../app" )
const { setDefaultResultOrder } = require( "dns/promises" )
const { create } = require( "domain" )
const { Http2ServerRequest } = require( "http2" )

const router = express.Router()

// Creates an LTI provider object with the key and secret 
// from the corresponding environment variables
// If this fails, we throw an error, which will interrupt 
// startup (important, as we don't want the app running
// without a valid LTI connection)
const key = process.env.CODING_EXAM_LTI_CLIENT_KEY
const secret = process.env.CODING_EXAM_LTI_CLIENT_SECRET
if(!(key && secret)) throw 'Missing LTI client key and/or secret environment variables.'
const provider = new lti.Provider(key, secret);

// The secret for signing Json Web Tokens
const jwtSecret = process.env.CODING_EXAM_JWT_SECRET

/**
 * Development entry point for the application
 * If the app is in development mode, it will serve a basic HTML page
 * that contains two links, one that leads to the instructor view and 
 * one that leads to the learner view. These links will also generate
 * an access token with some default values in the database.
 */
if( process.env.NODE_ENV == "development" ) {
	
	/*
	 * Get the main entry point to the Client app
	 * Gives an option to load the app as a student, instructor, or as a reset student to take it again
	 */
	router.get( "/", ( req, res ) => {	
		res.send( `<h1>Debug access</h1>
			<ul>
				<li><a href="/learner">Learner Entry Point</a></li>
				<li><a href="/instructor">Instructor Entry Point</a></li>
				<li><a href="/retake">Retake Exam</a></li>
			</ul>
		` )
	} )

	/*
	 * Loads the app as an instructor
	 */
	router.get( "/instructor", async ( req, res ) => {
		const knex = req.app.get( "db" )
		const ltiData = { 
			assignmentID: "c38940c2-5521-422f-b520-7462fd820a7d",
			fullName: "Example Instructor",
			userID: "example-instructor",
			roles: "Instructor"
		}
		// Creates the user and exam if either don't exist already
		await findOrCreateUser( knex, ltiData.userID, ltiData.fullName )
		await createExam( knex, ltiData.assignmentID )
		const token = generateAccessToken( ltiData )
		serveIndex( res, token )
	} )

	/*
	 * Loads the app as a learner
	 */
	router.get( "/learner", async ( req, res ) => {
		const knex = req.app.get( "db" )
		const ltiData = { 
			assignmentID: "example-exam",
			fullName: "Example Learner",
			userID: "example-learner",
			roles: "Learner"
		}
		// Creates the user if it does not exist already
		await findOrCreateUser( knex, ltiData.userID, ltiData.fullName )
		const token = generateAccessToken( ltiData )
		serveIndex( res, token )
	} )

	/*
	 * Resets the HasTaken property and lets the student view take the exam again
	 */
	router.get( "/retake", async ( req, res ) => {
		const knex = req.app.get( "db" )
		const ltiData = { 
			assignmentID: "example-exam",
			fullName: "Example Learner",
			userID: "example-learner",
			roles: "Learner"
		}
		resetHasTaken( knex, ltiData )
		await findOrCreateUser( knex, ltiData.userID, ltiData.fullName )
		const token = generateAccessToken( ltiData )
		serveIndex( res, token )
	} )

} else {
	// If we aren't in development mode, we need to explicitly 
	// override the index route, or the static index.html will be 
	// served instead.
	router.get( "/", ( req, res ) => res.sendStatus( 404 ) )
}

/**
 * Handles a POST request from the LTI consumer, in this case Canvas
 */ 
router.post( "/", async ( req, res ) => {
	const knex = req.app.get( "db" )
	
	if ( process.env.NODE_ENV == "development" ) {
		req.connection.encrypted = true
	}
	provider.valid_request( req, async ( err, isValid ) => {
		// If the request is invalid, the console logs an error, else it returns a message to the LTI provider
		if ( !isValid ) {
			console.error( err )
			//console.log( req.protocol )
			//console.log( req.headers )
			console.error( req.body )
			res.status( 401 ).send( "Unauthorized request" )
		}	
		else {
			// Creates LTI data object with data from the LTI launch request
			const ltiData = { 
				assignmentID: req.body.ext_lti_assignment_id,
				userID: req.body.user_id,
				roles: req.body.roles,
				fullName: req.body.lis_person_name_full,
				familyName: req.body.lis_person_name_family,
				givenName: req.body.lis_person_name_given,
				email: req.body.lis_person_contact_email_primary
			}

			const totalPoints = req.body.custom_canvas_assignment_points_possible

			// Creates user and exam if they don't already exist
			await findOrCreateUser( knex, ltiData )
			if( ltiData.roles === "Instructor" ) {
				await createExam( knex, ltiData.assignmentID, totalPoints )
			}
			if ( ltiData.roles === "Learner" ) {
				const resultSourcedid = req.body.lis_result_sourcedid
				const outcomeServiceUrl = req.body.lis_outcome_service_url
				// Stores the LTI info needed for grading into the database
				await storeGradeInfo( knex, ltiData, resultSourcedid, outcomeServiceUrl )
			}
			
			const token = generateAccessToken( ltiData )
			serveIndex( res, token )
		}
	} )
} )

/**
 * Serves the app HTML file, modified to include the token data
 * @param {Http2ServerResponse} res - the HTTP response to complete 
 * @param {string} token - the JWT to attach to the app 
 */
async function serveIndex( res, token ) {
	fs.readFile( path.resolve( "../client/build/index.html" ), "utf8", ( err, data ) => {
		if ( err ) {
			console.error( err )
			return res.status( 500 ).send( "An error occurred" )
		}
		res.send( data.replace(
			"<div id=\"replace\"></div>",
			`window.__INITIAL_DATA__ = '${token}'`
		) )
	} )
}
/**
 * Stores the outcome service url and result sourcedid for grading later
 * @param {*} knex - database connection
 * @param {*} ltiData - provides canvas assignment and user ids
 * @param {*} resultSourcedid - result sourcedid from launch request
 * @param {*} outcomeServiceUrl - outcome service url from launch request
 */
async function storeGradeInfo( knex, ltiData, resultSourcedid, outcomeServiceUrl ) {

	/**
	 * Gets the database ID for the student and exam and then
	 * inserts them into the exams_users table
	 */
	const student = await knex.select( "*" )
		.from( "users" )
		.where( "canvas_user_id", ltiData.userID )
		.first()
		
	const exam = await knex.select( "*" )
		.from( "exams" )
		.where( "canvas_assignment_id", ltiData.assignmentID )
		.first()

	await knex( "exams_users" )
		.insert( {
			user_id: student.id,
			exam_id: exam.id,
			result_sourcedid: resultSourcedid,
			outcome_service_url: outcomeServiceUrl
		} )
		.onConflict( [ "exam_id", "user_id" ] )
		.merge()
}

/**
 * Create an exam for the canvas assignment, if one does not yet exist
 * @param {Knex} knex - the database connection
 * @param {int} canvasAssignmentID - the canvas assignment id
 */
async function createExam( knex, canvasAssignmentID, totalPoints ){
	// Try creating an exam. Since the column canvas_exam_id is unique
	// if one already exists, this will fail
	try {
		await knex( "exams" ).insert( {
			canvas_assignment_id: canvasAssignmentID,
			total_points: totalPoints
		} )
	// eslint-disable-next-line no-empty
	} catch( _err ) {}
}

/**
 * Returns the database id of the user with the corresponding
 * canvas user id, or generates a new user if one does not exist
 * @param {*} knex 
 * @param {*} canvasUserId 
 * @param {*} fullName 
 * @returns 
 */
async function findOrCreateUser( knex, userData ){
	const [ user ] = await knex( "users" )
		.insert( {
			canvas_user_id: userData.userID,
			full_name: userData.fullName,
			family_name: userData.familyName,
			given_name: userData.givenName,
			email: userData.email 
		} )
		.onConflict( "canvas_user_id" )
		.merge()
		.returning( "*" )
	return user.id
}
	
async function resetHasTaken( knex, ltiData ){

	/**
	 * Gets the internal database id of the user and exam
	 */
	const student = await knex.select( "*" )
		.from( "users" )
		.where( "canvas_user_id", ltiData.userID )
		.first()
		
	const exam = await knex.select( "*" )
		.from( "exams" )
		.where( "canvas_assignment_id", ltiData.assignmentID )
		.first()

	await knex( "exams_users" )
		.update( "HasTaken", false )
		.where( "user_id", student.id )
		.where( "exam_id", exam.id )
}

/**
 * Generates an access token using an object containing the encoded properties as the key 
 */
function generateAccessToken( object ) {
	return jwt.sign( object, jwtSecret )
}

module.exports = router
