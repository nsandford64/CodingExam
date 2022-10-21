// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )

const router = express.Router()

// Get the main entry point to the Client app
router.get( "/", ( req, res ) => {
	res.sendFile( path.join( __dirname, "../../client/build/index.html" ) )
} )

// Handles a POST request from the LTI consumer, in this case Canvas
router.post( "/", ( req, res ) => {
	// Creates an LTI provider object with the hardcoded key and secret
	const provider = new lti.Provider( "Codekey", "Keysecret" )

	// Sets the requests encrypted connection property to true since the app is running through a proxy
	req.connection.encrypted = true
	provider.valid_request( req, ( err, isValid ) => {
		// If the request is invalid, the console logs an error, else it returns a message to the LTI provider
		if ( !isValid ) {
			console.error( err )
			res.status( 401 ).send( "Unauthorized" )
		}
		else {
			console.log( "valid request" )

			res.setHeader( "content-type", "text/html" )
			res.sendFile( path.join( __dirname, "../../client/build/index.html" ) )

		}
	} )
} )

module.exports = router
