const jwt = require( "jsonwebtoken" )

// The secret for signing Json Web Tokens
const jwtSecret = process.env.CODING_EXAM_JWT_SECRET

function auth( req, res, next ) {
	const token = req.headers.token
	
  // Send an unauthorized request response if the request doesn't have a token
	if ( !token ) res.sendStatus( 403 )

	// Decodes the token and returns the role contained within it
	// Store these in the req.session so they are available 
	// in downstream methods
	else jwt.verify( token, jwtSecret, ( err, object ) => {
		if(err) {
			console.error(err);
			res.sendStatus(403)
			return
		}
		req.session = {
			role: object.roles,
			assignmentID: object.assignmentID,
			userID: object.userID
		} 
		next()
  }) 
}

module.exports = auth;