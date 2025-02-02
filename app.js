// Import necessary modules
const express = require("express");
const { Client } = require("pg");  // PostgreSQL client for Node.js
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json()); 

// Create the PostgreSQL client using environment variables
const client = new Client({
    host: process.env.PGHOST,  // Database host
    port: process.env.PGPORT,  // Database port, typically 5432
    user: process.env.PGUSER,  // Database username
    password: process.env.PGPASSWORD,  // Database password
    database: process.env.PGDATABASE,  // Database name
});

// Connect to the PostgreSQL database
client.connect()
    .then(() => {
        console.log("Connected to PostgreSQL database!");
    })
    .catch((err) => {
        console.error("Error connecting to PostgreSQL", err);
    });

// Create the 'users' table if it doesn't exist
client.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        money INTEGER DEFAULT 0
    );
`)
    .then(() => {
        console.log("Users table created or already exists.");
    })
    .catch((err) => {
        console.error("Error creating users table", err);
    });

// Save account data to the PostgreSQL database
app.post("/saveAccount", (req, res) => {
    const { username, password, firstName, lastName, money } = req.body;

    // SQL query to insert data into the 'users' table
    const query = `
        INSERT INTO users (username, password, firstName, lastName, money) 
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [username, password, firstName, lastName, money];

    // Execute the query
    client.query(query, values)
        .then(() => {
            res.send("✅ Account saved successfully!");
        })
        .catch((err) => {
            console.error("Error saving account data", err);
            res.status(500).send("❌ Error saving account data.");
        });
});

// Get all accounts from the PostgreSQL database
app.get("/getAccounts", (req, res) => {
    // SQL query to select all users from the 'users' table
    client.query("SELECT * FROM users")
        .then((result) => {
            res.json(result.rows);  // Send the result as JSON
        })
        .catch((err) => {
            console.error("Error fetching accounts", err);
            res.status(500).send("❌ Error fetching accounts.");
        });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

