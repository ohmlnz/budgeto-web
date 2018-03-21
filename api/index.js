const express = require('express')
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var moment = require('moment');
var db = new sqlite3.Database('db');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

db.serialize(function() {
  db.run("CREATE TABLE budget (date TEXT, category TEXT, expenses REAL)", function(err) {});
});

app.get('/', (req, res) => res.send('Hello world!'));

app.post('/expenses', (req, res) => {
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO budget VALUES (?, ?, ?)");
    let category = req.body.category;
    let expense = parseFloat(req.body.value);
    let date = moment().format('YYYY/MM/DD');

    if (typeof(category) === 'string' && typeof(expense) === 'number' && !isNaN(expense)) {
      stmt.run(date, category, expense);
    }

    stmt.finalize();
  })
  res.end();
})

app.get('/db', (req, res) => {
  const elems = [];

  db.each("SELECT * from budget", function items(err, row) {
    elems.push([row.date, row.category, row.expenses])
  }, function complete(err, rows) {
    res.send(elems);
  });
})

app.get('/kill', (req, res) => {
  // total wipeouuuut
  db.run("DELETE from budget");
})

app.listen(4000, () => console.log('Example app listening on port 4000!'))
