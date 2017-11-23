var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema = mongoose.Schema({
	username:{
		type:String, unique: true, index:true, dropDups: true
	},
	password: {
		type:String
	},
	email:{
		type:String,
		unique: true,
		dropDups: true
	},
	name:{
		type:String
	},
	location:{
		type:String
	},
	profilepic:{
		type:String
	},
	follower:[String],
	post:[{
		content_type:String,
		title:String,
		content:String,
		postedBy:String,
		timestamp:Date
	}]
});

// var userSchema = mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     email: { type: String, index: true, unique: true, required: true },
//     password: { type: String, required: true }
// });

UserSchema.plugin(uniqueValidator);

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.pushMessage = function(messagePost,username,callback) {
    var query = {username:username};
    var update = {$push:{post:messagePost}};
    var options = {upsert:true};

    User.findOneAndUpdate(query,update,options,callback);
}

module.exports.createUser = function(newUser,callback){
	bcrypt.genSalt(10,function(err,salt){
		bcrypt.hash(newUser.password,salt,function(err,hash){
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.getUserByUsername = function(username,callback){
	var query = {username:username};
	User.findOne(query,callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword,hash,function(err,isMatch){
		if(err) throw err;
		callback(null,isMatch);
	});

}
module.exports.getUserById = function(id,callback){
	User.findById(id,callback);
}

module.exports.getLocationsByUser = function(user,callback){
	//var loc = [];
	var f = user.follower;
	f.push(user.username);
	var query = {username:{$in: f}};
	User.find(query,{"post":1,"_id":0},callback);
	//callback(null,loc);
}

module.exports.uploadpic= function(profilepath,username,callback) {
	var query = {username:username};
    var update = {profilepic:profilepath};
    var options = {upsert:true};
    User.findOneAndUpdate(query,update,options,callback);
}

module.exports.checkunique= function(friend,username,callback)
{
	var query = {$and:[{username:username},{follower:friend}]};
	//var options = {follower:{$elemMatch:friend}};
	User.find(query,callback);
} 


module.exports.addFriend = function(friend,username,callback) {
   User.getUserByUsername(friend,function(err,user){
   		if(err)
   			return callback(err);
   		User.checkunique(friend,username,function(err,data){
   			//console.log(err);
   			//console.log(data);
   			if(data.length != 0)
   				return callback('Follower already exits');
   			var query = {username:username};
    		var update = {$push:{follower:friend}};
    		var options = {upsert:true};

    		User.findOneAndUpdate(query,update,options,callback);
   		});
   });
}