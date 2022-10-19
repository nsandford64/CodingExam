// Copyright 2022 under MIT License
const express = require( "express" )
const lti = require( "ims-lti" )
const path = require( "path" )
const jwt = require( "jsonwebtoken" )

const router = express.Router()

router.get( "/", ( req, res ) => {
	res.sendFile( path.join( __dirname, "../../client/build/index.html" ) )
} )


/* Handles a POST request from the LTI consumer, in this case Canvas */
router.post( "/", ( req, res ) => {
	//creates an LTI provider object with the hardcoded key and secret
	const provider = new lti.Provider( "Codekey", "Keysecret" )

	//sets the requests encrypted connection property to true since the app is running through a proxy
	req.connection.encrypted = true
	provider.valid_request( req, ( err, isValid ) => {
		//if the request is invalid, the console logs an error, else it returns a message to the LTI provider
		if ( !isValid ) {
			console.error( err )
			res.status( 401 ).send( "Unauthorized" )
		}
		else {
			console.log( "valid request" )
			const token = generateAccessToken( { 
				assignmentID: req.body.ext_lti_assignment_id,
				username: req.body.user_id
			} )
            
			jwt.verify( token, "token_secret", ( assignmentID, username ) => {
				console.log( assignmentID )
				console.log( username )        
			} )

			res.setHeader( "content-type", "text/html" )
			res.setHeader( "token", token )
			res.sendFile( path.join( __dirname, "../../client/build/index.html" ) )

		}
	} )
} )

function generateAccessToken( object ) {
	return jwt.sign( object, "token_secret" )
}

module.exports = router
