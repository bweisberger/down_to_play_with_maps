const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Event = require('../models/events');

router.get('/', (req, res) => {
    Event.find({}, (err, foundEvents) => {
      if(err){
        res.send(err);
      } else {
        console.log(foundEvents)
        // we can make folders in our views
        // to seperate each resource
        res.render('events/index.ejs', {
          events: foundEvents
        });
      }
    })
  
  });

router.get('/new', (req, res) => {
    res.render('events/new.ejs')
  });
  
  router.get('/:id/edit', (req, res) => {
    Event.findById(req.params.id, (err, foundEvent) => {
      if(err){
        res.send(err);
      } else {
        console.log(foundEvent, "<---- edit route, document from mongodb")
        res.render('Events/edit.ejs', {
          event: foundEvent
        });
      };
    });
  });

  //post route to add event id to logged in user
  router.post('/:id', async (req,res)=>{
    try{
        console.log(req.session, 'this is the req.session')
        const foundEvent = await Event.findById(req.params.id);
        const foundUser = await User.findById(req.session.userId)
        foundUser.event = req.params.id
        req.session.message = "You've been added to game"
        console.log(foundUser);
        res.render('events/show.ejs', {
          event: foundEvent
        })
    }catch(err){
        res.send(err);
        console.log(err);
    }
   })
  
  router.get('/:id', async (req, res) => {
    try{
      const foundEvent = await Event.findById(req.params.id).populate('host');
      console.log(foundEvent, '<----found event in show route')
      res.render('events/show.ejs', {event: foundEvent});
    } catch(err){
      console.log(err);
      res.send(err);
    }
  });

  //post route to create new event
  router.post('/', async (req, res) => {
    // req.body is the information from the form
    try{
      console.log(req.body, ' req.body in post route')
      console.log(req.session.userId, 'req.session.userId')
      req.body.host = req.session.userId;
      console.log(req.body.host, " req.body.host in post route")
      const createdEvent = await Event.create(req.body);
      createdEvent.populate('host');
      console.log(createdEvent, ' < createdEvent in post route');
      res.redirect('/events/')
    } catch(err){
      console.log(err, "error in post route to make new game");
      res.send(err);
    }  
});

  
  router.put('/:id', (req, res) => {
    console.log(req.params, " params in the show route")
    Event.findByIdAndUpdate(req.params.id, req.body, (err, updatedEvent) => {
      if(err){
        res.send(err);
      } else {
        console.log(updatedEvent, ' <-- show route document from model');
        res.redirect('/events/' + updatedEvent._id);
      };
    });
  });
  
  router.delete('/:id', (req, res) => {
    Event.findOneAndDelete(req.params.id, (err, response) => {
      if(err){
        res.send(err);
      } else {
        console.log(response, " <--- Delete route")
        res.redirect('/Events');
      };
    });
  });
  
module.exports = router;