// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )
const fs = require( "fs" )

const router = express.Router()

// Get the main entry point to the Client app
router.get( "/", async ( req, res ) => {	
	// Some hard coded tokens for use in testing outside of canvas
	const token1 = generateAccessToken( { 
		assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
		userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
		roles: "Instructor"
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
