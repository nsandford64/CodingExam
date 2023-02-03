// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.alterTable( "student_responses", table => {
			table.decimal( "confidence_rating" )
		} )
		.alterTable( "exams_users", table => {
			table.datetime( "started_at" ).defaultTo( knex.fn.now() )
			table.datetime( "finished_at" )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "student_responses", table => {
			table.dropColumn( "confidence_rating" )
		} )
		.alterTable( "exams_users", table => {
			table.dropColumn( "started_at" ).defaultTo( knex.fn.now() )
			table.dropColumn( "finished_at" )
		} )
}
