const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        res.json({ companies: results.rows })
    } catch (e) {
        next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const comp = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        if (comp.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of '${code}'`, 404);
        }

        const invoices = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [code]);

        const invs = invoices.rows.map(val => val.id);

        const company = {
            code: comp.rows[0].code,
            name: comp.rows[0].name,
            description: comp.rows[0].description,
            invoices: invs
        };

        res.json({ company: company })
    } catch (e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        next(e);
    }
});

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of '${code}'`, 404);
        }
        res.json({ company: results.rows[0] })
    } catch (e) {
        next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING *`, [code]);
        console.log(results.rows)

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of '${code}'`, 404);
        }
        res.json({ status: "deleted" })
    } catch (e) {
        next(e);
    }
});

module.exports = router;