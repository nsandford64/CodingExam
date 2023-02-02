/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "exams" ).del()
	await knex( "exams" ).insert( [
		{ canvas_assignment_id: "example-exam" }	
	] )
}
