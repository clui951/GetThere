var fs = require('fs');
var path = require('path');

function upload(req, done){
	if (req.files.goal_image==undefined){
		console.log("default png");
		done("default.png");
		return;
	}
	fs.readFile(req.files.goal_image.path, function(err, data){
		var username = req.user.username;
		var firstLetter = username.split("")[0].toLowerCase();
		var imagenum = req.user.goals.length;
		var newPath = path.dirname(__dirname)+'/data/images/'+firstLetter+"/"+username+"/"+imagenum.toString()+".png";
		fs.writeFile(newPath, data, function(err){
			done(imagenum.toString()+".png");
		});
	});
}

module.exports = upload
