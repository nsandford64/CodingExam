// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "users" ).del()
	await knex( "users" ).insert( [
		{ canvas_user_id: "example-learner", full_name:"Example Learner", family_name:"Example Learner", given_name:"Example Learner", email:"examplelearner@example.com"},
		{ canvas_user_id: "example-instructor", full_name:"Example Instructor", family_name:"Example Instructor", given_name:"Example Instructor", email:"exampleinstructor@example.com"}
	] )
}
