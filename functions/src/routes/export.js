var data = require('../data');
var parser = require('json2csv');
var express = require('express');
var router = express.Router();

// GET events listing.
router.get('/', async (req, res, next) => await
  data.retrieveEventRefs()
    .then((events) => res.render('export/events', {
      events: events
    }))
    .catch((error) => {
      console.log(error);
      res.status(404).send("Sajnos nem sikerült elérni az eseményeket, próbáld újra később.");
    })
);

// GET questions listing.
router.get('/:eventId', async (req, res, next) => await
  data.retrieveQuestionRefs(req.params['eventId'])
    .then((questions) => res.render('export/questions', {
      eventId: req.params['eventId'],
      questions: questions
    }))
    .catch((error) => {
      console.log(error);
      res.status(404).send("Nincs ilyen esemény.");
    })
);

// GET event CSV export
router.get('/:eventId/csvExport', async (req, res, next) => await
  data.retrieveEventJSON(req.params['eventId'])
    .then((eventJSON) => {
      const fields = [
        'questionId',
        'questionText',
        'answers.answer',
        'answers.name',
        'answers.year',
        'answers.city',
        'answers.school',
        'answers.timestamp'
      ];
      let csv = parser.parse(eventJSON, {
          fields,
          unwind: 'answers'
      });
      res.attachment(req.params['eventId'] + '.csv');
      return res.send(csv);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("Nincs ilyen esemény.");
    })
)

// GET answers listing.
router.get('/:eventId/:questionId', async (req, res, next) => await
  data.retrieveAnswerRefs(req.params['eventId'], req.params['questionId'])
  .then(([answers, question]) => res.render('export/answers', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'], // redundant ATM
      question: question,
      answers: answers
  }))
  .catch((error) => {
    console.log(error);
    res.status(404).send("Nincs ilyen kérdés.");
  })
);

module.exports = router;