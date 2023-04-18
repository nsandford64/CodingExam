/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function( knex ) {
	return knex.schema
		.alterTable( "exams", table => {
			table.boolean( "show_points_possible" )
		} )
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function( knex ) {
	return knex.schema   
		.alterTable( "exams", table => {
			table.dropColumn( "show_points_possible" )
		} )
}
