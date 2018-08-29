var express = require('express');
var router = express.Router();
var conString = "";
var obj = "1";
var fs = require('fs');

function walkfolders(dir) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    var filelist = [];
    files.forEach(function(file) {
            filelist.push(file);
    });
    return filelist;
}
var OtoDFile = walkfolders('./public/data/OtoD')[0];
var DtoOFile = walkfolders('./public/data/DtoO')[0];
var appName = OtoDFile.split('_')[0];

router.get('/', function(req, res, next) {
    res.render('index', { title: appName, OtoDFile:OtoDFile,DtoOFile:DtoOFile});
});

module.exports = router;
