/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "exam_questions" ).del()
	await knex( "exam_questions" ).insert( [
		{ question_text: "Example Question 1", question_type_id: 2, exam_id: 1, points_possible: 5 },
		{ question_text: "Example Question 2", question_type_id: 1, exam_id: 1, points_possible: 5, answer_data: {"correctAnswer":1,"answers":[ "a","b" ]} },
	] )
}
