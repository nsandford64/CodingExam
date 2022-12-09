// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )
const fs = require( "fs" )
const { Pool } = require( "pg" )
const { default: knex } = require("knex")
const app = require("../app")
const { setDefaultResultOrder } = require("dns/promises")

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

// Credentials for PostGres database
const credentials = require('../knexfile').connection

/*
	Some hard coded users and tokens for use in testing outside of canvas
	Both tokens can have the roles property changed between "Learner"
	and "Instructor" to switch between the student and instructor views
*/
console.log("NODE_ENV", process.env.NODE_ENV)
if(process.env.NODE_ENV == 'development') {
	
	// Get the main entry point to the Client app
router.get( "/", ( req, res ) => {	
	res.send(`<h1>Debug access</h1>
		<ul>
			<li><a href="/learner">Learner Entry Point</a></li>
			<li><a href="/instructor">Instructor Entry Point</a></li>
		</ul>
	`)
	
	})

	router.get( "/instructor", async ( req, res ) => {
		const knex = req.app.get('db')
		const ltiData = { 
			assignmentID: "example-exam",
			fullName: "Example Instructor",
			userID: "example-instructor",
			roles: "Instructor"
		}
		console.log("Logging in as Learner", ltiData)
		await findOrCreateUser(knex, ltiData.userID, ltiData.fullName)
		await createExam(knex, ltiData.assignmentID)
		const token = generateAccessToken(ltiData)
		serveIndex(res, token)
	})

	router.get( "/learner", async ( req, res ) => {
		const knex = req.app.get('db')
		const ltiData = { 
			assignmentID: "example-exam",
			fullName: "Example Learner",
			userID: "example-learner",
			roles: "Learner"
		}
		console.log("Logging in as Learner", ltiData)
		await findOrCreateUser(knex, ltiData.userID, ltiData.fullName)
		const token = generateAccessToken(ltiData)
		serveIndex(res, token)
	})

} else {
	// If we aren't in development mode, we need to explicitly 
	// override the index route, or the static index.html will be 
	// served instead.
	router.get('/', (req, res) => res.sendStatus(404));
}

// Handles a POST request from the LTI consumer, in this case Canvas
router.post( "/", async ( req, res ) => {
	

	// Sets the requests encrypted connection property to true since the app is running through a proxy
	req.connection.encrypted = true
	provider.valid_request( req, async ( err, isValid ) => {
		// If the request is invalid, the console logs an error, else it returns a message to the LTI provider
		if ( !isValid ) {
			console.error( err )
			res.status( 401 ).send( "Unauthorized" )
		}
		else {
			//Generates a token for the user
			const token = generateAccessToken( { 
				assignmentID: req.body.ext_lti_assignment_id,
				userID: req.body.user_id,
				roles: req.body.roles
			} )

			const pool = new Pool( credentials )

			if ( req.body.roles === "Instructor" ) {
				// Query the database for a list of questions with a given assignmentID
				const results = await pool.query( `
				SELECT 1
				FROM Exam E
				WHERE E.CanvasassignmentID = '${req.body.ext_lti_assignment_id}'
			` )

				if( results.rows.length === 0 ) {
					await pool.query( `
					INSERT INTO Exam(CanvasassignmentID, TotalPoints)
					VALUES('${req.body.ext_lti_assignment_id}', ${req.body.custom_canvas_assignment_points_possible})
				` )
				
				}
			}

			if ( req.body.roles === "Learner" ) {
				const results = await pool.query( `
					SELECT U.UserID, E.assignmentID
					FROM UserExam UE
					INNER JOIN Exam E ON UE.assignmentID = E.assignmentID
					INNER JOIN Users U ON U.UserID = UE.UserID
					WHERE E.CanvasassignmentID = '01cf10c5-f5d3-466e-b716-53f2b0bcd3b4' AND
						U.CanvasUserID = '2b7a2ea9f28bc312753640b0c1cc537fa85c5a49'
				` )

				if ( results.rows.length === 0 ) {
					await pool.query( ` 
						INSERT INTO UserExam(UserID, assignmentID)
						VALUES(${results.rows[0].userid}, ${results.rows[0].assignmentID})
					` )
				}
			}

			await pool.end()

			// Modifies the index.html file that is returned to the client to contain the JWT token and sends it
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
	} )
} )

async function serveIndex(res, token) {
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

async function createExam(knex, canvasAssignmentID){
	// Try creating an exam. Since the column canvas_exam_id is unique
	// if one already exists, this will fail
	try {
		await knex('exams').insert({
			canvas_assignment_id: canvasAssignmentID
		})
	} catch(_err) {}
}

// Returns the database id of the user with the corresponding
// canvas user id, or generates a new user if one does not exist
async function findOrCreateUser(knex, canvasUserId, fullName){
	var user = await knex('users')
		.where('canvas_user_id', canvasUserId)
		.first()
	console.log(user);
	if(!user) user = await knex('users')
		.returning('id')
		.insert({
			canvas_user_id: canvasUserId,
			full_name: fullName
		})
	console.log('result', setDefaultResultOrder)
	return user.id
}
	
//Generates an access token using an object containing the encoded properties as the key
function generateAccessToken( object ) {
	return jwt.sign( object, "token_secret" )
}

module.exports = router
