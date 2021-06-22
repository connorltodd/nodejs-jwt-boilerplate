require('dotenv').config();
const mysql = require('mysql');

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection(config);

connection.connect((error) => {
  error
    ? console.log(error)
    : console.log(`Connected to database at port: ${connection.threadId}`);
});

module.exports = connection;
