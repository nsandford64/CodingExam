/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.alterTable( "student_responses", table => {
			table.unique( [ "question_id", "user_id" ] )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "student_responses", table => {
			table.dropUnique( [ "question_id", "user_id" ] )
		} )
}
