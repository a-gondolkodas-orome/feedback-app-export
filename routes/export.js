var data = require('../data');
var express = require('express');
var router = express.Router();

// TODO: JSON to CSV

// GET events listing.
router.get('/', async (req, res, next) => {
  events = await data.retrieveEventRefs();
  res.render('export/events', {
    events: events
  });
});

// GET questions listing.
router.get('/:eventId', async (req, res, next) => {
  questions = await data.retrieveQuestionRefs(req.params['eventId']);
  if (questions != null) {
    res.render('export/questions', {
      eventId: req.params['eventId'],
      questions: questions
    });
  } else {
    // Not found
    next();
  }
});

// GET answers listing.
router.get('/:eventId/:questionId', async (req, res, next) => {
  answers = await data.retrieveAnswerRefs(req.params['eventId'], req.params['questionId']);
  if (answers != null) {
    res.render('export/answers', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'], // redundant ATM
      answers: answers
    });
  } else {
    // Not found
    next();
  }
});

module.exports = router;