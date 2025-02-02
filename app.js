const express = require("express");
const { Client } = require("pg");  // Import PostgreSQL client
const app = express();
app.use(express.json()); // Allows JSON in requests

// Connect to PostgreSQL using environment variables
const client = new Client({
    host: process.env.PGHOST,  // Database host from Render's environment variables
    port: process.env.PGPORT,  // Usually 5432
    user: process.env.PGUSER,  // Database user from Render's environment variables
    password: process.env.PGPASSWORD,  // Database password from Render's environment variables
    database: process.env.PGDATABASE,  // Database name from Render's environment variables
});

client.connect()
    .then(() => {
        console.log("Connected to PostgreSQL!");
    })
    .catch((err) => {
        console.error("Error connecting to PostgreSQL", err);
    });

// Save account data to PostgreSQL
app.post("/saveAccount", (req, res) => {
    const { username, password, firstName, lastName, money } = req.body;

    // Insert data into the database
    const query = "INSERT INTO users (username, password, firstName, lastName, money) VALUES ($1, $2, $3, $4, $5)";
    const values = [username, password, firstName, lastName, money];

    client.query(query, values)
        .then(() => {
            res.send("✅ Account saved successfully!");
        })
        .catch((err) => {
            console.error("Error saving account data", err);
            res.status(500).send("❌ Error saving account data.");
        });
});

// Get all accounts from PostgreSQL
app.get("/getAccounts", (req, res) => {
    client.query("SELECT * FROM users")
        .then((result) => {
            res.json(result.rows);  // Send back user data as JSON
        })
        .catch((err) => {
            console.error("Error fetching accounts", err);
            res.status(500).send("❌ Error fetching accounts.");
        });
});

// Start server
const PORT = process.env.PORT || 3000; // Render requires process.env.PORT
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
