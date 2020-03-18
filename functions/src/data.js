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

// TODO: refactor nested promises

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
        return console.log(eventId+'.'+questionId, 'JSON retrieved');
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
              return Promise.all(questionJSONPromises).then(resolve).catch((error) => {console.log(error); resolve(null);});
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        }
        return;
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
        resolve(events);
        return console.log('events retrieved');
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
              resolve(questions);
              return console.log('questions retrieved');
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        } else {
          console.log('event ' + eventId + ' does not exists');
          resolve(null);
        }
        return;
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
    answers = {}
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
              resolve(answers[eventId][questionId]);
              return console.log('answers retrieved');
            })
            .catch((error) => {
              console.log(error);
              resolve(null);
            });
        } else {
          console.log('question ' + eventId + '.' + questionId + ' does not exists');
          resolve(null);
        }
        return;
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
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
          return console.log('event data retrieved:', eventId);
        } else {
          resolve(null);
          return console.log('event data could not be retrieved', eventId);
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
        return;
      })
      .catch((error) => {
        console.log(error);
      })
  })
}


async function addNewEvent(event) {
  db.collection('events').doc(event['id']).set({
    code: event['code'],
    name: event['name'],
    frequency: parseInt(event['freq']),
    from: new Date(Date.parse(event['from'])),
    until: new Date(Date.parse(event['until']))
  })
  .then(() => {
    return console.log('new event added:', event['id']);
  })
  .catch((error) => {
    console.log(error);
  });
}

async function updateExistingEvent(eventId, event) {
  db.collection('events').doc(eventId).update({
    code: event['code'],
    name: event['name'],
    frequency: parseInt(event['freq']),
    from: new Date(Date.parse(event['from'])),
    until: new Date(Date.parse(event['until']))
  })
  .then(() => {
    return console.log('existing event updated:', eventId);
  })
  .catch((error) => {
    console.log(error);
  });
}


async function addNewQuestion(eventId, question) {
  let data = {
      order: parseInt(question['order']),
      text:  question['text'],
      type:  question['type'],
  };
  if (question['type'] === 'wordcloud') {
    data['words'] = question['words'].split(', ');
  }
  let doc = db.collection('events').doc(eventId).collection('questions').doc(question['id']);
  doc.set(data)
  .then(() => {
    return console.log('new question added:', question['id']);
  })
  .catch((error) => {
    console.log(error);
  });
}

async function updateExistingQuestion(eventId, questionId, question) {
  let data = {
    order: parseInt(question['order']),
    text:  question['text'],
    type:  question['type'],
  }
  if (question['type'] === 'wordcloud') {
    data['words'] = question['words'].split(', ');
  }
  db.collection('events').doc(eventId).collection('questions').doc(questionId).update(data)
  .then(() => {
    return console.log('existing question updated', eventId+'.'+questionId);
  })
  .catch((error) => {
    console.log(error);
  })
}


module.exports = {retrieveEventRefs, retrieveQuestionRefs, retrieveAnswerRefs, retrieveEventData, retrieveSingleQuestion, retrieveEventJSON, addNewEvent, updateExistingEvent, addNewQuestion, updateExistingQuestion};