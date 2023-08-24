// Copyright 2022 under MIT License
const createError = require( "http-errors" )
const express = require( "express" )
const path = require( "path" )
const cookieParser = require( "cookie-parser" )
const bodyParser = require( "body-parser" )
const logger = require( "morgan" )
const cors = require( "cors" )

const app = express()

// Turn off browser caching
app.disable( "etag" )

// Require routers
const apiRouter = require( "./routes/api" )
const ltiRouter = require( "./routes/lti" )
const instructorRouter = require( "./routes/instructor" )

// View engine setup
app.set( "views", path.join( __dirname, "views" ) )
app.set( "view engine", "jade" )

app.use( cors() )
app.use( logger( "dev" ) )
app.use( express.json({limit: "200kb"}) )
app.use( express.urlencoded( { extended: false } ) )
app.use( bodyParser.urlencoded( {extended: false} ) )
app.use( cookieParser() )

// Setup routers for the app
app.use( ltiRouter )
app.use( "/api", apiRouter )
app.use( "/api/instructor", instructorRouter )
app.use( express.static( path.join( __dirname, "../client/build/" ) ) )

// Catch 404 and forward to error handler
app.use( function( req, res, next ) {
	next( createError( 404 ) )
} )

// Error handler
app.use( function( err, req, res ) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get( "env" ) === "development" ? err : {}

	// render the error page
	res.status( err.status || 500 )
	res.render( "error" )
} )


module.exports = app
