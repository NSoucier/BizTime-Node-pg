process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require('../db');

let company;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'testing Inc', 'company for testing') RETURNING *`);
    company = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get all companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { companies: [{code: company.code, name: company.name}] } );
    })
});


describe("GET /companies/:code", () => {
    test("Get single company info", async () => {
        const res = await request(app).get("/companies/test");
        expect(res.statusCode).toBe(200);
        company.invoices = [];
        expect(res.body).toEqual( { company: company} );
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get("/companies/0");
        expect(res.statusCode).toBe(404);
    })
});


describe("POST /companies", () => {
    test("Add a company", async () => {
        const res = await request(app).post("/companies").send({code:'test2', name:'test2 Inc', description:'another testing company'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual( { company: {code:'test2', name:'test2 Inc', description:'another testing company'} } );
    })
});

describe("PATCH /companies/:code", () => {
    test("Update a company", async () => {
        const res = await request(app).patch("/companies/test").send({name:'testing Co', description:'first testing company'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { company: {code:'test', name:'testing Co', description:'first testing company'} } );
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/companies/0`).send({name:'testing Co', description:'first testing company'});
        expect(res.statusCode).toBe(404);
    })
});

describe("DELETE /companies/:code", () => {
    test("Delete a company", async () => {
        const res = await request(app).delete("/companies/test");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { status: 'deleted' } );
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).delete("/companies/0");
        expect(res.statusCode).toBe(404);
    })
});