// Copyright 2022 under MIT License
// NOTE: The grading enpoints are not tested as they depend on information
// from the Canvas LTI launch request

/* eslint-disable no-undef */
const server = require( "../serverTestEntry.js" )
const supertest = require( "supertest" )
const requestWithSupertest = supertest( server )
const jwt = require( "jsonwebtoken" )

// instructor token used for testing
const instructorToken = jwt.sign( { assignmentID: "example-exam",
	fullName: "Example Instructor",
	userID: "example-instructor",
	roles: "Instructor" }, "token_secret" )

// learner token used for testing
const learnerToken = jwt.sign( { assignmentID: "example-exam",
	fullName: "Example Learner",
	userID: "example-learner",
	roles: "Learner" }, "token_secret" )

describe ( "/api/role endpoint tests", () => {

	it( "GET /api/role should return a role", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
			.set( { token: instructorToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "role" )
	} )
	
	it( "GET /api/role should return an invalid response if sent with no token", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
		expect( res.status ).toEqual( 403 )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
	} )
	
	it( "GET /api/role with a learner token should return the correct role", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
			.set( { token: learnerToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "role" )
		expect( res.body.role ).toEqual( "Learner" )
	} )
	
	it( "GET /api/role with an instructor token should return the correct role", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
			.set( { token: instructorToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "role" )
		expect( res.body.role ).toEqual( "Instructor" )
	} )
} )

describe( "/api/questions endpoint tests", () => {

	it( "GET /api/questions should return the list of questions", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "questions" )
	} )

	it( "GET /api/questions body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { token: learnerToken } )
		expect ( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		res.body.questions.forEach( question => {
			expect( question ).toHaveProperty( "id" )
			expect( question ).toHaveProperty( "text" )
			expect( question ).toHaveProperty( "type" )
		} )
	} )

	it ( "GET /api/questions should return invalid request without a token", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
		expect( res.status ).toEqual( 403 )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )

	} )
} )

describe( "/api/submissions endpoint tests", () => {

	it( "GET /api/submissions should return list of submissions", async () => {
		const res = await requestWithSupertest.get( "/api/submissions" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "submissions" )
	} )

	it( "GET /api/submissions body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/submissions" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "submissions" )
		res.body.submissions.forEach( response => {
			expect( response ).toHaveProperty( "questionId" )
			expect( response ).toHaveProperty( "isText" )
			expect( response ).toHaveProperty( "value" )
		} )
	} )

	it ( "GET /api/submissions should return invalid request without a token", async () => {
		const res = await requestWithSupertest.get( "/api/submissions" )
		expect( res.status ).toEqual( 403 )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
	} )

	it ( "GET /api/submissions should use the 'userID' header if the user is an instructor", async () => {
		const res = await requestWithSupertest.get( "/api/submissions" )
			.set( { token: instructorToken, userID: "example-learner" } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "submissions" )
		res.body.submissions.forEach( response => {
			expect( response ).toHaveProperty( "questionId" )
			expect( response ).toHaveProperty( "isText" )
			expect( response ).toHaveProperty( "value" )
		} )
	} )

} )

describe( "/api endpoint tests", () => {

	it( "POST /api with no token should return invalid response", async () => {
		const res = await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
		expect( res.status ).toEqual( 403 )
	} )
} )

describe( "/api/feedback endpoint tests", () => {
	it( "GET /api/feedback returns a feedback list", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "feedback" )
	} )

	it( "GET /api/feedback body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "feedback" )
		res.body.feedback.forEach( feedback => {
			expect( feedback ).toHaveProperty( "questionId" )
			expect( feedback ).toHaveProperty( "value" )
		} )
	} )

	it( "GET /api/feedback should return invalid reqeust without a token", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
		expect( res.status ).toEqual( 403 )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
	} )

	it( "GET /api/feedback should use userID header if requestor is instructor, return same results as the user", async () => {
		const res1 = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		const res2 = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: instructorToken, userid: "example-learner" } )
		expect( res1.status ).toEqual( 200 )
		expect( res2.status ).toEqual( 200 )
		expect( res1.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res2.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res1.body ).toHaveProperty( "feedback" )
		expect( res2.body ).toHaveProperty( "feedback" )

		for( let i = 0; i < res1.body.feedback.length; i++ ) {
			expect( res1.body.feedback[i].questionId ).toEqual( res2.body.feedback[i].questionId )
			expect( res1.body.feedback[i].value ).toEqual( res2.body.feedback[i].value )
		}
	} )
} )

describe( "/api/instructor/examtakers endpoint tests", () => {
	it( "GET /api/instructor/examtakers returns a list of users", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/examtakers" )
			.set( { token: instructorToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "users" )
		expect( res.body.users ).not.toEqual( [] )
	} )

	it( "GET /api/instructor/examtakers body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/examtakers" )
			.set( { token: instructorToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "users" )
		expect( res.body.users ).not.toEqual( [] )
		res.body.users.forEach( user => {
			expect( user ).toHaveProperty( "canvasUserId" )
			expect( user ).toHaveProperty( "fullName" )
		} )
	} )

	it( "GET /api/instructor/examtakers should return an invalid response if there is no token", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/examtakers" )
		expect( res.status ).toEqual( 403 )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
	} )

	it( "GET /api/instructor/examtakers should return an invalid response if the user is not an instructor", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/examtakers" )
			.set( { token: learnerToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )
} )

describe( "/api/instructor/allsubmissions endpoint tests", () => {
	it( "GET /api/instructor/allsubmissions with no token should return an invalid response", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/allsubmissions" )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
		expect( res.status ).toEqual( 403 )
	} )

	it( "GET /api/instructor/allsubmissions with a learner token should return an invalid response", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/allsubmissions" )
			.set( { token: learnerToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )

	it( "GET /api/instructor/allsubmissions returns a list of submissions", async () => {
		const res = await requestWithSupertest.get( "/api/instructor/allsubmissions" )
			.set( { token: instructorToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "submissions" )
		res.body.submissions.forEach( submission => {
			expect( submission ).toHaveProperty( "questionId" )
			expect( submission ).toHaveProperty( "isText" )
			expect( submission ).toHaveProperty( "value" )
			expect( submission ).toHaveProperty( "canvasUserId" )
			expect( submission ).toHaveProperty( "fullName" )
			expect( submission ).toHaveProperty( "scoredPoints" )
		} )
	} )
} )

describe( "/api/instructor/feedback endpoint tests", () => {

	it( "POST /api/instructor/feedback with no token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructor/feedback" )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
		expect( res.status ).toEqual( 403 )
	} )

	it( "POST /api/instructor/feedback with a learner token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructor/feedback" )
			.set( { token: learnerToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )
} )

describe( "/api/instructor/createexam endpoint tests", () => {
	
	it( "POST to /api/instructor/createexam with no token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructor/createexam" )
		expect( res.type ).toEqual( expect.stringContaining( "text/plain" ) )
		expect( res.status ).toEqual( 403 )
	} )

	it( "POST to /api/instructor/createexam with a learner token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructor/createexam" )
			.set( { token: learnerToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )	
} )
