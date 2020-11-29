var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./config/db');
const models = require('./models/payload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors = require('cors');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/payloadtype', require('./crud')(models.PayloadType));
app.use('/api/payload', require('./services/payload.service')());
app.use('/api/payloadregister', require('./services/register.service')());
app.use('/api/payloadStat', require('./services/statistic.service')());
app.use('/api/payloadMetadata', require('./services/metadata.service')());

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ code: err.status || 500,  message: err.message });
  });

db.connect();

module.exports = app;
