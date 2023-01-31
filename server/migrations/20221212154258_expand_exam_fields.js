/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function( knex ) {
	await knex.raw( "ALTER TABLE exam_questions ALTER COLUMN question_text TYPE text" )
	await knex.raw( "ALTER TABLE student_responses ALTER COLUMN text_response TYPE text" )
	await knex.raw( "ALTER TABLE student_responses ALTER COLUMN instructor_feedback TYPE text" )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) { 
}
