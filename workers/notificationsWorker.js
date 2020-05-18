'use strict';

const Subscribe = require('../models/subscribe');

const notificationWorkerFactory = function() {
  return {
    run: function() {
      Subscribe.sendNotifications();
    },
  };
};

module.exports = notificationWorkerFactory();
