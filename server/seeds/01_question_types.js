// Copyright 2022 under MIT License
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function( knex ) {
	// Deletes ALL existing entries
	await knex( "question_types" ).del()
	await knex( "question_types" ).insert( [
		{id: 1, question_type: "MultipleChoice"},
		{id: 2, question_type: "ShortAnswer"},
		{id: 3, question_type: "TrueFalse"},
		{id: 4, question_type: "CodingAnswer"},
		{id: 5, question_type: "ParsonsProblem"}
	] )
}



