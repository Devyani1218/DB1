require('dotenv').config();   //Configuring Environment variable

const { Pool } = require('pg')   //connection pool to manage database connections efficiently.

const isproduction = process.env.NODE_ENV === "production" // Checking if server is on production or development 

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`  /// accessing Database configuartion using Environment variable 

const pool = new Pool({
    connectionString : isproduction ? process.env.DATABASE_URL : connectionString
})      /// is server on production then parse the db url

module.exports = { pool } ///export pool variable outside the file 
