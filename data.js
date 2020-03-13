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


function retrieveQuestionJSON(eventId, questionId) {
  return new Promise(resolve  => {
    let answers = {
      questionId: questionId,
      answers: []
    };
    collection = db.collection('events').doc(eventId).collection('questions').doc(questionId).collection('answers');
    collection.get()
      .then((_answers) => {
        _answers.forEach((answerDoc) => {
          answers['answers'].push({
            answer: answerDoc.data()['answer'],
            name:   answerDoc.data()['name'],
            timestamp: answerDoc.data()['timestamp'].toDate().toLocaleString()
          });
        });
        resolve(answers);
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      });
  });
}


// Retrieve data in JSON from firebase
function retrieveEventJSON(eventId) {
  console.log('retrieving JSON data for', eventId);
  return new Promise(resolve => {
    answersArray = [];

    event = db.collection('events').doc(eventId);
    event.get()
      .then((eventDoc) => {
        if (eventDoc.exists) {
          event.collection('questions').get()
            .then((_questions) => {
              questionJSONPromises = []
              _questions.forEach((questionDoc) => {
                questionJSONPromises.push(
                  retrieveQuestionJSON(eventId, questionDoc.id)
                );
              });
              Promise.all(questionJSONPromises).then(resolve);
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      });
  });
}

async function retrieveEventRefs() {
  return new Promise(resolve => {
    events = {};
    console.log('retrieving events');
    db.collection('events').get()
      .then((eventsSnapshot) => {
        eventsSnapshot.forEach((eventDoc) => (events[eventDoc.id] = eventDoc));
        console.log('events retrieved');
        resolve(events);
      })
      .catch((error) => (console.log(error)));
  });
}

async function retrieveQuestionRefs(eventId) {
  return new Promise(resolve => {
    questions = {};
    console.log('retrieving questions: ' + eventId);
    db.collection('events').doc(eventId).get()
      .then((eventDoc) => {
        if (eventDoc.exists) {
          db.collection('events').doc(eventId).collection('questions').get()
            .then((questionsSnapshot) => {
              questionsSnapshot.forEach((questionDoc) => (questions[questionDoc.id] = questionDoc));
              console.log('questions retrieved');
              resolve(questions);
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        } else {
          console.log('event ' + eventId + ' does not exists');
          resolve(null);
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      });
  });
}

async function retrieveAnswerRefs(eventId, questionId) {
  return new Promise(resolve => {
    console.log('retrieving answers: ' + eventId + '.' + questionId);
    db.collection('events').doc(eventId).collection('questions').doc(questionId).get()
      .then((questionDoc) => {
        if (questionDoc.exists) {
          db.collection('events').doc(eventId).collection('questions').doc(questionId).collection('answers').get()
            .then((answersSnapshot) => {
              if (!answers.hasOwnProperty(eventId))
                answers[eventId] = {}
              if (!answers[eventId].hasOwnProperty(questionId))
                answers[eventId][questionId] = {}
              answersSnapshot.forEach((answerDoc) => {
                answers[eventId][questionId][answerDoc.id] = answerDoc.data();
              });
              console.log('answers retrieved');
              resolve(answers[eventId][questionId]);
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        } else {
          console.log('question ' + eventId + '.' + questionId + ' does not exists');
          resolve(null);
        }
      });
  });
}

async function retrieveEventData(eventId) {
  return new Promise(resolve => {
    console.log('retrieving data for event ' + eventId);
    db.collection('events').doc(eventId).get()
      .then((eventDoc) => {
        if (eventDoc.exists) {
          resolve(eventDoc.data());
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      })
  })
}

async function retrieveSingleQuestion(eventId, questionId) {
  return new Promise(resolve => {
    console.log('retrieving question data: ' + eventId + '.' + questionId);
    db.collection('events').doc(eventId).collection('questions').doc(questionId).get()
      .then((questionDoc) => {
        if (questionDoc.exists) {
          resolve(questionDoc.data());
        } else {
          resolve(null);
        }
      })
  })
}



function getAnswers() {
  return answers;
}


module.exports = {retrieveEventRefs, retrieveQuestionRefs, retrieveAnswerRefs, retrieveEventData, retrieveSingleQuestion, retrieveEventJSON};