const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('./models/users')
const app = express();

require('dotenv').config();
require('./db/db');
const eventsController = require("./controllers/events");
const usersController = require("./controllers/users");

app.use(session({
  secret: 'This is a random secret string',
  resave: false, //we only save the cookie when we mutate it.
  saveUninitialized: false //don't save the cookie until the user has logged in
  //legally, you're not supposed to track user data until the user has logged in
  //which is why you're asked to accept that a site will use cookies
}));
app.use((req, res, next)=>{
        if(req.session.userId){
            User.findById(req.session.userId, (err, user)=>{
                if(err){
                    console.log(err, "<-- error in res.locals middleware")
                } else {
                    console.log(user, "<-- user in res.locals middleware")
                    res.locals.currentUserName = user.name;
                    res.locals.currentUserEmail = user.email;
                    console.log(res.locals.currentUserName, "<--res.locals.currentUserName")
                }
            });
        } else {
            res.locals.currentUserName = null;
            res.locals.currentUserEmail = null;
            console.log("res.locals variables in middleware set to null")
        }
    res.locals.currentUser = req.session.userId;
    res.locals.message = null;
    if(req.session.message){
        console.log("message is set: ", req.session.message)
        res.locals.message = req.session.message;
        req.session.message = null;
        console.log('res.locals: ', res.locals);
    }
next();
}); 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride("_method"));
app.use('/events', eventsController);
app.use('/users', usersController);

app.get('/', async (req, res)=>{
    try{
        const user = await User.findById(req.session.userId);
        res.render('home/index.ejs')
    } catch(err){
        console.log(err);
        res.send(err);
    }
});

app.listen(process.env.PORT, ()=>{
    console.log('listening on port' + process.env.PORT);
})