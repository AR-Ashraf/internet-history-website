// server.js - Node.js/Express Server to Serve JSON Data
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Endpoint to serve JSON data
app.get('/data', (req, res) => {
    fs.readFile('public/data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading JSON file' });
        } else {
            try {
                res.json(JSON.parse(data));
            } catch (parseError) {
                res.status(500).json({ error: 'Invalid JSON format' });
            }
        }
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
