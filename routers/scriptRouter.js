var express=require('express')
var path=require('path');

var scriptRouter=express.Router();

scriptRouter.get('/main_ws.js', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../static/js/main_ws.js'));
});

scriptRouter.get('/crafty.js', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../static/js/crafty.js'));
});

module.exports=scriptRouter;