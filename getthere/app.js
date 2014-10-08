var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/getthere');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var flash = require('express-flash');
var multer = require('multer');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({
	dest: './uploads/'
}));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'data/images')));
passport.use(new LocalStrategy(function(username, password, done){
	var user = db.get('usercollection').findOne({username:username}, function(error, user){
    if (!user){
	return done(null, false, {message: 'Incorrect username.'});
    }
    if (user.password != password){
	return done(null, false, {message: 'Incorrect password'});
    }
    return done(null, user);
    });
}));
passport.serializeUser(function(user,done){
    done(null, user._id);
});
passport.deserializeUser(function(id, done){
    db.get('usercollection').findOne({_id:id}, function(error, user){
	if(!user){
	    return done(null, false, {message: 'Incorrect username.'});
	}
	return done(null, user);
    });
});
app.use(session({
    secret: process.env.EXPRESS_SECRET,
	key: 'sid',
	cookie: {maxAge: 600000},
	saveUninitialized: true,
	resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    req.db = db;
    next();
});
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
