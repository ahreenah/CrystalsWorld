var express = require('express');
 
var app = express();
var server = require('http').Server(app);

var session = require('express-session');

//app.use('/router',router)

app.use(session({ secret: 'keyboard cat', resave:true}))

var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var {getAllCards, getDeck, getUserCollection, getUserDecks, setDeck, findCardByName, userPay, addUserCollectionCard, getUserCoins} = require('./scripts/sqlite3Wrap');
var fs = require('fs');

async function f() {
  console.log(await getAllCards())
}
f();



var searchGameId=1;
var playerId=1;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('express').static('static'));

// WARNING: app.listen(80) will NOT work here!

var allCards=[];

requireLogin=function(req,res,next){
  if(req.session.login==null)
    res.redirect('/login')
  else
    next();
}

// routers

var scriptRouter=require('./routers/scriptRouter')
app.use('/',scriptRouter)

var gameRouter=require('./routers/gameRouter')
app.use('/',gameRouter)

var authRouter=require('./routers/authRouter')
app.use('/',authRouter)

io.on('connection', function (socket) {
  socket.on('movePart', function (data) {
    console.log(data);
    //io.emit('broadcast',data)
    socket.broadcast.emit('movePart', data);
  });
  socket.on('moveEnd',function(data){
  	console.log('move ended')
  	socket.broadcast.emit('moveEnd', data['gameId']);
  })
  socket.on('joinGame', function (data) {
    socket.emit('gameId', {gameId:searchGameId, playerId:playerId});
    if (playerId==1)
      playerId=2;
    else{
      socket.broadcast.emit('found',{gameId:searchGameId})
      searchGameId+=1;
      playerId=1;
    }
  });
  socket.on('field', function (data) {
    socket.broadcast.emit('field', {gameId:searchGameId, field:data});
  });
  socket.on('moveArrow', function (data) {
    console.log('move arrow sent');
    socket.broadcast.emit('moveArrow', data);
  });
  socket.on('deck', async function (data) {
    console.log('deck socket received')
    console.log(data);
    await setDeck(data.user,data.deckNum,data.deck)
    socket.emit('deckSaved',true)
    //socket.broadcast.emit('field', {gameId:searchGameId, field:data});
  });
  socket.on('getDeck',async function(data) {
    console.log('user: '+data.userId);
    console.log('deck: '+data.deckId);
    socket.emit('sendDeck',{uid:data.userId,deckId:data.deckId,deck:await getDeck(data.userId,data.deckId)});
  })
  socket.on('getDeckList',async function(data){
    socket.emit('sendDeckList',{uid:data.userId,decks:await getUserDecks(data.userId)});
  })
  socket.on('getAllCards',async function(data){
    socket.emit('allCards',await getAllCards());
  })
  socket.on('getCoins',async function(login){
    socket.emit('coins',await getUserCoins(login));
  })
  socket.on('concede', function (data) {
    socket.broadcast.emit('concede', {gameId:data});
  });
  socket.on('securityValue', function (data) {
    console.log('security value is '+data)
    socket.broadcast.emit('securityValue', data);
  });
  socket.on('getCollection',async function(data){
    console.log(data)
    console.log('sending collection');
    console.log(await getUserCollection(data));
    socket.emit('collection',await getUserCollection(data))
  })
  socket.on('getCraftable',async function(data){
    socket.emit('craftable', [0,2,4,6,8])
  })
  socket.on('addDeck',async function(data){
    console.log(data);
    let currentDecks=await getUserDecks(data.user);
    console.log(currentDecks);
    let num=0;
    while (currentDecks.indexOf(num)!=-1)
      num++;
    socket.emit('deckAdded',num);
    console.log('deck was added');
  })
  socket.on('craft', async function(data){
    console.log(`${data.userId} is crafting ${data.cardName}`);
    let foundCard=await findCardByName(data.cardName);
    if (foundCard.length==0){
      socket.emit('doCraft',{cardName:data.cardName,success:false});
      return;
    }
    foundCard=foundCard[0];
    console.log('CARD: ');
    console.log(foundCard);
    console.log(`PAY: `);
    let success=await userPay(data.userId, foundCard.coinCost);
    console.log(success);
    if (success){
      await addUserCollectionCard(data.userId, foundCard.id-1);
      console.log('SUCCESS')
      socket.emit('doCraft',{cardName:data.cardName,success:true});
      return;
    }
    socket.emit('doCraft',{cardName:data.cardName,success:false});
  })
});

server.listen(80);
