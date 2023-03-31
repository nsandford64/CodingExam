/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "student_responses" ).del()
	await knex( "student_responses" ).insert( [
		{ question_id: 1, user_id: 1, is_text_response: true, text_response: "My submission" },
		{ question_id: 2, user_id: 1, is_text_response: false, answer_response: 1 },
	] )
}
