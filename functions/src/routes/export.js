var data = require('../data');
var parser = require('json2csv');
var express = require('express');
var router = express.Router();

// TODO: JSON to CSV

// GET events listing.
router.get('/', async (req, res, next) => {
  console.log('rq url was', req.originalUrl);
  events = await data.retrieveEventRefs();
  return res.render('export/events', {
    events: events
  });
});

// GET questions listing.
router.get('/:eventId', async (req, res, next) => {
  questions = await data.retrieveQuestionRefs(req.params['eventId']);
  if (questions !== null) {
    return res.render('export/questions', {
      eventId: req.params['eventId'],
      questions: questions
    });
  } else {
    // Not found
    return next();
  }
});

// GET event CSV export
router.get('/:eventId/csvExport', async (req, res, next) => {
  eventJSON = await data.retrieveEventJSON(req.params['eventId']);
  if (eventJSON === null) {
    return res.status(404).send('No event found.');
  }
  const fields = ['questionId', 'answers.answer', 'answers.name', 'answers.timestamp'];
  let csv = parser.parse(eventJSON, { fields, unwind: 'answers' });
  res.attachment(req.params['eventId'] + '.csv');
  return res.send(csv);
})

// GET answers listing.
router.get('/:eventId/:questionId', async (req, res, next) => {
  answers = await data.retrieveAnswerRefs(req.params['eventId'], req.params['questionId']);
  if (answers !== null) {
    return res.render('export/answers', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'], // redundant ATM
      answers: answers
    });
  } else {
    // Not found
    return next();
  }
});

module.exports = router;