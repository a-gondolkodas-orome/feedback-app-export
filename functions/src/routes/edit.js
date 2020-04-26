var data = require('../data');
var { body,validationResult,sanitizeBody } = require('express-validator');
var moment = require('moment-timezone');
var express = require('express');
var router = express.Router();

// TODO: validation and sanitazitaion with express-validator


// EVENT functions

// GET events listing.
router.get('/', async (req, res, next) => await
  data.retrieveEventRefs()
    .then((events) => res.render('edit/events', {
      events: events
    }))
    .catch((error) => {
      console.log(error);
      res.status(404).send("Sajnos nem sikerült elérni az eseményeket, próbáld újra később.");
    })
);


// GET event create form
router.get('/createEvent', (req, res, next) => res.render('edit/event_form', {
    mode: 'create',
    data: {},
    from: moment().tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm'),
    until:moment().tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm')
}));

// POST event create form
router.post('/createEvent', async (req, res, next) => {
  await data.addNewEvent(req.body);
  return res.redirect('../');
});


// GET event update form
router.get('/:eventId/editEvent', async (req, res, next) => await
  data.retrieveEventData(req.params['eventId'])
    .then((event) => res.render('edit/event_form', {
      eventId: req.params['eventId'],
      data: event,
      mode: 'update',
      from: moment(event['from' ].toDate()).tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm'),
      until:moment(event['until'].toDate()).tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm')
    }))
    .catch((error) => {
      console.log(error);
      res.status(404).send("Nincs ilyen esemény.");
    })
);

// POST event update form
router.post('/:eventId/editEvent', async (req, res, next) => {
  await data.updateExistingEvent(req.params['eventId'], req.body);
  return res.redirect('../');
})

// POST event delete form
router.post('/:eventId/deleteEvent', async (req, res, next) => {
  await data.deleteEvent(req.params['eventId']);
  return res.redirect('../..');
})


// QUESTION functions

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
  
  let oldOrder = parseInt(req.body['oldOrder']);
  let newOrder = parseInt(req.body['newOrder']);
  await Promise.all([
    data.getQuestionRefByOrder(req.params['eventId'], oldOrder),
    data.getQuestionRefByOrder(req.params['eventId'], newOrder)
  ]).then(([oldQuestion, newQuestion]) => Promise.all([
      oldQuestion.update({
        order: newOrder
      }),
      newQuestion.update({
        order: oldOrder
      })
    ]))
    .then(() => console.log('Order changed successfully'))
    .catch(console.log)

  return res.redirect('../..');
})

// GET question update form.
router.get('/:eventId/:questionId', async (req, res, next) => await
  data.retrieveSingleQuestion(req.params['eventId'], req.params['questionId'])
    .then((question) => res.render('edit/question_form', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'],
      data: question,
      mode: 'update'
    }))
    .catch((error) => {
      console.log(error);
      res.status(404).send("Nincs ilyen kérdés.");
    })
);

// POST question update form.
router.post('/:eventId/:questionId', (req, res, next) => {
  data.updateExistingQuestion(req.params['eventId'], req.params['questionId'], req.body);
  return res.redirect('../');
});



module.exports = router;