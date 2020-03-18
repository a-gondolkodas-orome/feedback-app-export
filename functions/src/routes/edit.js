var data = require('../data');
var { body,validationResult,sanitizeBody } = require('express-validator');
var express = require('express');
var router = express.Router();

// TODO: validation and sanitazitaion with express-validator
// TODO: delete events + questions

// GET events listing.
router.get('/', async (req, res, next) => {
  events = await data.retrieveEventRefs();
  return res.render('edit/events', {
    events: events
  });
});

// GET event update form
router.get('/:eventId/editEvent', async (req, res, next) => {
  event = await data.retrieveEventData(req.params['eventId']);
  if (event !== null) {
    return res.render('edit/event_form', {
      eventId: req.params['eventId'],
      data: event,
      mode: 'update'
    });
  } else {
    // Not found
    return next();
  }
});

// POST event update form
router.post('/:eventId/editEvent', async (req, res, next) => {
  console.log('POSTed: ', req.body);
  fromDate = new Date(Date.parse(req.body['from']));
  untilDate = new Date(Date.parse(req.body['until']));
//  console.log('from is', new Date(Date.parse(req.body['from'])).toLocaleString());
  data.updateExistingEvent(req.params['eventId'], req.body);
  return res.redirect('/edit');
})

// GET event create form
router.get('/createEvent', (req, res, next) => {
  return res.render('edit/event_form', {
    mode: 'create',
    data: {}
  });
})

// POST event create form
router.post('/createEvent', (req, res, next) => {
  console.log('event to create', req.body);
  data.addNewEvent(req.body);
  return res.redirect('/edit');
})

// GET questions listing.
router.get('/:eventId', async (req, res, next) => {
  questions = await data.retrieveQuestionRefs(req.params['eventId']);
  if (questions !== null) {
    return res.render('edit/questions', {
      eventId: req.params['eventId'],
      questions: questions
    });
  } else {
    // Not found
    return next();
  }
});

// GET question create form
router.get('/:eventId/createQuestion', (req, res, next) => {
  return res.render('edit/question_form', {
    eventId: req.params['eventId'],
    mode: 'create',
    data: {}
  })
})

// POST question create form
router.post('/:eventId/createQuestion', (req, res, next) => {
  console.log('question to add', req.body);
  data.addNewQuestion(req.params['eventId'], req.body);
  return res.redirect('/edit/'+req.params['eventId']);
})

// GET question update form.
router.get('/:eventId/:questionId', async (req, res, next) => {
    question = await data.retrieveSingleQuestion(req.params['eventId'], req.params['questionId']);
    if (question !== null) {
      return res.render('edit/question_form', {
        eventId: req.params['eventId'],
        questionId: req.params['questionId'],
        data: question,
        mode: 'update'
      });
    } else {
       // Not found
      return next();
    }
})

// POST question update form.
router.post('/:eventId/:questionId', async (req, res, next) => {
  console.log('POSTed ' + req.body['text'] + ' ' + req.body['type']);
  data.updateExistingQuestion(req.params['eventId'], req.params['questionId'], req.body);
  return res.redirect('/edit/'+req.params['eventId']);
})



module.exports = router;