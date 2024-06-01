const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Use body-parser middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Set up SQLite database
const db = new sqlite3.Database('users.db', err => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT
            )
        `);
    }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Route for signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], err => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

// Route for login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Error querying user:', err);
            res.status(500).send('Internal Server Error');
        } else if (row) {
            res.send('Logged in successfully!');
        } else {
            res.status(401).send('Invalid username or password.');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
