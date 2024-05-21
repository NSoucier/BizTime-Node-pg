/** BizTime express application. */

const express = require("express");
const app = express();
const compRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');
const ExpressError = require("./expressError");

// Parse request bodies for JSON
app.use(express.json());

app.use("/companies", compRoutes);
app.use('/invoices', invoiceRoutes);

/** 404 handler */
app.use(function(req, res, next) {
  return new ExpressError("Not Found", 404);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err.message
  });
});

module.exports = app;