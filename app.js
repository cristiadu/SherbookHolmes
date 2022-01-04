var express = require('express');
var graph = require('fbgraph');
var Twit = require('twit')
var http = require('http');
var handlebars = require('express-handlebars');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'this is the secret'}));  
app.use(app.router);
app.use(express.bodyParser());

//Require routes
var	index	= require('./routes/index');

//load environment variables
var dotenv = require('dotenv');
dotenv.load();

//Configures the Template engine
app.engine('handlebars',handlebars());
app.use(express.session({secret: 'this is the secret'}));  
app.set('view engine','handlebars');
app.set('views',__dirname+'/views');

// Routes

app.get('/', function(req, res){
  res.render("index");
});


app.get('/logout',function(req,res)
{
	var acesstk = req.session.access_token;
	req.session.access_token = "";
	res.render('index');
});


//Auth with facebook
app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":      process.env.appid_facebook
      , "redirect_uri":  process.env.redirect_uri_facebook
      , "scope":         'user_friends,user_status,friends_status,friends_likes,read_stream'
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token



  graph.authorize({
      "client_id":      process.env.appid_facebook
    , "redirect_uri":   process.env.redirect_uri_facebook
    , "client_secret":  process.env.client_secret_facebook
    , "code":           req.query.code
  }, function (err, facebookRes) {
  	console.log(facebookRes);
  	 req.session.access_token = facebookRes.access_token;
    res.redirect('/initial');
  });


});

function is_array(check_var) {
   return(Object.prototype.toString.call( check_var ) === 
                '[object Array]');
}

// user gets sent here after being authorized
app.get('/initial', function(req, res) {

  res.render("initial");
});

app.post('/search',function(req,res){
		
	
	var strTpPAge = "";


 	// #FACEBOOK DATA#
 
 	typePage = req.param("typePage");
 	if(typePage !== undefined)
 	{
 		

 		if(is_array(typePage))
 		{	
	 		for(i in typePage)
	 		{
	 			
	 			if(i==0)
	 				strTpPAge='type="'+typePage[i]+'" ';
	 			else if(i < typePage.length)
	 				strTpPAge+='OR type="'+typePage[i]+'" ';
	 		}
 		}
 		else
 			strTpPAge='type="'+typePage+'" ';
 	}
 	else
 		strTpPAge = 'type="Musician/Band" OR type="Movie" OR type="Book" OR type="TV Show"';

 	if(req.param("nlikes")!=="")
 		nlikes = req.param("nlikes");
 	else
 		nlikes = 10;
 	// get the artist page
 	var query = 'SELECT page_id,name,type FROM page WHERE page_id IN(SELECT page_id FROM page_fan WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() LIMIT 200)) AND ('+strTpPAge+') ORDER BY fan_count DESC limit '+nlikes;

 	
 	graph.setAccessToken(req.session.access_token).fql(query,function(err,res2)
 	{
 		var i = res2.data.length;
 		var page = res2.data[i-1];
 		var dataReturn = [];
 		getLikesFriend();
 		function getLikesFriend()
 		{
				var pageObj = {};  
				var query2 = "SELECT uid FROM page_fan WHERE page_id = "+page.page_id+" AND uid IN (SELECT uid2 FROM friend WHERE uid1=me())";
				
				graph.setAccessToken(req.session.access_token).fql(query2, function(err, res3) 
				{
					if(i>0)
					{
						pageObj.page_id = page.page_id;
						pageObj.name = page.name;
						pageObj.type = page.type;
						pageObj.count = 0;

						for(j in res3.data)
							pageObj.count++;

						dataReturn.push(pageObj);
						i--;
						page = res2.data[((i-1)>=0)?(i-1):0];
						getLikesFriend();
					}
					else
						res.json(dataReturn);
				});
				
			
		}
	});

	// #END OF FACEBOOK DATA


});

app.set('port',process.env.PORT || 3000);


http.createServer(app).listen(app.get('port'),function(){
	console.log('Express server listening on port'+app.get('port'));
});

Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}