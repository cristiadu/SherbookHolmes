var express = require('express');
var graph = require('fbgraph');
var Twit = require('twit')
var http = require('http');
var handlebars = require('express3-handlebars');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname,'public')));
app.use(express.bodyParser());

//Require routes
var	index	= require('./routes/index');

//load environment variables
var dotenv = require('dotenv');
dotenv.load();

//Configures the Template engine
app.engine('handlebars',handlebars());
app.set('view engine','handlebars');
app.set('views',__dirname+'/views');

// Routes

app.get('/', function(req, res){
  res.render("index");
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
    res.redirect('/initial');
  });


});


// user gets sent here after being authorized
app.get('/initial', function(req, res) {

  res.render("initial");
});

app.post('/search',function(req,res){
		
	console.log(req.param("type"));
 	// #FACEBOOK DATA#
 	if(req.param("types"))
 		types = req.param("type");
 	else
 		strType = '"Musician/Band, Movie,Book,TV Show"';

 	// get the artist page
 	var query = "SELECT uid2 FROM friend WHERE uid1 = me() limit 200";
 	graph.fql(query,function(err,res2)
 	{
 		var i = res2.data.length;
 		var friend = res2.data[i-1];
 		var dataReturn = [];
 		getLikesFriend();
 		function getLikesFriend()
 		{
			
				var query2 = 'SELECT page_id,name,type FROM page WHERE page_id IN(SELECT page_id FROM page_fan WHERE uid = '+friend.uid2+') AND (type ="Musician/Band" OR type="Book" OR type="TV Show" OR type="Movie") ORDER BY fan_count DESC limit 10';
				
				graph.fql(query2, function(err, res3) 
				{
					if(i>0)
					{
						var already = false;
						for(k in res3.data)
						{
							already = false;
							for(j in dataReturn)
							{
								if(dataReturn[j].page_id == res3.data[k].page_id)
								{
									dataReturn[j].count++;
									already = true;
								}
							}

							if(!already)
							{
								res3.data[k].count = 1;
								dataReturn.push(res3.data[k]);
							}
						}

						i--;
						friend = res2.data[((i-1)>=0)?(i-1):0];
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