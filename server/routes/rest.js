// Copyright 2022 under MIT License
const express = require( "express" )
const router = express.Router()
const ai = require('../helpers/ai')
const { ChatCompletionRequestMessageRoleEnum } = require("openai")

// Get a list of all student responses for a given exam
router.get( "/exam/:examId/questions/:questionId/submissions", async ( req, res ) => {
	let {examId, questionId} = req.params
	const knex = req.app.get( "db" )

	const results = await knex.select( "*" )
		.from( "student_responses" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.id", examId )
    .where( "exam_questions.id", questionId )
    .orderBy( "users.id")

	// Map all result rows into an array of Submissions objects
	const submissions = results.map( row => {
		return {
			questionId: row.question_id,
      userId: row.user_id,
			canvasUserId: row.canvas_user_id,
			fullName: row.full_name,
			isText: row.is_text_response,
			value: row.is_text_response ? row.text_response : row.answer_response,
      feedback: row.instructor_feedback,
			scoredPoints: row.scored_points || 0
		}
	} )

	// Send an array of Responses to the Client
	res.send( {submissions} )
} )

// Get a list of responses for a given exam and user
router.get( "/exam/:examId/user/:userId/submissions", async ( req, res ) => {
	let {examId, userId} = req.params
	const knex = req.app.get( "db" )

	const results = await knex.select( "*" )
		.from( "student_responses" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.id", examId )
		.where( "users.id", userId )
    .orderBy( "exam_questions.id")

	// Map all result rows into an array of Submissions objects
	const submissions = results.map( row => {
		return {
			questionId: row.question_id,
			isText: row.is_text_response,
			value: row.is_text_response ? row.text_response : row.answer_response,
			canvasUserId: row.canvas_user_id,
			fullName: row.full_name,
			scoredPoints: row.scored_points || 0
		}
	} )

	// Send an array of Responses to the Client
	res.send( {submissions} )
} )

// Use ai to grade all student responses for a given exam question
router.get( "/exam/:examId/questions/:questionId/ai", async ( req, res ) => {
	let {examId, questionId} = req.params
	const knex = req.app.get( "db" )

	const results = await knex.select( "student_responses.id as response_id", "*" )
		.from( "student_responses" )
		.innerJoin( "users", "users.id", "student_responses.user_id" )
		.innerJoin( "exam_questions", "exam_questions.id", "student_responses.question_id" )
		.innerJoin( "exams", "exams.id", "exam_questions.exam_id" )
		.where( "exams.id", examId )
    .where( "exam_questions.id", questionId )
    .orderBy( "users.id")

  let data = []
  for(var result of results) {
    const question = result.question_text
    const answer = result.text_response
    const {grade, feedback} = await ai.evaluate(question, answer)
    const points = parseInt((grade/100) * result.points_possible)
    await knex('student_responses')
      .update({
        'instructor_feedback': feedback,
        'scored_points': points
      })
      .where('id', result.response_id)  
    data.push({ question, answer, grade, points, feedback })
  }

  res.send({data})

});

// Grade a specific student responses for a given exam question
router.get( "/exam/:examId/questions/:questionId/user/:canvasUserId/grade/:points", async ( req, res ) => {
	let {examId, questionId, canvasUserId, points} = req.params
	const knex = req.app.get( "db" )

	const {userId} = await knex('users')
		.select("id as userId")
		.where("canvas_user_id", canvasUserId)
		.first()

	await knex('student_responses')
      .update({
        'scored_points': parseInt(points)
      })
      .where('user_id', userId)
			.where('question_id', questionId)

  res.send(`Set to ${points} points`)
});


module.exports = router;