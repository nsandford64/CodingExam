// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.createTable( "users", function( table ){
			table.increments( "id" ).primary()
			table.string( "canvas_user_id" ).unique().index()
			table.string( "full_name" )
			table.string( "family_name" )
			table.string( "given_name" )
			table.string( "email" )
		} )
		.createTable( "exams", function( table ){
			table.increments( "id" ).primary()
			table.string( "canvas_assignment_id" ).unique().index()
			table.integer( "total_points" ).notNullable().defaultTo( 100 )
		} )
		.createTable( "exams_users", function( table ){
			table.integer( "exam_id" ).index().references( "id" ).inTable( "exams" )
			table.integer( "user_id" ).index().references( "id" ).inTable( "users" )
			table.integer( "ScoredPoints" )
			table.boolean( "HasTaken" ).notNullable().default( false )  
			table.primary( [ "user_id", "exam_id" ] )
		} )
		.createTable( "question_types", function( table ){
			table.increments( "id" ).primary()
			table.string( "question_type", 30 ).notNullable()
		} )
		.createTable( "exam_questions", function( table ){
			table.increments( "id" ).primary()
			table.string( "question_text" ).notNullable().default( "" )
			table.integer( "question_type_id" ).references( "id" ).inTable( "question_types" )
			table.json( "answer_data" )
			table.integer( "exam_id" ).references( "id" ).inTable( "exams" )
		} )
		.createTable( "student_responses", function( table ){
			table.increments( "id" ).primary()
			table.integer( "question_id" ).references( "id" ).inTable( "exam_questions" )
			table.integer( "user_id" ).references( "id" ).inTable( "users" )
			table.boolean( "is_text_response" ).notNullable()
			table.string( "text_response" )
			table.integer( "answer_response" )
			table.string( "instructor_feedback" )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.dropTable( "student_responses" )
		.dropTable( "question_answers" )
		.dropTable( "exam_questions" )
		.dropTable( "question_types" )
		.dropTable( "exams_users" )
		.dropTable( "exams" )
		.dropTable( "users" )
}
