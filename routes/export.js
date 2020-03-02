var firebase = require("firebase");
var express = require('express');
var router = express.Router();

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDmshJPEN5RyoQB5HI9f6vf4Ys7dn8Gkkw",
  projectId: "feedback-app-ago",
  authDomain: "feedback-app-ago.firebaseapp.com",
  databaseURL: "https://feedback-app-ago.firebaseio.com",
  storageBucket: "feedback-app-ago.appspot.com"
};

firebase.initializeApp(firebaseConfig);

// Get a database reference to our posts
var db = firebase.firestore();

const table = db.collection("events").doc("mamut-2019-szervezo").collection("questions");
const events = db.collection('events');


// Retrieve data from firebase

let answers = {}

events.get()
  .then((_events) => {
    _events.forEach((eventDoc) => {
      answers[eventDoc.id] = {};
      questionCollection = events.doc(eventDoc.id).collection('questions');
      questionCollection.get()
        .then((_questions) => {
          _questions.forEach((questionDoc) => {
            answers[eventDoc.id][questionDoc.id] = [];
            questionCollection.doc(questionDoc.id).collection('answers').get()
              .then((_answers) => {
                _answers.forEach((answerDoc) => {
                  answers[eventDoc.id][questionDoc.id].push(answerDoc.data());
                })
              })
          })
        })
    });
  });

// TODO: JSON to CSV

/* GET answers listing. */
router.get('/', function(req, res, next) {
  res.render('events', {
    events: answers
  });
});

router.get('/:eventId', function(req, res, next) {
  if (answers.hasOwnProperty(req.params['eventId'])) {
    res.render('questions', {
      eventId: req.params['eventId'],
      questions: answers[req.params['eventId']]
    });
  } else {
    next();
  }
});

router.get('/:eventId/:questionId', function(req, res, next) {
  if (answers.hasOwnProperty(req.params['eventId'])
   && answers[req.params['eventId']].hasOwnProperty(req.params['questionId'])) {
    res.render('answers', {
      eventId: req.params['eventId'],
      questionId: req.params['questionId'], // redundant ATM
      answers: answers[req.params['eventId']][req.params['questionId']]
    });
  } else {
    next();
  }
});

module.exports = router;



