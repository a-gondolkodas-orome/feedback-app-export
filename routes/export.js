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

let answers = {}

table.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
        answers[doc.id] = []
        console.log(doc.id);
        let answersRef = table.doc(doc.id).collection("answers");
        answersRef.get()
          .then((_answers) => {
            _answers.forEach((answer) => {
              answers[doc.id].push(answer.data());
            });
          });
    });
  });

// TODO: JSON to CSV

/* GET answers listing. */
router.get('/', function(req, res, next) {
  // e.g. send "hasznos" for now
  res.render('export', {answers: answers["hasznos"]});
});

module.exports = router;



