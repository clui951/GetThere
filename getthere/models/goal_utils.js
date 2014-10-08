var upload = require('../routes/upload');
var url = require("url");

function goal_utils(){}

goal_utils.update_collection = function(req){
	req.db.get('usercollection').update(
	  { username : req.session.user.username },
	  { $set: { goals: req.session.user.goals, goal_pictures: req.session.user.goal_pictures } }
	);
};

goal_utils.add_goal = function(req){
	var collection = req.db.get("usercollection");
	console.log(req.body.goal_name)
	console.log(req.body.finish)
	collection.findOne({username:req.user.username}, function(err,doc){
		var goal_dict = JSON.parse("{}")
		console.log(req.body);
		goal_dict["goal_name"] = req.body.goal_name;
		goal_dict["goal_description"] = req.body.goal_string;
		upload(req, function(path){
			goal_dict["path"] = path;
			goal_dict["finish"] = req.body.finish
			goal_dict["completed"] = false
			goal_dict["milestones"] = []
			req.db.get('usercollection').update(
				{ username : req.user.username },
				{ $set: { goals: doc.goals.concat([JSON.stringify(goal_dict)])} }
			);
			return;	
		});
		
	});
};

goal_utils.edit_goal = function(req){
	console.log("PRINTING")
	console.log(req.body.goal_ind)
	var ind = parseInt(req.body.goal_ind)
	console.log(ind)
	var collection = req.db.get("usercollection")
	collection.findOne({username:req.user.username}, function(err,doc){
		var goal_dict = JSON.parse([doc.goals[ind]])
		goal_dict["goal_name"] = req.body.goal_name;
		goal_dict["goal_description"] = req.body.goal_string;
		goal_dict["path"] = req.body.path;
		goal_dict["finish"] = req.body.finish
		goal_dict["completed"] = req.body.completed
		goal_dict["milestones"] = req.body.milestones
		doc.goals[ind] = JSON.stringify(goal_dict)
		req.db.get('usercollection').update(
			{ username : req.user.username },
			{ $set: { goals: doc.goals} }
		)
	});
}

goal_utils.remove_goal = function(req){
	var ind = parseInt(req.body.goal_ind)
	var collection = req.db.get("usercollection")
	collection.findOne({username:req.user.username}, function(err,doc){
		doc.goals = doc.goals.splice(ind, 1);
		req.db.get('usercollection').update(
			{ username : req.user.username },
			{ $set: { goals: doc.goals} }
		);
	});
}

//needs req.goal_ind
goal_utils.add_milestone = function(req){
	var collection = req.db.get("usercollection");
	collection.findOne({username:req.user.username}, function(err,doc){
		var cur_goal = JSON.parse(doc.goals[req.body.goal_ind])
		var milestone_dict = JSON.parse("{}")
		milestone_dict["goal_name"] = req.body.goal_name;
		milestone_dict["goal_description"] = req.body.goal_string;
		milestone_dict["path"] = upload(req, function(e){
			milestone_dict["finish"] = req.body.finish
			milestone_dict["completed"] = false
			cur_goal["milestones"] = cur_goal["milestones"].concat([JSON.stringify(milestone_dict)])
			doc.goals[req.body.goal_ind] = cur_goal
			req.db.get('usercollection').update(
		    	{ username : req.user.username },
		    	{ $set: { goals: doc.goals} }
			);	
		});
		
	});
};

module.exports = goal_utils;
