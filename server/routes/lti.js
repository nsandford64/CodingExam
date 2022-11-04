// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )
const fs = require( "fs" )
const { Pool } = require( "pg" )

const router = express.Router()

const credentials = {
	user: "codingexam",
	host: "localhost",
	database: "CodingExam",
	password: "password",
	port: 5432
}

// Get the main entry point to the Client app
router.get( "/", async ( req, res ) => {	
	// Some hard coded tokens for use in testing outside of canvas
	const testCanvasUserID = "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49"
	const token1 = generateAccessToken( { 
		assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
		userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
		roles: "Instructor"
	} )

	const pool = new Pool( credentials )

	/* Inserts the generated token into the sessions table in the database.
		This currently just puts a row in the database and nothing else, as tokens
		 are just used so the client can keep track of their userID, role and what 
		 assignment they are on. As we continue development, it will eventually
		be expanded to allow for checking if someone's session is valid or not
	*/
	const results = await pool.query( `
		SELECT U.UserID
		FROM "CodingExam".Users U
		WHERE U.CanvasUserID = '${testCanvasUserID}'
	` )

	const internalUserID = results.rows[0].userid

	await pool.query( `
		INSERT INTO "CodingExam".UserSessions(UserID, Token)
		VALUES(${internalUserID}, '${token1}')
		ON CONFLICT(UserID) DO UPDATE
			SET Token = '${token1}'
	` )

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
			console.log( req.body.roles )

			const pool = new Pool( credentials )

			/*Inserts the token into the sessions table of the database.
				This currently just puts a row in the database and nothing else, as tokens
				are just used so the client can keep track of their userID, role and what 
				assignment they are on. As we continue development, it will eventually
				be expanded to allow for checking if someone's session is valid or not
			*/
			const results = await pool.query( `
				SELECT U.UserID
				FROM "CodingExam".Users U
				WHERE U.CanvasUserID = '${req.body.user_id}'
			` )

			const internalUserID = results.rows[0].userid

			await pool.query( `
				INSERT INTO "CodingExam".UserSessions(UserID, Token)
				VALUES(${internalUserID}, '${token}')
				ON CONFLICT(UserID) DO UPDATE
					SET Token = '${token}'
			` )

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
