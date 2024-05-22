process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require('../db');

let invoice;
let company;
beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'testing Inc', 'company for testing') RETURNING *`);
    const invResult = await db.query(`INSERT INTO invoices (comp_code, amt, add_date) VALUES ('test', 777, '2024-01-01') RETURNING *`);
    invoice = invResult.rows[0];
    company = compResult.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM companies`)
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Get all invoices", async () => {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { invoices: [{id: invoice.id, comp_code: invoice.comp_code}] } );
    })
});

describe("GET /invoices/:id", () => {
    test("Get single invoice", async () => {
        const res = await request(app).get(`/invoices/${invoice.id}`);
        expect(res.statusCode).toBe(200);
        let data = {id: invoice.id, amt: invoice.amt, paid: invoice.paid, add_date: '2024-01-01T05:00:00.000Z', paid_date: invoice.paid_date, company: company};
        expect(res.body).toEqual( { invoice: data } );
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get("/invoices/0");
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /invoices", () => {
    test("Add an invoice", async () => {
        const res = await request(app).post("/invoices").send({ comp_code: 'test', amt: 999});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual( { invoice: { id:expect.any(Number), comp_code:'test', amt:999, paid:false, add_date:expect.any(String), paid_date:null } } );
    })
});

describe("PATCH /invoices/:id", () => {
    test("Update an invoice", async () => {
        const res = await request(app).patch(`/invoices/${invoice.id}`).send({amt:333});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { invoice: { id:invoice.id, comp_code:'test', amt:333, paid:false, add_date:expect.any(String), paid_date:null } } );
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/invoices/0`).send({amt:333});
        expect(res.statusCode).toBe(404);
    })
});

describe("DELETE /invoices/:id", () => {
    test("Delete an invoice", async () => {
        const res = await request(app).delete(`/invoices/${invoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual( { status: 'deleted' } );
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).delete("/invoices/0");
        expect(res.statusCode).toBe(404);
    })
});