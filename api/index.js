const express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var moment = require('moment');
var db = new sqlite3.Database('db');
var port = process.env.PORT || 4000;
const basicAuth = require('express-basic-auth');
// const dotenv = require("dotenv");
// const result = dotenv.config();
const app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(basicAuth({
   users: { [process.env.LOGIN] : [process.env.PASSWORD] },
   challenge: true,
   unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
   return req.auth
       ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
       : 'No credentials provided'
}

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

  console.log()
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

app.listen(port);
