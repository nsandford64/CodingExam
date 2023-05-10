/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.alterTable( "exam_questions", table => {
			table.boolean( "is_deleted" ).defaultTo( false )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema
		.alterTable( "exam_questions", table => {
			table.dropColumn( "is_deleted" )
		} )
}
