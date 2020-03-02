var data = require('../data');
var express = require('express');
var router = express.Router();

// TODO: JSON to CSV

// GET events listing.
router.get('/', function(req, res, next) {
  answers = data.getAnswers();
  res.render('events', {
    events: answers
  });
});

// GET questions listing.
router.get('/:eventId', function(req, res, next) {
  answers = data.getAnswers();
  if (answers.hasOwnProperty(req.params['eventId'])) {
    res.render('questions', {
      eventId: req.params['eventId'],
      questions: answers[req.params['eventId']]
    });
  } else {
    // Not found
    next();
  }
});

// GET answers listing.
router.get('/:eventId/:questionId', function(req, res, next) {
  answers = data.getAnswers();
  if (answers.hasOwnProperty(req.params['eventId'])
   && answers[req.params['eventId']].hasOwnProperty(req.params['questionId'])) {
    res.render('answers', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'], // redundant ATM
      answers: answers[req.params['eventId']][req.params['questionId']]
    });
  } else {
    // Not found
    next();
  }
});

module.exports = router;