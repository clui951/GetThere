var USER_COLLECTION = 'usercollection';
var express = require('express');
var fs = require('fs');
var path = require('path');

function user(db, username, password){
    var collection = db.get(USER_COLLECTION);
    collection.insert({
    	"username":username,
		"password":password,
		"goals":[]
    });
    this.username = username;
    this.password = password;
	console.log(path.dirname(__dirname)+'/data/images/');
	fs.mkdir(path.dirname(__dirname)+'/data/images/'+username.split("")[0].toLowerCase()+"/"+username, function(err){
		return;	
});
}

module.exports = user;
