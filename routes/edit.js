var data = require('../data');
var { body,validationResult,sanitizeBody } = require('express-validator');
var express = require('express');
var router = express.Router();

// TODO: validation and sanitazitaion with express-validator

// GET events listing.
router.get('/', async (req, res, next) => {
  events = await data.retrieveEventRefs();
  res.render('edit/events', {
    events: events
  });
});

// GET event update form
router.get('/:eventId/editEvent', async (req, res, next) => {
  event = await data.retrieveEventData(req.params['eventId']);
  if (event != null) {
    res.render('edit/event_update_form', {
      event: event
    });
  } else {
    // Not found
    next();
  }
});

// POST event update form
router.post('/:eventId/editEvent', async (req, res, next) => {
  console.log('POSTed: ', req.body);
  fromDate = new Date(Date.parse(req.body['from']));
  untilDate = new Date(Date.parse(req.body['until']));
//  console.log('from is', new Date(Date.parse(req.body['from'])).toLocaleString());
  next();
})

// GET event create form
router.get('/createEvent', (req, res, next) => {
  res.render('edit/event_create_form');
})

// POST event create form
router.post('/createEvent', (req, res, next) => {
  console.log('event to create', req.body);
  next();
})

// GET questions listing.
router.get('/:eventId', async (req, res, next) => {
  questions = await data.retrieveQuestionRefs(req.params['eventId']);
  if (questions != null) {
    res.render('edit/questions', {
      eventId: req.params['eventId'],
      questions: questions
    });
  } else {
    // Not found
    next();
  }
});

// GET question create form
router.get('/:eventId/createQuestion', (req, res, next) => {
  res.render('edit/question_create_form', {
    eventId: req.params['eventId']
  })
})

// POST question create form
router.post('/:eventId/createQuestion', (req, res, next) => {
  console.log('question to add', req.body);
})

// GET update form.
router.get('/:eventId/:questionId', async (req, res, next) => {
    question = await data.retrieveSingleQuestion(req.params['eventId'], req.params['questionId']);
    if (questions != null) {
      res.render('edit/question_update_form', {
        question: question
      });
    } else {
       // Not found
      next();
    }
})

// POST update form.
router.post('/:eventId/:questionId', async (req, res, next) => {
  console.log('POSTed ' + req.body['text'] + ' ' + req.body['type']);
  next();
})



module.exports = router;