// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.alterTable( "exams_users", table => {
			table.string( "outcome_service_url" )
			table.string( "result_sourcedid" )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "exams_users", table => {
			table.dropColumn( "outcome_service_url" )
			table.dropColumn( "result_sourcedid" )
		} )
}
