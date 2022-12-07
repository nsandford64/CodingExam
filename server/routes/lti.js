// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )
const fs = require( "fs" )
const { Pool } = require( "pg" )

const router = express.Router()

// Credentials for PostGres database
const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

// Get the main entry point to the Client app
router.get( "/", async ( req, res ) => {	
	/*
		Some hard coded tokens for use in testing outside of canvas
		Both tokens can have the roles property changed between "Learner"
		and "Instructor" to switch between the student and instructor views

		token1 will pull up an assignment with questions, used for all but
		one of the application's functionalities
	*/
	const token1 = generateAccessToken( { 
		assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
		userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
		roles: "Instructor"
	} )

	/*
		token2 will pull up an assignment with no questions
		Used for the create an exam view in its current state
	*/
	const token2 = generateAccessToken( { 
		assignmentID: "jqpeijfpoadvpioaueouaouera",
		userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
		roles: "Learner"
	} )

	// Modifies the index.html file that is returned to the client to contain the JWT token and sends it
	fs.readFile( path.resolve( "../client/build/index.html" ), "utf8", ( err, data ) => {
		if ( err ) {
			console.error( err )
			return res.status( 500 ).send( "An error occurred" )
		}
		res.send( data.replace(
			"<div id=\"replace\"></div>",
			`window.__INITIAL_DATA__ = '${token1}'`
		) )
	} )
} )

// Handles a POST request from the LTI consumer, in this case Canvas
router.post( "/", async ( req, res ) => {
	// Creates an LTI provider object with the hardcoded key and secret
	const provider = new lti.Provider( "Codekey", "Keysecret" )

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
				// Query the database for a list of questions with a given ExamID
				const results = await pool.query( `
				SELECT 1
				FROM "CodingExam".Exam E
				WHERE E.CanvasExamID = '${req.body.ext_lti_assignment_id}'
			` )

				if( results.rows.length === 0 ) {
					await pool.query( `
					INSERT INTO "CodingExam".Exam(CanvasExamID, TotalPoints)
					VALUES('${req.body.ext_lti_assignment_id}', ${req.body.custom_canvas_assignment_points_possible})
				` )
				
				}
			}
			console.log( req.body.user_id )

			if ( req.body.roles === "Learner" ) {
				let results = await pool.query( `
					SELECT 1
					FROM "CodingExam".UserExam UE
					INNER JOIN "CodingExam".Exam E ON UE.ExamID = E.ExamID
					INNER JOIN "CodingExam".Users U ON U.UserID = UE.UserID
					WHERE E.CanvasExamID = '${req.body.ext_lti_assignment_id}' AND
						U.CanvasUserID = '${req.body.user_id}'
				` )

				if ( results.rows.length === 0 ) {
					results = await pool.query( `
						SELECT UserID
						FROM "CodingExam".Users
						WHERE CanvasUserID = $1
					`, [ req.body.user_id ] )

					const userid = results.rows[0].userid

					results = await pool.query( `
						SELECT ExamID
						FROM "CodingExam".Exam
						WHERE CanvasExamID = $1
					`, [ req.body.ext_lti_assignment_id ] )
					
					const examid = results.rows[0].examid

					await pool.query( ` 
						INSERT INTO "CodingExam".UserExam(UserID, ExamID)
						VALUES($1, $2)
					`, [ userid, examid ] )
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

//Generates an access token using an object containing the encoded properties as the key
function generateAccessToken( object ) {
	return jwt.sign( object, "token_secret" )
}

module.exports = router
