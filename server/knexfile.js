// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	client: "pg",
	connection: {
		host: process.env.CODING_EXAM_DB_HOST || "localhost",
		port: process.env.CODING_EXAM_DB_PORT || 5432,
		user: process.env.CODING_EXAM_DB_USER,
		password: process.env.CODING_EXAM_DB_PASSWORD,
		database: process.env.CODING_EXAM_DB_NAME
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: "migrations"
	}
}
