// Include our packages in our main server file
var express = require('express');
app = express();
var mongoose = require('mongoose');
var port = 3000;
var bodyParser = require('body-parser');
var morgan = require('morgan');

var passport = require('passport');
var config = require('./config/main');


// Use body-parser to get POST requests for API use
// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev'));

// Connect to database
mongoose.connect(config.database);

// Use routes
require('./app/routes')(app);

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
  res.send('Relax. We will put the home page here later.');
});

app.listen(port);
console.log('Your server is running on port ' + port + '.');
