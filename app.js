
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var ContextIO = require('contextio');
var ctxioClient = new ContextIO.Client({
  key: process.env.CTXIO_KEY,
  secret: process.env.CTXIO_SECRET
});

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/emails', function(req, res){
	ctxioClient.accounts(process.env.CTXIO_ACCT_ID).messages().get({include_body:1}, function (err, response) {
	    if (err) throw err;
		var emails = response.body;
	    res.json(emails);
	});
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
