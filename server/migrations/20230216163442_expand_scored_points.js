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
  
}
