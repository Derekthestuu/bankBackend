const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // Allows JSON in requests

const FILE_PATH = path.join(__dirname, "accounts.txt"); // Store data in a text file

// Save account data to file
app.post("/saveAccount", (req, res) => {
    const { data } = req.body; // Example: "username,password,firstname,lastname,money"
    fs.appendFile(FILE_PATH, data + "\n", (err) => {
        if (err) return res.status(500).send("❌ Error saving data.");
        res.send("✅ Data saved!");
    });
});

// Read the file and send all data
app.get("/getAccounts", (req, res) => {
    fs.readFile(FILE_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).send("❌ Error reading file.");
        res.send(data); // Send back all account info
    });
});

// Start server
const PORT = process.env.PORT || 3000; // Render requires process.env.PORT
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

