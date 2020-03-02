var firebase = require("firebase");

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
var events = db.collection('events');

var answers = {};

// Retrieve data from firebase
// Fill up answers data structure
function retrieveData() {

  console.log('retrieving data...');

  events.get()
    .then((_events) => {
      _events.forEach((eventDoc) => {
        // now for testing just use sample to decrease reads from firebase
        if (eventDoc.id == 'mamut-2019-szervezo' || eventDoc.id == 'test') return;
        answers[eventDoc.id] = {};
        questionCollection = events.doc(eventDoc.id).collection('questions');
        questionCollection.get()
          .then((_questions) => {
            _questions.forEach((questionDoc) => {
              answers[eventDoc.id][questionDoc.id] = {};
              questionCollection.doc(questionDoc.id).collection('answers').get()
                .then((_answers) => {
                  _answers.forEach((answerDoc) => {
                    answers[eventDoc.id][questionDoc.id][answerDoc.id] = answerDoc.data();
                  });
                })
                .catch((error) => {
                  console.log(error);
                });
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
      console.log('data received');
    })
    .catch((error) => {
      console.log(error);
    });

}

// NOTE: this counts as #docs reads in the firestore billing ~1.2K currently
retrieveData();


function getAnswers() {
  return answers;
}


module.exports = {retrieveData, getAnswers};