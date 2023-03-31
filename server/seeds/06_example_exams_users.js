/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "exams_users" ).del()
	await knex( "exams_users" ).insert( [
		{ exam_id: 1, user_id: 1, HasTaken: false }
	] )
}
