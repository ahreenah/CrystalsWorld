var express=require('express')
var path=require('path');
var sqlite3Wrap=require('../scripts/sqlite3Wrap')

var authRouter=express.Router();

authRouter.get('/login',function(req,res){
    res.sendFile(path.resolve(__dirname+'/../static/html/login.html'));
})
authRouter.post('/login',async function(req,res){
    let success=await sqlite3Wrap.login(req.body.login,req.body.password);
    if (success){
        req.session.login=req.body.login;//req.body.login;
        //res.send('Welcome '+req.session.login);
        res.redirect('/');
    }
    else
        res.redirect('/login?wrong=true')
    //res.send(req.body.login+' '+req.body.password);
})

authRouter.get('/register',function(req,res){
    res.sendFile(path.resolve(__dirname + '/../static/html/register.html'));
})
authRouter.post('/register',async function(req,res){
    if(req.body.password==req.body.passwordRepeat){
        success = await sqlite3Wrap.register(req.body.login,req.body.password)
        if(success){
            req.session.login=req.body.login;
            res.redirect('/');
        }
        else
            res.redirect('/register?error=exists');
    }
    else
        res.redirect('/register?error=differentPasswords')
})

authRouter.get('/logout',function(req,res){
    req.session.login=null;
    res.redirect('/login')
    //res.send('Good bye!')
})

authRouter.get('/whoami',function(req,res){
    console.log('login: '+req.session.login)
    res.send(req.session.login);
})

module.exports=authRouter;