var firebase = require("firebase");
var serviceAccount = require('./service-account-key.json');
var admin = require('firebase-admin');

var firebase_app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://feedback-app-ago.firebaseio.com'
});

// Get a database reference to our posts
var db = admin.firestore(firebase_app);

// TODO: refactor nested promises

function retrieveQuestionJSON(eventId, questionId) {
  return new Promise(resolve  => {
    retrieveSingleQuestion(eventId, questionId).then((questionData) => {
      let answers = {
        questionId: questionId,
        questionText: questionData['text'],
        answers: []
      };
      return db.collection('events').doc(eventId).collection('questions').doc(questionId).collection('answers').get()
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
    }).catch((error) => {
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
          db.collection('events').doc(eventId).collection('questions').orderBy('order').get()
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
  return db.collection('events').doc(event['id']).set({
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
  var order = await db.collection('events').doc(eventId).collection('questions').orderBy('order', 'desc').get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return 0;
      } else {
        return querySnapshot.docs[0].data()['order'] + 1;
      }
    })
    .catch((error) => {
      console.log(error);
      return 0;
    });
  let data = {
      order: order,
      text:  question['text'],
      type:  question['type'],
  };
  if (question['type'] === 'wordcloud') {
    data['words'] = question['words'].split(', ');
  }
  let doc = db.collection('events').doc(eventId).collection('questions').doc(question['id']);
  return doc.set(data)
  .then(() => {
    return console.log('new question added:', question['id']);
  })
  .catch((error) => {
    console.log(error);
  });
}

async function updateExistingQuestion(eventId, questionId, question) {
  let data = {
    text:  question['text'],
    type:  question['type'],
  }
  if (question['type'] === 'wordcloud') {
    data['words'] = question['words'].split(', ');
  }
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).update(data)
  .then(() => {
    return console.log('existing question updated', eventId+'.'+questionId);
  })
  .catch((error) => {
    console.log(error);
  })
}


async function deleteEvent(eventId) {
  // NOTE: data is still accessible in console but doesn't show up in queries, although I couldn't find in console...
  return db.collection('events').doc(eventId).delete();
}

function deleteQuestion(eventId, questionId) {
  // NOTE: data is still accessible in console but doesn't show up in queries, although I couldn't find in console...
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).delete();
}


async function getQuestionRefByOrder(eventId, order) {

  return new Promise((resolve, reject) => {
    console.log('getting question [event: ' + eventId + ', order: ' + order + ']');
    db.collection('events').doc(eventId).collection('questions').where('order', '==', order).get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          resolve(null);
          return console.log('error: no questions with order ' + order);
        } else {
          resolve(querySnapshot.docs[0].ref);
          return('ref found');
        }
      })
      .catch((error) => {
        resolve(null);
        return console.log(error);
      })
  });
}





module.exports = {retrieveEventRefs, retrieveQuestionRefs, retrieveAnswerRefs, retrieveEventData,
                  retrieveSingleQuestion, retrieveEventJSON, addNewEvent, updateExistingEvent,
                  addNewQuestion, updateExistingQuestion, deleteEvent, deleteQuestion,
                  getQuestionRefByOrder};
