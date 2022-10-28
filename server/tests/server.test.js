/* eslint-disable no-undef */
const server = require( "../server.js" )
const supertest = require( "supertest" )
const requestWithSupertest = supertest( server )
const jwt = require( "jsonwebtoken" )

// instructor token used for testing
const instructorToken = jwt.sign( { assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
	userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
	roles: "Instructor" }, "token_secret" )

// learner token used for testing
const learnerToken = jwt.sign( { assignmentID: "01cf10c5-f5d3-466e-b716-53f2b0bcd3b4",
	userID: "2b7a2ea9f28bc312753640b0c1cc537fa85c5a49",
	roles: "Learner" }, "token_secret" )

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
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
			.set( { userID: "668ce32912fc74ec7e60cc59f32f304dc4379617", Accept: "application/json" } )
		const old =await requestWithSupertest.get( "/api/responses" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8", userID: "668ce32912fc74ec7e60cc59f32f304dc4379617" } )

		await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":1},{"questionId":2,"isText":false,"value":1},{"questionId":3,"isText":true,"value":"changed"} ] )
			.set( { userID: "668ce32912fc74ec7e60cc59f32f304dc4379617", Accept: "application/json" } )
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8", userID: "668ce32912fc74ec7e60cc59f32f304dc4379617" } )
		
		for( let i = 0; i < res.body.responses.length; i++ ) {
			expect( res.body.responses[i].value ).not.toEqual( old.body.responses[i] )
		}
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

describe( "/api/examtakers endpoint tests", () => {
	it( "GET /api/examtakers returns a list of users", async () => {
		const res = await requestWithSupertest.get( "/api/examtakers" )
			.set( { token: instructorToken} )
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
			expect( user ).toHaveProperty( "canvasuserid" )
			expect( user ).toHaveProperty( "fullname" )
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

describe ( "/api/examtakers endpoint tests", () => {

} )