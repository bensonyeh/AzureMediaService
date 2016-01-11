var express = require('express');
var router = express.Router();

var fileSystem = require('fs');
var path = require('path');
var cors = require('cors');

var app = express();

app.use(cors());

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/vast', function(req, res, next) {
  	var filePath = 'C:\\Users\\beyeh\\Desktop\\vast.xml';
    var stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'text/xml',
        'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);

});

module.exports = router;
