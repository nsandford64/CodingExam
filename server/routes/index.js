// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()

// Get homepage for the Express app
router.get( "/", function( req, res ) {
	res.render( "index", { title: "Express" } )
} )

module.exports = router
