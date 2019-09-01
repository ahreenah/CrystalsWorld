var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/testsqlite3.sqlite');

all=function(query, params) {
    return new Promise(function(resolve, reject) {
        if(params == undefined) params=[]

        db.all(query, params, function(err, rows)  {
            if(err) reject("Read error: " + err.message)
            else {
                resolve(rows)
            }
        })
    }) 
}

async function createTableUsers(){
	await db.run('CREATE TABLE users (login TEXT, password TEXT)');
}

async function createTableCollections(){
	await db.run('CREATE TABLE collections (login TEXT, card INTEGER)');
}

async function getUsers(login){
    let res=await all("SELECT * FROM users WHERE login = '"+login+"'")//, function(err, row) {
    return res;
}

async function register(login,password){
	if ((await getUsers(login)).length!=0){
		console.log('user already exists')
		return false;
	}
	await db.run("INSERT INTO users VALUES ('"+login+"', '"+password+"')");
	return true;
}

async function login(log,pas){
	let dbgot=await getUsers(log);
	//console.log('gou users '+dbgot)
    if (dbgot.length==0){
		return false;
	}
	return pas==dbgot[0].password;
}

async function addUserCollectionCard(login, card){
	await db.run("INSERT INTO collections VALUES ('"+login+"', '"+card+"')");
}

async function getUserCollection(login){
	let res=await all("SELECT card FROM collections WHERE login = '"+login+"'")//, function(err, row) {
    return res;
}

async function getDeck(userId,deckNum){
    let res=await all("SELECT * FROM decks WHERE userId = '"+userId+"' and deckId = '"+deckNum+"'")//, function(err, row) {
    cards=[];
    //console.log(res)
    res.forEach(i=>{
        cards.push(i.card);
    });
    return cards;
}

async function getUserDecks(userId){
    let res=await all("SELECT deckId FROM decks WHERE userId = '"+userId+"'")//, function(err, row) {
    decks=[];
    res.forEach(i=>{
        if(decks.indexOf(i.deckId)==-1)
            decks.push(i.deckId);
    });
    return decks;
}

async function deleteDeck(userId,deckId){
    await all('DELETE FROM decks WHERE userId = "'+userId+'" and deckID = '+deckId)
}

async function setDeck(userId,deckId,deck){
    await deleteDeck(userId,deckId);

    for (const i of deck) {
        await db.run('INSERT INTO decks VALUES ("'+userId+'",'+deckId+','+i+')')
    }
}

async function findCardByName(cardName){
    return await all (`SELECT * FROM cards WHERE name="${cardName}"`)
}

async function getUserCoins(user){
    return ((await all (`SELECT coins FROM users WHERE login="${user}"`))[0].coins)
}

async function userPay(userId,coins){
    let nowCoins=await all(`SELECT coins FROM users WHERE login="${userId}" AND coins>=${coins}`);
    if(nowCoins.length>0) {
        await db.run(`UPDATE users SET coins=coins-${coins} WHERE login="${userId}"`);
        return true;
    }
    return false;

}

async function test(){
    console.log(await register('catty','dog'));
    console.log(await getUsers('cat'));
    console.log(await login('cat','dog'));
    console.log(await login('cat','doggy'));
    console.log(await login('catty','dog'));
    console.log(await login('cat','dog'));
    addUserCollectionCard('cat',1);
    addUserCollectionCard('cat',2);
    addUserCollectionCard('cat',5);
    addUserCollectionCard('cat',7);
    console.log(await getUserCollection('cat'))
    db.close();
    console.log('test ended')
}

async function getAllCards(){
    return await all('SELECT * FROM cards');
}


async function decksTest() {
    console.log(await getUserDecks('c'));
    console.log(await setDeck('c',2,[1,2,4]))
}

module.exports.getUserCollection=getUserCollection;
module.exports.addUserCollectionCard=addUserCollectionCard;
module.exports.login=login;
module.exports.register=register;
module.exports.getUserDecks=getUserDecks;
module.exports.getDeck=getDeck;
module.exports.deleteDeck=deleteDeck;
module.exports.setDeck=setDeck;
module.exports.getAllCards=getAllCards;
module.exports.findCardByName=findCardByName;
module.exports.userPay=userPay;
module.exports.getUserCoins=getUserCoins;