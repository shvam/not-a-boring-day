'use strict';

const mongoose = require('mongoose');
const moment = require('moment');
const cfg = require('../config');
const axios = require('axios');
const Twilio = require('twilio');
//const bodyParser = require('body-parser');

const SubscribeSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  participants: Number,
  type: String,
  timeZone: String,
  time: {type: Date, index: true} 
});

SubscribeSchema.methods.requiresNotification = function(date) {
  console.log(this.time);
  return Math.round(moment.duration(moment(this.time).tz(this.timeZone).utc().hour()
                          -moment(date).utc().hour())) == 0;
};

SubscribeSchema.statics.sendNotifications = function(callback) {
  // now
  const searchDate = new Date();
  Subscribe
    .find()
    .then(function(subscriptions) {
      subscriptions = subscriptions.filter(function(subscription) {
        return subscription.requiresNotification(searchDate);
      });
      if (subscriptions.length > 0) {
        sendNotifications(subscriptions);
      }
    });

    /**
    * Send messages to all appoinment owners via Twilio
    * @param {array} subscriptions List subscriptions.
    */
    function sendNotifications(subscriptions) {
        const client = new Twilio(cfg.twilioAccountSid, cfg.twilioAuthToken);
        class Action {
          constructor(atype='Hobby', activity='Find yourself in your favorite hobby'){
            this.atype = atype;
            this.activity = activity;
          }
          setatype(atype){
            this.atype=atype;
            console.log(this.atype);
          }
          setactivity(activity){
            this.activity=activity;
            console.log(this.activity);
          }
          getatype(){
            return this.atype;
          }
          getactivity(){
            return this.activity;
          }
        };

        var actnow = new Action();

        subscriptions.forEach(function(subscriber) {
            // Create options to send the message
            console.log(subscriber.type);
            console.log(subscriber.participants);
            axios.get(`http://www.boredapi.com/api/activity?type=${subscriber.type}&participants=${subscriber.participants}`)
            .then(response => {
              actnow.setactivity(response.data.activity);
              actnow.setatype(response.data.type);
              //subscriber.activity = response.data.activity;

              const options = {
                to: `+ ${subscriber.phoneNumber}`,
                from: cfg.twilioPhoneNumber,
                /* eslint-disable max-len */
                body: `Hi ${subscriber.name},\n Suggestion for today\n Activity type : ${response.data.type}\n Activity : ${response.data.activity}\n Good luck`,
                /* eslint-enable max-len */
              };

              client.messages.create(options, function(err, response) {
                if (err) {
                    // Just log it for now
                    console.error(err);
                } else {
                    // Log the last few digits of a phone number
                    let masked = subscriber.phoneNumber.substr(0,
                        subscriber.phoneNumber.length - 5);
                    masked += '*****';
                    console.log(`Message sent to ${masked}`);
              }
              });
            })
            .catch(error => {
              console.log(error);
            });    
        });
        // Don't wait on success/failure, just indicate all messages have been
        // queued for delivery
        if (callback) {
          callback.call();
        }
    }
};



const Subscribe = mongoose.model('Subscribe', SubscribeSchema);
module.exports = Subscribe;
