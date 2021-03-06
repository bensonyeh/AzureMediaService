var express = require('express');
var router = express.Router();

var fileSystem = require('fs');
var path = require('path');

var app = express();

// app.use(cors());

 router.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/vast', function(req, res, next) {

  	var filePath = path.join(__dirname, "../", "public", "xml", "vast.xml");
    console.log("filepath = " + filePath);
    var stat = fileSystem.statSync(filePath);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.writeHead(200, {
        'Content-Type': 'text/xml',
        'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);

});

module.exports = router;
