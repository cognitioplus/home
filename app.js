const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
var logger = require('morgan');
http = require('http').createServer(app),
io = require('socket.io')(http);

// require routes
var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var projectRouter = require('./routes/projects');
var operatorRouter = require('./routes/operators');
var profileRouter = require('./routes/profile');
var pixelRouter = require('./routes/pixeltalk');
var scriptRouter = require('./routes/script');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'pixelTalk#123@',resave: false,saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Add headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/projects', projectRouter);
app.use('/operators', operatorRouter);
app.use('/profile', profileRouter);
app.use('/pixaltalk', pixelRouter);
app.use('/script',scriptRouter);
/* catch 404 and forward to error handler */
app.use(function(req, res, next) {
//   next(createError(404));
  res.render('error')
});

var port = 3302;
http.listen(port, ()=>{
    console.log('Listening to port '+port)
});
  
module.exports = app;
