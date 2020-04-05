var data = require('../data');
var { body,validationResult,sanitizeBody } = require('express-validator');
var express = require('express');
var router = express.Router();

// TODO: validation and sanitazitaion with express-validator

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
  await data.updateExistingEvent(req.params['eventId'], req.body);
  return res.redirect('../');
})

// GET event create form
router.get('/createEvent', (req, res, next) => {
  return res.render('edit/event_form', {
    mode: 'create',
    data: {}
  });
})

// POST event delete form
router.post('/:eventId/deleteEvent', async (req, res, next) => {
  console.log('event to delete:', req.params['eventId']);
  await data.deleteEvent(req.params['eventId']);
  return res.redirect('../..');
})

// POST event create form
router.post('/createEvent', async (req, res, next) => {
  console.log('event to create', req.body);
  await data.addNewEvent(req.body);
  return res.redirect('../');
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
router.post('/:eventId/createQuestion', async (req, res, next) => {
  console.log('question to add', req.body);
  await data.addNewQuestion(req.params['eventId'], req.body);
  return res.redirect('..');
})

// POST question delete form
router.post('/:eventId/:questionId/deleteQuestion', async (req, res, next) => {
  console.log('question to delete:', req.params['questionId']);
  await data.deleteQuestion(req.params['eventId'], req.params['questionId']);
  return res.redirect('../..');
})

// POST question change order form
router.post('/:eventId/:questionId/changeOrder', async (req, res, next) => {
  
  var oldOrder = parseInt(req.body['oldOrder']);
  var newOrder = parseInt(req.body['newOrder']);
  var questionRefs = await Promise.all([
    data.getQuestionRefByOrder(req.params['eventId'], oldOrder),
    data.getQuestionRefByOrder(req.params['eventId'], newOrder)
  ]);

  if (questionRefs[0] !== null && questionRefs[1] !== null) {
    await Promise.all([
      questionRefs[0].update({
        order: newOrder
      }),
      questionRefs[1].update({
        order: oldOrder
      })
    ]).then(() => console.log('order changed successfully'))
      .catch((error) => console.log(error));
  } else {
    console.log('no matching orders, invalid dataset');
  }

  return res.redirect('../..');
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
  await data.updateExistingQuestion(req.params['eventId'], req.params['questionId'], req.body);
  return res.redirect('../');
})



module.exports = router;