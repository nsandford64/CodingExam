/* eslint-disable no-undef */
const server = require( "../server.js" )
const supertest = require( "supertest" )
const requestWithSupertest = supertest( server )

describe( "/api/questions endpoint tests", () => {

	it( "GET /api/questions should return the list of questions", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8"} )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "questions" )
		expect( res.body.questions ).not.toEqual( [] )
	} )

	it( "GET /api/questions body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8"} )
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

	it ( "GET /api/questions should return invalid request without examID", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )

	} )
	
	it( "GET /api/questions body should return 3 questions (Currently, will be expanded)", async () => {
		const res = await requestWithSupertest.get( "/api/questions" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8"} )
		expect ( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body.questions ).not.toEqual( [] )
		expect( res.body.questions.length ).toEqual( 3 )
	} )
} )

describe( "/api endpoint tests", () => {

	it( "POST /api should return a valid submission response", async () => {
		const res = await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
			.set( { userID: "668ce32912fc74ec7e60cc59f32f304dc4379617", Accept: "application/json" } )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.status ).toEqual( 200 )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Valid submission" )
	} )

	it( "POST /api with no UserID header should return invalid response", async () => {
		const res = await requestWithSupertest.post( "/api" )
			.send( [ {"questionId":1,"isText":false,"value":2},{"questionId":2,"isText":false,"value":0},{"questionId":3,"isText":true,"value":"ok"} ] )
			.set( { Accept: "application/json" } )
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
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8", userID: "668ce32912fc74ec7e60cc59f32f304dc4379617" } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "responses" )
		expect( res.body.responses ).not.toEqual( [] )
	} )

	it( "GET /api/responses body should have correct properties", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8", userID: "668ce32912fc74ec7e60cc59f32f304dc4379617" } )
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

	it ( "GET /api/responses should return invalid request without userID", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { examID: "a94f149b-336c-414f-a05b-8b193322cbd8" } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it ( "GET /api/responses should return invalid request without examID", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
			.set( { userID: "668ce32912fc74ec7e60cc59f32f304dc4379617" } )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )

	it ( "GET /api/responses should return invalid request without both userID and examID", async () => {
		const res = await requestWithSupertest.get( "/api/responses" )
		expect( res.status ).toEqual( 200 )
		expect( res.type ).toEqual( expect.stringContaining( "json" ) )
		expect( res.body ).toHaveProperty( "response" )
		expect( res.body.response ).toEqual( "Invalid request" )
	} )
} )