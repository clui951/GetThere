var express = require('express');
var router = express.Router();
var passport = require('passport');
var users = require('../models/user');
var fs = require('fs');
var goal_utils = require('../models/goal_utils');
/* GET home page. */
router.get('/', function(req, res) {
  var username = null;
  if (req.user){
    username = req.user.username;
  }
  res.render('index', { title: 'GetThere', username:username });
});


/* GET new page. */
router.get('/timeline/', function(req, res) {
  	if (req.user==null && req.session.user==null){
        res.redirect('/login');
	}
    var firstLetter = req.user.username.split("")[0].toLowerCase();
    var basePath = firstLetter+"/"+req.user.username+"/";
    req.db.get('usercollection').findOne({username:req.user.username}, function(err, doc){
		console.log(doc["goals"])
		res.render('timeline', {
	    	"basePath":basePath,
	    	"username":req.user.username,
	    	"goals":doc["goals"]
		});
	})
});

/* GET new page. */
router.get('/view_goal', function(req, res) {
	var collection = req.db.get("usercollection")
	collection.findOne({username:req.user.username}, function(err,doc){
		res.render('view_goal', { goal_ind : req.body.goal_ind,
								  goal : doc[goal_ind]  });
	});
})

router.get('/create_goal/', function(req, res) {
  res.render('create_goal', { title: 'Create Goal'});
});

router.post('/register', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var db = req.db;
    if(!username || !password){
		return res.render('register', {title:'Register', error: 'Email and password required.'});
    }
	db.get('usercollection').findOne({username:username}, function(err, doc){
		if (doc){
			req.session.error = 'That username is already used!';
			return res.redirect('/register');
		}
		var user = new users(db, username, password);
		db.get('usercollection').findOne({username:username}, function(err, doc){
			user = doc;
			req.login(user, function(err){
				req.user = user;
				return res.redirect('/');
		});	
		});
		
	});
});

router.get('/register', function(req, res){
	if (req.session.error){
		var error = req.session.error;
		delete req.session.error;
		res.render('register', {title: 'Register', error:error});
		return
	}
    res.render('register', {title: 'Register'});
});
router.post('/login', passport.authenticate('local', {successRedirect:'/profile', failureRedirect:'/login/retry'}));

router.get('/login/retry', function(req, res){
	req.session.error = 'Invalid username or password';
	return res.redirect('/login')
});
router.get('/login', function(req, res){
	if(req.session.error){
		var error = req.session.error;
		delete req.session.error; 
		res.render('login', {title:'Login', error:error});
		return
	}
	res.render('login', {title:'Login'});
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/profile', function(req, res){
	if (req.user==null && req.session.user==null){
		res.redirect('/login');
	}
	var firstLetter = req.user.username.split("")[0].toLowerCase();
	var basePath = "/"+firstLetter+"/"+req.user.username+"/";
	console.log('about to render');
	res.render('profile', {
		"basePath":basePath,
		"username":req.user.username,
		"goals":req.user.goals
	});
});

router.get('/add_milestone', function(req, res){
		goal_utils.add_milestone(req);
	});


router.get('/edit_goal', function(req,res){
	res.render('edit_goal', {title: "Edit a goal"})
})
//pass in goal_ind (which goal would like to edit), goal_string (goal discription), goal_picture (path to goal picture)
router.post('/edit_goal', function(req,res){
	goal_utils.edit_goal(req);
});

//goal_string (goal discription), goal_picture (path to goal picture)
router.post('/add_goal', function(req,res){
	goal_utils.add_goal(req);
	return res.redirect('/profile');
 });

router.get('/delete_goal', function(req,res){
	res.render('delete_goal', {title: "Delete a goal"})
})
//pass in goal_ind (which goal would like to remove), goal_string (goal discription), goal_picture (path to goal picture)
router.post('/delete_goal', function(req,res){
	goal_utils.remove_goal(req);
	return res.redirect('/profile');
});

module.exports = router;
