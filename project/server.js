// contains our db logic
// database connections
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// this infos are from clevercloud
// this makes our db to be available online
// located in .env
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 3 // Limit to 3 to avoid 'max_user_connections' of 5 limit when testing connections in MySQL
});

// connect to DB
// to connect to the DB: run "node project/server.js" in the terminal
// always kill the previous server before running this command
// if the error "ER_USER_LIMIT_REACHED" pops up, it means there are too many connections to the DB

db.getConnection((err, connection) => {
    if (err) {
        console.log('DB Error:', err);
    } else {
        console.log('Connected to MySQL!');
        connection.release();
    }
});

// submit form
app.post('/api/submit', (req, res) => {
    const { surName, firstName, middleName, nameExtension, educLevel, schoolName, degreeCourse } = req.body;

    const personSQL = 'INSERT INTO personT (surName, firstName, middleName, nameExtension) VALUES (?, ?, ?, ?)';

    db.query(personSQL, [surName, firstName, middleName, nameExtension], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const applicantID = result.insertId;
        const educSQL = 'INSERT INTO educT (Applicant_ID, educLevel, schoolName, degreeCourse) VALUES (?, ?, ?, ?)';

        db.query(educSQL, [applicantID, educLevel, schoolName, degreeCourse], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Form submitted successfully!' });
        });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));