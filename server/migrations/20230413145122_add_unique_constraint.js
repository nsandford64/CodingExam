/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function( knex ) {
	
	/** 
	 * WARNING: this will delete all duplicate submission values from the student_responses table
	 * This will keep the latest submission for each question for each student and delete all of the other submissions 
	 * from that student for that question
	 * */ 
	await knex.raw( "delete from student_responses where (question_id, id) not in (select DISTINCT ON(question_id) question_id, id from student_responses order by question_id, id DESC);" )

	return knex.schema
		.alterTable( "student_responses", table => {
			table.unique( [ "question_id", "user_id" ] )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "student_responses", table => {
			table.dropUnique( [ "question_id", "user_id" ] )
		} )
}
