
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var ContextIO = require('contextio');
var ctxio = new ContextIO.Client({
  key: process.env.CTXIO_KEY,
  secret: process.env.CTXIO_SECRET
});

var path = require('path');

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
	ctxio.accounts(process.env.CTXIO_ACCT_ID).messages().get({include_body:1}, function (err, response) {
	    if (err) throw err;
		var emails = response.body;
	    res.json(emails);
	});
});

app.get('/attachments/:id', function(req, res) {
	var fileID = req.params.id;
	var filepath = path.join(__dirname, 'attachments', fileID);
	// TODO check if file already exists so that we don't get billed for unnecessary file downloads from context.io
	ctxio.accounts(process.env.CTXIO_ACCT_ID).files(fileID).content().get(filepath, function(err, response) {
		if (response.statusCode === 200) {
			res.download(filepath, 'application.pdf'); // TODO display in browser instead of downloading
		} else {
			res.send(response.statusCode);
		}
	});
});

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
