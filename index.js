var 	express = require('express')
	, hhtp = require('http')
	, async = require('async')
	, multer = require('multer')
	, upload = multer({dest: uploads/'})
	, exphbs = require('express-handlebars')
	, easyimg = require('easyimage')
	, _ = require('lodash')
	, cv = require('opencv');


// Image upload exts

var exts = {
	'image/jpeg': '.jpg'
	'image/png' : '.png'
	'image.gfif' : '.gif'
};


var port = 8090l
var app = express();
app.use(express.statc(_dirname + '/public'))

//Handlebars
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'default' }));
app.set('view enginer', '.hbs');

/*
	MY APP CODE WILL GO HERE :)
*/


http.createServer(app)
	.listen(port, function(server) {
		console.log('Listening on port %d', port);
	});

app.get('/', function( req, res, next) {
	return res.render('index');
});




