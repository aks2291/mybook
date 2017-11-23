var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var multer = require('multer');
var path = require('path');
var LocalStrategy = require('passport-local').Strategy;

//Set storage Engine
var storage = multer.diskStorage({
	destination:'./public/media/',
	filename: function (req,file,cb){
		cb(null,file.fieldname+'-'+Date.now()+
		path.extname(file.originalname));
	}
});

//Init Upload
var upload = multer({
	storage: storage,
	limits: {fileSize: 1000000},
	fileFilter: function(req,file,cb){
		checkFileType(file,cb);
		//console.log()
	}
}).single('myImage');

//check profile type image

function checkFileType(file,cb) {
	//Allowed ext
	var filetypes = /jpeg|jpg|png|gif/;
	var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	var mimetype = filetypes.test(file.mimetype);

	if(mimetype && extname){
		return cb(null,true);
	} else{
		cb('Error:Images Only');
	}
}
var typepv ;
//Init Upload video or picture
var uploadpv = multer({
	storage: storage,
	limits: {fileSize: 10000000},
	fileFilter: function(req,file,cb){
		checkFileTypepv(file,cb);
	}
}).single('mypicvideo');

//check video and pic
function checkFileTypepv(file,cb) {
	//Allowed ext
	var filetypes = /jpeg|jpg|png|gif/;
	var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	var mimetype = filetypes.test(file.mimetype);

	var filetypesv = /mp4|ogg|webm/;
	var extnamev = filetypesv.test(path.extname(file.originalname).toLowerCase());
	var mimetypev = filetypesv.test(file.mimetype);

	if(mimetype && extname){
		typepv = true;
		 return cb(null,true);
	} else{ if (mimetypev && extnamev){
		typepv = false;
		return cb(null,true);
		
	} else
	cb('Error:Worng File!');
	}
}
//Get Register
router.get('/register',function(req,res){
	res.render('register');
});

//Login get
router.get('/login',function(req,res){
	res.render('login');
});

//Message get
router.get('/message',function(req,res){
	if(req.user){
	res.render('message');
	} else {
		req.flash('error_msg','You are not logged in');
		 res.redirect('/users/login');
	}
});

//Message Post

router.post('/message',function(req,res){
	var	content_type = 'message';
	var	title = req.body.title;
	var	content = req.body.message;
	var	postedBy = req.user.name;
	var	timestamp = new Date();
	//Validation
	req.checkBody('title','Title is required').notEmpty();
	req.checkBody('message','Message field not be Empty!').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('message',{errors:errors});
	} else {
		var messagePost = {
			content_type:content_type,
			title:title,
			content:content,
			postedBy:postedBy,
			timestamp:timestamp
		};
		//console.log(req.user.username);

		User.pushMessage(messagePost,req.user.username,function(err) {
			if(err) throw err;
			else res.render('index');
		});
		
	}
});

//Image Video get
router.get('/picvideo',function(req,res){
	if(req.user){
	res.render('picvideo');
	} else {
		req.flash('error_msg','You are not logged in');
		 res.redirect('/users/login');
	}

});

//Post video and picture
router.post('/picvideo',function(req,res){
	uploadpv(req,res,(err) => {
		if(err){
			res.render('picvideo',{msg:'ERROR:Large is file or Invalid!'});
		} else { if(req.file == undefined){
			 		res.render('picvideo',{msg:'Error:No File'});
			 	} else{ 
			 			var	content_type;
			 			if(typepv){
			 				content_type = 'image';
			 			} else {
			 				content_type = 'video';
			 			}
			 			 
						var	title = req.body.title;
						var	content = req.file.path.substring(6);
						var	postedBy = req.user.name;
						var	timestamp = new Date();

						var messagePost = {
								content_type:content_type,
								title:title,
								content:content,
								postedBy:postedBy,
								timestamp:timestamp
								};
							//validation
							//req.checkBody('title','Title field not be Empty!').notEmpty();

					var errors = null;//req.validationErrors();
					if(errors){
							res.render('picvideo',{errors:errors});
					}else
						{User.pushMessage(messagePost,req.user.username,function(err) {
																	if(err) throw err;
																	else res.redirect('/');
												});
			 			}
					}
		}
	});
});

// profile picture update
router.get('/changepic',function(req,res){
   if(req.user){
   	res.render('changepic');
   } else {
   		req.flash('error_msg','You are not logged in');
   		res.redirect('/users/login');
   }
});

//Post profile picture
router.post('/changepic',function(req,res){
	upload(req,res,(err) => {
		if(err){
			res.render('changepic',{msg:'ERROR:Large is file or Invalid!'});
		} else { if(req.file == undefined){
			 		res.render('changepic',{msg:'Error:No File'});
			 	} else{
			 			var profilepath = req.file.path.substring(6);
						//console.log(profilepath);
						User.uploadpic(profilepath,req.user.username,function(err) {
											if(err) throw err;
											else res.redirect('/');
						});
					}
		}
	});
});

//Resgister user
router.post('/register',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var location = req.body.location;
	var profilepic = '/media/default_profile.png';
	//Validation
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not Valid').isEmail();
	req.checkBody('username','Username is required').notEmpty();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Passwords donot match').equals(req.body.password);
	req.checkBody('location','Location is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password,
			location:location,
			profilepic:profilepic
		});

		User.createUser(newUser,function(err,user){
			if(err) throw err;
			//console.log(user);
		});

		req.flash('success_msg','You are registered and can now login');
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
  	//console.log(username);
    User.getUserByUsername(username,function(err,user){
    if(err) throw err;
    //console.log(user);
    if(!user){
    	return done(null,false, {message:'Unknown User'});
    }

    User.comparePassword(password,user.password,function(err,isMatch){
    	if(err) throw err;
    	if(isMatch){
    		return done(null,user);
    	} else {
    		return done(null,false,{message:'Invalid password'});
    	}
    });
  });
}));

passport.serializeUser(function(user,done) {
	done(null,user.id); 
});

passport.deserializeUser(function (id,done) {
	User.getUserById(id,function (err,user) {
		done(err,user);
	});
});
router.post('/login',
  passport.authenticate('local',{successRedirect:'/',failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success_msg','You are logged out');
	res.redirect('/users/login');
});

//add user
router.get('/addfriend',function(req,res){
	if(req.user){
	res.render('addfriend');
	} else {
		req.flash('error_msg','You are not logged in');
		 res.redirect('/users/login');
	}
});



router.post('/addfriend',function(req,res){
	var friend = req.body.username;
	//Validation
	req.checkBody('username','Title is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addfriend',{errors:errors});
	} else {
			User.addFriend(friend,req.user.username,function(err) {
			if(err) {req.flash('error_msg','No such user/already added');
						res.redirect('/users/addfriend');
					}
			else {

				req.flash('success_msg','Friend is successfully added');
				res.redirect('/users/addfriend');
			}
		});
		}
		

});

module.exports = router;