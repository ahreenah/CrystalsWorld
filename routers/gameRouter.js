var express=require('express')
var path=require('path');
var fs=require('fs')

var gameRouter=express.Router();

gameRouter.get('/', requireLogin, function (req, res) {
    //res.sendFile(__dirname + '/index_ws.html');
    fs.readFile('./static/html/index_ws.html', (err, data) => {
        console.log(data.toString())
        res.send(data.toString().split('<!--login-->').join(req.session.login));

    });
});

gameRouter.get('/editDecks',requireLogin,function(req,res){
    fs.readFile('./static/html/edit_decks.html', (err, data) => {
        console.log(data.toString());
        res.send(data.toString().split('<!--login-->').join(req.session.login));
    });
})

gameRouter.get('/collection',requireLogin,function(req,res){
    fs.readFile('./static/html/collection.html', (err, data) => {
        console.log(data.toString());
        res.send(data.toString().split('<!--login-->').join(req.session.login));
    });
})

module.exports=gameRouter;