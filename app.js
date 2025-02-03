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
        publicUsername VARCHAR(100) NOT NULL,
        phoneNumber VARCHAR(15) NOT NULL,  -- Changed from INT to VARCHAR(15)
        email VARCHAR(100) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        money NUMERIC(10, 2) NOT NULL DEFAULT 0.00
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
        INSERT INTO users (username, password, publicUsername, phoneNumber, email firstName, lastName, money) 
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

app.get("/getUsers", (req, res) => {
    client.query("SELECT firstname, lastname, publicUsername FROM users")
        .then((result) => {
            // Map the results to a single string per user
            const users = result.rows.map(row => `${row.firstname} ${row.lastname}`);
            res.json(users);
        })
        .catch((err) => {
            console.error("Error fetching accounts", err);
            res.status(500).send("❌ Error getting fellow bankers.");
        });
});

// Add authenticate route to check username and password
app.post("/authenticate", (req, res) => {
    const { username, password } = req.body;

    // SQL query to check if the user exists with the provided username and password
    const query = `
        SELECT * FROM users WHERE username = $1 AND password = $2
    `;
    const values = [username, password];

    // Execute the query
    client.query(query, values)
        .then((result) => {
            if (result.rows.length > 0) {
                // If the user is found, return the user data
                res.json(result.rows[0]);
            } else {
                // If no user is found, send an error
                res.status(401).send("❌ Invalid username or password.");
            }
        })
        .catch((err) => {
            console.error("Error authenticating user", err);
            res.status(500).send("❌ Error authenticating user.");
        });
});

// Update a specific user's value
app.put("/changeBankValue", (req, res) => {

    console.log("Changing bank value");
    const { username, field, value } = req.body;

    // Validate that the field is allowed to be updated
    const allowedFields = ["password", "firstName", "lastName", "money"];
    if (!allowedFields.includes(field)) {
        return res.status(400).send("❌ Invalid field for update.");
    }

    // Convert value to appropriate type for SQL (money should be a float)
    const query = `UPDATE users SET ${field} = $1 WHERE username = $2`;
    const values = [value, username];

    // Execute the query
    client.query(query, values)
        .then((result) => {
            if (result.rowCount > 0) {
                res.json({ success: true, message: "✅ User updated successfully!" });
            } else {
                res.status(404).json({ success: false, message: "❌ User not found." });
            }
        })
        .catch((err) => {
            console.error("Error updating user", err);
            res.status(500).json({ success: false, message: "❌ Error updating user." });
        });
});


// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

