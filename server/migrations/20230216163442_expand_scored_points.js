// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function( knex ) {
	await knex.raw( "ALTER TABLE exam_questions ADD points_possible integer" )
	await knex.raw( "ALTER TABLE student_responses ADD scored_points integer" )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "exam_questions", table => {
			table.dropColumn( "points_possible" )
		} )
		.alterTable( "student_responses", table => {
			table.dropColumn( "scored_points" )
		} )
}
