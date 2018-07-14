var   express = require('express')
	, http = require('http')
	, async = require('async')
	, multer = require('multer')
	, upload = multer({dest: 'uploads/'})
	, exphbs = require('express-handlebars')
	, easyimg = require('easyimage')
	, _ = require('lodash')
	, cv = require('opencv');


// Image upload exts

var exts = {
	'image/jpeg': '.jpg',
	'image/png' : '.png',
	'image/gif' : '.gif'
};


var port = 8090;
var app = express();
app.use(express.static(__dirname + '/public'))

/**
 * Set up Handlebars templating
 */
app.engine('.hbs', exphbs( { extname: '.hbs', defaultLayout: 'default' } ) );
app.set( 'view engine', '.hbs' );


//**IMPORTANTE PARTE** POST callback 

app.post('/upload', upload.single('file'), function(req, res, next){

	//copy filename + ext
	var filename = req.file.filename + exts[req.file.mimetype]
	// + source + destination filepaths
	, src = __dirname + '/' + req.file.path
	, dst = __dirname + '/public/images/' + filename;


    
  async.waterfall(
    [
    //Is it an image?? (src)
      function( callback ) {

        
        if (!_.contains(
          [
            'image/jpeg',
            'image/png',
            'image/gif'
          ],
          req.file.mimetype
        ) ) {

          return callback( new Error( 'This is not an image (.jpg, .png, .gif).' ) )

        }

        return callback();

      },

    //Is it large enough? (src)
      function( callback ) {

          easyimg.info( src ).then(

          function(file) {

            if ( ( file.width < 960 ) || ( file.height < 300 ) ) {

              return callback( new Error( 'Use a larger image (at least 640 x 300 pixels) please!' ) );

            }

            return callback();
          }
        );
      },

    //Resize image to 960 px (save to dst)'
      function( callback ) {
      easyimg.resize(
          {
            width      :   960,
            src        :   src,
            dst        :   dst
          }
        ).then(function(image) { return callback(); });
      },

    /** OPENCV STUFF: 'faces' is an array of hashes (x and y coordinates, width and height,) about found faces:
        
        im.detectObject(classifier, options, function(err, faces) {  }); **/
    
    //Retrieve file from dst
      function(callback){
        cv.readImage(dst, callback);
      },

    //Face detection algorithm called
      function(im, callback){
        im.detectObject(cv.FACE_CASCADE, {}, callback);     // FACE_CASCADE: prebuilt face detection classifier   
      }

    ],

    //Render either result :) page or error page *why doesn't this need callback??*
      function( err, faces) {
        if(err) {
            return res.render(
                'error', {message: err.message}
            );
        }
      
        return res.render (
          'result', {filename : filename, faces :faces}
        );
      
      }

    ); // waterfall

}); // app.post




http.createServer(app)
	.listen(port, function(server) {
		console.log('Listening on port %d', port);
	});

app.get('/', function( req, res, next) {
	return res.render('index');
});

