/** Database setup for BizTime. */

const { Client } = require("pg");
const password = require('./secrets');

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://soucier:${password}@127.0.0.1:5432/biztime_test`;
} else {
  DB_URI = `postgresql://soucier:${password}@127.0.0.1:5432/biztime`;
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;