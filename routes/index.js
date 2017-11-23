var express = require('express');
var router = express.Router();
var User = require('../models/user');
//var objects = require('./objects');
//var passport = require('passport');
//Get Homepage
router.get('/', function(req,res){
	if(req.user)
	{
		User.getLocationsByUser(req.user,function(err,temploc){
			//console.log(temploc);
			var loc = [];
			for(var i = 0;i<temploc.length;i++)
			{
				var temp = temploc[i]["post"];
				for(var j = 0;j<temp.length;j++)
				{
					var tempstring = JSON.stringify(temp[j]);
					var tempjson = JSON.parse(tempstring);
					tempjson.image = false;
					tempjson.video = false;
					tempjson.message = false;
					if(tempjson["content_type"] == "message")
					 	tempjson["message"]  = true;
					if(tempjson["content_type"] == "image")
						tempjson["image"]  = true;
					if(tempjson["content_type"] == "video")
					 	tempjson["video"]  = true;
					//console.log(tempjson);
					loc.push(tempjson);
				}
			}
			function compare(a, b) {
  			if(a["timestamp"] < b["timestamp"])
					return 1;
			  if(a["timestamp"] > b["timestamp"])
					return -1;
				return 0;
			}
			//console.log(compare(loc[0],loc[1]));
			loc.sort(compare);
			console.log(loc);
			res.render('index',{location:loc});
			//loc = temploc;
		});
		//console.log(loc);
	}
else
	res.render('index');
});
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	} else
	{
		 //req.flash('error_msg','You are not logged in');
		 res.redirect('/users/login');
	}
}
module.exports = router;