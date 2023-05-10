// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "exams" ).del()
	await knex( "exams" ).insert( [
		{ 	id: 1,
			canvas_assignment_id: "example-exam",
			show_points_possible: true }	
	] )
}
