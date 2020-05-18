'use strict';

const express = require('express');
const momentTimeZone = require('moment-timezone');
const moment = require('moment');
const Subscribe = require('../models/subscribe');
const router = new express.Router();


const getTimeZones = function() {
  return momentTimeZone.tz.names();
};

// GET: /subscriptions
router.get('/', function(req, res, next) {
  Subscribe.find()
    .then(function(subscriptions) {
      res.render('subscriptions/index', {subscriptions: subscriptions});
    });
});

// GET: /subscriptions/create
router.get('/create', function(req, res, next) {
  res.render('subscriptions/create', {
    timeZones: getTimeZones(),
    subscribe: new Subscribe({name: '',
                                  phoneNumber: '',
                                  participants: 1,
                                  type: '',
                                  timeZone: '',
                                  time: ''})});
});

// POST: /subscriptions
router.post('/', function(req, res, next) {
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const participants = req.body.participants;
  const type = req.body.type;
  const timeZone = req.body.timeZone;
  const time = moment(req.body.time, 'H');
  const subscribe = new Subscribe({name: name,
                                       phoneNumber: phoneNumber,
                                       participants: participants,
                                       type: type,
                                       timeZone: timeZone,
                                       time: time});
  subscribe.save()
    .then(function() {
      res.redirect('/');
    });
});

// GET: /subscriptions/:id/edit
router.get('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  Subscribe.findOne({_id: id})
    .then(function(subscribe) {
      res.render('subscriptions/edit', {timeZones: getTimeZones(),
                                       subscribe: subscribe});
    });
});

// POST: /subscriptions/:id/edit
router.post('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const participants = req.body.participants;
  const type = req.body.type;
  const timeZone = req.body.timeZone;
  const time = moment(req.body.time, 'H');


  Subscribe.findOne({_id: id})
    .then(function(subscribe) {
      subscribe.name = name;
      subscribe.phoneNumber = phoneNumber;
      subscribe.participants = participants;
      subscribe.type = type;
      subscribe.timeZone = timeZone;
      subscribe.time = time;
      
      subscribe.save()
        .then(function() {
          res.redirect('/');
        });
    });
});

// POST: /subscriptions/:id/delete
router.post('/:id/delete', function(req, res, next) {
  const id = req.params.id;

  Subscribe.remove({_id: id})
    .then(function() {
      res.redirect('/');
    });
});

module.exports = router;
