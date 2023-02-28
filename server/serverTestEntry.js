// Copyright 2022 under MIT License
//This is the entry point for testing the app through Jest
// /bin/www is the entry point for the app in production/development

// Create the app
const app = require( "./app" )
const knex = require( "knex" )
const knexConfig = {
	client: "pg",
	connection: {
		host: process.env.CODING_EXAM_DB_HOST || "localhost",
		port: 6543,
		user: process.env.CODING_EXAM_DB_TEST_USER,
		password: process.env.CODING_EXAM_DB_TEST_PASSWORD,
		database: process.env.CODING_EXAM_TESTDB_NAME
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: "migrations"
	}
}

async function setup() {
	const db = knex( knexConfig )
	app.set( "db", db )

	// Migrate Database on Startup
	const version = await db.migrate.currentVersion()
	//console.log( "Database Migration Version: " + version )
	if ( version == "none" ) {
		console.log( "Database Empty - Migrating and Seeding" )
		await db.migrate.latest()
		await db.seed.run()
		console.log( "Done" )
	} else {
		console.log( "Database Exists - Migrating" )
		await db.migrate.latest()
		console.log( "Migrations Complete!" )
	}
}

setup()

// Start listening for requests on port 9000
app.listen( 9000, () => console.log( "Listening on port 9000" ) )

module.exports = app