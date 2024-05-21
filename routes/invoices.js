const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        res.json({ invoices: results.rows })
    } catch (e) {
        next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices JOIN companies ON invoices.comp_code=companies.code WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of '${id}'`, 404);
        }
        const info = results.rows[0];
        const invoice = {
            id: info.id,
            amt: info.amt,
            paid: info.paid,
            add_date: info.add_date,
            paid_date: info.paid_date,
            company: {
                code: info.code,
                name: info.name, 
                description: info.description
            }
        };
        res.json({invoice: invoice})
    } catch (e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of '${id}'`, 404);
        }
        res.json({ invoice: results.rows[0] })
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING *`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of '${id}'`, 404);
        }
        res.json({ status: "deleted" })
    } catch (e) {
        next(e);
    }
});

module.exports = router;