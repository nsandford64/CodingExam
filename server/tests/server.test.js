/* eslint-disable no-undef */
const server = require( "../server.js" )
const supertest = require( "supertest" )
const requestWithSupertest = supertest( server )
const jwt = require( "jsonwebtoken" )

// instructor token used for testing
const instructorToken = jwt.sign( { assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
	userID: "aocigpqdjfi18340t8g0vajald99fa03a",
	roles: "Instructor" }, "token_secret" )

// learner token used for testing
const learnerToken = jwt.sign( { assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
	userID: "aocigpqdjfi18340t8g0vajald99fa03a",
	roles: "Learner" }, "token_secret" )

describe ( "/api/role endpoint tests", () => {
	it( "GET /api/role should return a role", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
			.set( { token: learnerToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "role" )
	} )
	
	it( "GET /api/role should return an invalid response if sent with no token", async () => {
		const res = await requestWithSupertest.get( "/api/role" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
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
		expect( res.body.questions ).not.toEqual( [] )
	} )

	it( "GET /api/questions body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { token: learnerToken } )
		expect ( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body.questions ).not.toEqual( [] )
		res.body.questions.forEach( question => {
			expect( question ).toHaveProperty( "id" )
			expect( question ).toHaveProperty( "text" )
			expect( question ).toHaveProperty( "type" )
			expect( question ).toHaveProperty( "answers" )
		} )
	} )

	it ( "GET /api/questions should return invalid request without a token", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )

	} )
} )

describe( "/api/responses endpoint tests", () => {

	it( "GET /api/responses should return list of responses", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "responses" )
		expect( res.body.responses ).not.toEqual( [] )
	} )

	it( "GET /api/responses body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "responses" )
		expect( res.body.responses ).not.toEqual( [] )
		res.body.responses.forEach( response => {
			expect( response ).toHaveProperty( "questionId" )
			expect( response ).toHaveProperty( "isText" )
			expect( response ).toHaveProperty( "value" )
		} )
	} )

	it ( "GET /api/responses should return invalid request without a token", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it ( "GET /api/responses should use the 'userID' header if the user is an instructor", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { token: instructorToken, userID: "a3alsdf9cjasq713h4jwld9c8galsdf94" } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "responses" )
		expect( res.body.responses ).not.toEqual( [] )
		res.body.responses.forEach( response => {
			expect( response ).toHaveProperty( "questionId" )
			expect( response ).toHaveProperty( "isText" )
			expect( response ).toHaveProperty( "value" )
		} )
	} )

} )

describe( "/api endpoint tests", () => {

	it( "POST /api should return a valid submission response", async () => {
		const res = await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
			.set( { token: learnerToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Valid submission" )
	} )

	it( "POST /api with no token should return invalid response", async () => {
		const res = await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid submission" )
	} )

	it( "POST /api with new data should change responses", async () => {
		await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"}, {"questionId":4,"isText":true,"value":"print(hello world)"} ] )
			.set( { token: learnerToken } )
		const old =await requestWithSupertest.get( "/api/responses" )
			.set( { token: learnerToken } )

		await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":1},{"questionId":2,"isText":false,"value":1},{"questionId":3,"isText":true,"value":"changed"}, {"questionId":4,"isText":true,"value":"print(not hello world)"} ] )
			.set( { token: learnerToken } )
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { token: learnerToken } )
		
		for( let i = 0; i < res.body.responses.length; i++ ) {
			expect( res.body.responses[i].value ).not.toEqual( old.body.responses[i].value )
		}
	} )
} )

describe( "/api/feedback endpoint tests", () => {
	it( "GET /api/feedback returns a feedback list", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "feedback" )
		expect( res.body.users ).not.toEqual( [] )
	} )

	it( "GET /api/feedback body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "feedback" )
		expect( res.body.users ).not.toEqual( [] )
		res.body.feedback.forEach( feedback => {
			expect( feedback ).toHaveProperty( "questionId" )
			expect( feedback ).toHaveProperty( "value" )
		} )
	} )

	it( "GET /api/feedback should return invalid reqeust without a token", async () => {
		const res = await requestWithSupertest.get( "/api/feedback" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it( "GET /api/feedback should use userID header if requestor is instructor, return same results as the user", async () => {
		const res1 = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: learnerToken } )
		const res2 = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: instructorToken, userid: "aocigpqdjfi18340t8g0vajald99fa03a" } )
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

describe( "/api/examtakers endpoint tests", () => {
	it( "GET /api/examtakers returns a list of users", async () => {
		const res = await requestWithSupertest.get( "/api/examtakers" )
			.set( { token: instructorToken } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "users" )
		expect( res.body.users ).not.toEqual( [] )
	} )

	it( "GET /api/examtakers body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/examtakers" )
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

	it( "GET /api/examtakers should return an invalid response if there is no token", async () => {
		const res = await requestWithSupertest.get( "/api/examtakers" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it( "GET /api/examtakers should return an invalid response if the user is not an instructor", async () => {
		const res = await requestWithSupertest.get( "/api/examtakers" )
			.set( { token: learnerToken} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )
} )

describe( "/api/instructorfeedback endpoint tests", () => {
	it( "POST /api/instructorfeedback should return a valid submission response", async () => {
		const res = await requestWithSupertest.post( "/api/instructorfeedback" )
			.send( [ { "questionId": 1, value: "Good" }, { "questionId": 2, value: "Great" }, { "questionId": 3, value: "Excelent" }, { "questionId": 4, value: "amazing" } ] )
			.set( { token: instructorToken, userid: "aocigpqdjfi18340t8g0vajald99fa03a" } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Valid submission" )
	} )

	it( "POST /api/instructorfeedback with no token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructorfeedback" )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it( "POST /api/instructorfeedback with a learner token should return an invalid response", async () => {
		const res = await requestWithSupertest.post( "/api/instructorfeedback" )
			.set( { token: learnerToken } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request: not an instructor" )
	} )

	it( "POST /api/instructorfeedback should change the feedback in the database", async () => {
		await requestWithSupertest.post( "/api/instructorfeedback" )
			.send( [ { "questionId": 1, value: "Good" }, { "questionId": 2, value: "Great" }, { "questionId": 3, value: "Excelent" }, { "questionId": 4, value: "amazing" } ] )
			.set( { token: instructorToken } )

		const old = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: instructorToken } )
		
		await requestWithSupertest.post( "/api/instructorfeedback" )
			.send( [ { "questionId": 1, value: "new good" }, { "questionId": 2, value: "new Great" }, { "questionId": 3, value: "new Excelent" }, { "questionId": 4, value: " new amazing" } ] )
			.set( { token: instructorToken } )

		const res = await requestWithSupertest.get( "/api/feedback" )
			.set( { token: instructorToken } )

		for( let i = 0; i < res.body.feedback.length; i++ ) {
			expect( res.body.feedback[i].value ).not.toEqual( old.body.feedback[i].value )
		}
	} )
} )
