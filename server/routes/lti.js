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

if( !( key && secret ) ) {
	throw "Missing LTI client key and/or secret environment variables."
}

const provider = new lti.Provider( key, secret )

// Credentials for PostGres database
const credentials = require( "../knexfile" ).connection

/*
	Some hard coded users and tokens for use in testing outside of canvas
	Both tokens can have the roles property changed between "Learner"
	and "Instructor" to switch between the student and instructor views
*/
if( process.env.NODE_ENV == "development" ) {
	
	/*
	 * Get the main entry point to the Client app
	 */
	router.get( "/", ( req, res ) => {	
		res.send( `<h1>Debug access</h1>
			<ul>
				<li><a href="/learner">Learner Entry Point</a></li>
				<li><a href="/instructor">Instructor Entry Point</a></li>
			</ul>
		` )
	} )

	/*
	 * Loads the app as an instructor
	 */
	router.get( "/instructor", async ( req, res ) => {
		const knex = req.app.get( "db" )
		const ltiData = { 
			assignmentID: "example-exam",
			fullName: "Example Instructor",
			userID: "example-instructor",
			roles: "Instructor"
		}
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

/*
 * Handles a POST request from the LTI consumer, in this case Canvas
 */ 
router.post( "/", async ( req, res ) => {
	const knex = req.app.get( "db" )
	
	//TODO: ASK NATHAN IF THIS IS OK TO HAVE FOR DEVELOPMENT
	//TODO: ALSO ASK IF WE SHOULD STORE THE LIS STUFF IN LTI DATA
	if ( process.env.NODE_ENV == "development" ) {
		req.connection.encrypted = true
	}
	provider.valid_request( req, async ( err, isValid ) => {
		// If the request is invalid, the console logs an error, else it returns a message to the LTI provider
		if ( !isValid ) {
			console.error( err )
			console.log( req.protocol )
			console.log( req.headers )
			console.error( req.body )
			res.status( 401 ).send( "Unauthorized request" )
		}	
		else {
			const ltiData = { 
				assignmentID: req.body.ext_lti_assignment_id,
				userID: req.body.user_id,
				roles: req.body.roles,
				fullName: req.body.lis_person_name_full,
				familyName: req.body.lis_person_name_family,
				givenName: req.body.lis_person_name_given,
				email: req.body.lis_person_contact_email_primary
			}
			await findOrCreateUser( knex, ltiData )
			if( ltiData.roles === "Instructor" ) {
				await createExam( knex, ltiData.assignmentID )
			}
			if ( ltiData.roles === "Learner" ) {
				const resultSourcedid = req.body.lis_result_sourcedid
				const outcomeServiceUrl = req.body.lis_outcome_service_url
				await storeGradeInfo( knex, ltiData, resultSourcedid, outcomeServiceUrl )
			}
			
			// TODO: If student, create users_exams to start exam timer and save 
			// passback url and result sourcedid so we can submit grades
			// const resultSourcedid = req.body.lis_result_sourcedid;
			// const outcomeServiceUrl = req.body.lis_outcome_service_url;
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
	const filter = await knex
		.select( "exam_id", "user_id" )
		.from( "exams_users" )
		.innerJoin( "exams", "exams.id", "exams_users.exam_id" )
		.innerJoin( "users", "users.id", "exams_users.user_id" )
		.where( {
			canvas_assignment_id: ltiData.assignmentID,
			canvas_user_id: ltiData.userID
		} )

	const result = await knex
		.update( { result_sourcedid: resultSourcedid, outcome_service_url: outcomeServiceUrl } )
		.where( { 
			exam_id: filter[0].exam_id,
			user_id: filter[0].user_id 
		} )
		.from( "exams_users" )
	console.log( result )
}

/**
 * Create an exam for the canvas assignment, if one does not yet exist
 * @param {Knex} knex - the database connection
 * @param {int} canvasAssignmentID - the canvas assignment id
 */
async function createExam( knex, canvasAssignmentID ){
	// Try creating an exam. Since the column canvas_exam_id is unique
	// if one already exists, this will fail
	try {
		await knex( "exams" ).insert( {
			canvas_assignment_id: canvasAssignmentID
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
	
/**
 * Generates an access token using an object containing the encoded properties as the key 
 */
function generateAccessToken( object ) {
	return jwt.sign( object, "token_secret" )
}

module.exports = router
