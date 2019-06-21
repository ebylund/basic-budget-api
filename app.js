const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const multer = require('multer');
const csv = require('fast-csv');
const port = 5225;

const upload = multer({ dest: 'tmp/csv/' });

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Budget"
});

app.get('/', (req, res) => {
    res.send("hello there little world");
});

app.get('/transactions', (req, res) => {
    con.query("SELECT * FROM Transaction ORDER BY date DESC, createdOn DESC", function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

app.post('/transactions', (req, res) => {
    var transaction = req.body;
    res.json(insertTransaction(transaction))
});

app.delete('/transactions/:id', (req, res) => {
    var id = req.params.id;
    var deleteQuery = `delete from Transaction where id = '${id}'`;
    con.query(deleteQuery, function (err, result) {
        if (err) throw err;
        res.json(result);
    })
});

app.post('/transactions/upload-csv', upload.single('file'), (req, res) => {
    const fileRows = [];
    csv.parseFile(req.file.path)
        .on("data", function(data) {
            fileRows.push({
                date: data[0],
                description: data[1],
                category: data[2],
                amount: data[3]
            });
        })
        .on("end", function() {
            // console.log(fileRows);
            fs.unlinkSync(req.file.path);
            fileRows.shift();
            res.json(insertTransactions(fileRows));
        });

    // res.send("ok");
});

function insertQuery(query) {
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        return result;
    });
}

function insertTransaction(t) {
    var query = `insert into Transaction (date, description, category, amount) values ("${t.date}", "${t.description}", "${t.category}", ${t.amount})`;
    return insertQuery(query);
}

function insertTransactions(t) {
    var insertQueryBase = `insert into Transaction (date, description, category, amount) values `;
    var values = "";
    t.forEach((trans, idx, arr) => {
        values += `("${trans.date}", "${trans.description}", "${trans.category}", ${trans.amount})`;
        if ( idx !== arr.length - 1 ) {
            values += ',';
        }
    });
    return insertQuery(insertQueryBase + values);
}

app.listen(port, () => {
    console.log(`app is running on http://localhost:${port}`)
});
