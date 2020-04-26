var admin = require('firebase-admin');
var serviceAccount = require('./service-account-key.json');
var moment = require('moment-timezone')

var firebase_app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://feedback-app-ago.firebaseio.com'
});

// Get a database reference to our posts
const db = admin.firestore(firebase_app);

// EXPORT functions

function retrieveEventRefs() {
  console.log('retrieving events');
  return db.collection('events').get()
    .then((eventsSnapshot) => {
      let events = {};
      eventsSnapshot.forEach((eventDoc) => (events[eventDoc.id] = eventDoc));
      return events;
    })
}

function retrieveQuestionRefs(eventId) {
  console.log('retrieving questions of ' + eventId);
  return db.collection('events').doc(eventId).get()
    .then((eventSnapshot) => {
      if (!eventSnapshot.exists)
        throw new Error("Event " + eventId + " doesn't exist");
      return db.collection('events').doc(eventId).collection('questions').orderBy('order').get();
    })
    .then((questionsSnapshot) => {
      let questions = {};
      questionsSnapshot.forEach((questionDoc) => (questions[questionDoc.id] = questionDoc));
      return questions;
    })
}

function retrieveAnswerRefs(eventId, questionId) {
  console.log('retrieving answers: ' + eventId + '.' + questionId);
  let data = {
    questionData: {},
    answers: {}
  };
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).get()
    .then((questionDoc) => {
      if (!questionDoc.exists)
        throw new Error("Question " + eventId + "." + questionId + " doesn't exist");
      data.questionData = questionDoc.data();
      return db.collection('events').doc(eventId).collection('questions').doc(questionId).collection('answers').orderBy('timestamp').get();
    })
    .then((answersSnapshot) => answersSnapshot.forEach((answerDoc) => {
        data.answers[answerDoc.id] = answerDoc.data();
        data.answers[answerDoc.id]['timestamp'] =
          moment(data.answers[answerDoc.id]['timestamp'].toDate())
            .tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm');
    }))
    .then(() => data)
}


// Retrieve data in JSON from firebase

function retrieveEventJSON(eventId) {
  console.log('retrieving JSON data of', eventId);
  return Promise.all([
    db.collection('events').doc(eventId).collection('questions').get(),
    getUserInfos()
  ]).then(([questions, userInfos]) => {
      let questionJSONPromises = [];
      questions.forEach((questionDoc) =>
        questionJSONPromises.push(retrieveQuestionJSON(eventId, questionDoc.id, userInfos))
      );
      return questionJSONPromises;
    })
    .then((promises) => Promise.all(promises))
}

function retrieveQuestionJSON(eventId, questionId, userInfos) {
  let answers = {
    questionId: questionId,
    answers: []
  };
  return retrieveSingleQuestion(eventId, questionId)
    .then((questionData) => answers.questionText = questionData['text'])
    .then(() => db.collection('events').doc(eventId).collection('questions').doc(questionId).collection('answers').get())
    .then((answersSnapshot) => answersSnapshot.forEach((answerDoc) => {
        let name = answerDoc.data().name;
        let userInfo = userInfos[name] === undefined ? {
                                                  year: undefined,
                                                  city: "",
                                                  school: ""
                                                } : userInfos[name];
        answers['answers'].push({
          answer: answerDoc.data()['answer'],
          name:   answerDoc.data()['name'],
          year:   userInfo.year,
          city:   userInfo.city,
          school: userInfo.school,
          timestamp: moment(answerDoc.data()['timestamp'].toDate())
                        .tz('Europe/Budapest').format('YYYY. MM. DD. HH:mm')
        });
      })
    )
    .then(() => answers)
}


// EDIT functions

//   EDIT EVENT functions

function retrieveEventData(eventId) {
  console.log('retrieving data for event ' + eventId);
  return db.collection('events').doc(eventId).get()
    .then((eventDoc) => {
      if (!eventDoc.exists)
        throw new Error("Event " + eventId + " doesn't exist.");
      return eventDoc.data();
    })
}

function addNewEvent(event) {
  db.collection('events').doc(event['id']).set({
    code: event['code'],
    name: event['name'],
    frequency: parseInt(event['freq']),
    from:  moment.tz(event['from' ], 'YYYY. MM. DD. HH:mm', 'Europe/Budapest'),
    until: moment.tz(event['until'], 'YYYY. MM. DD. HH:mm', 'Europe/Budapest'),
    duration: event['duration'],
    morning:  event['morning'],
    evening:  event['evening']
  })
  .then(() => {
    return console.log('New event added:', event['id']);
  })
  .catch(console.log)
}

function updateExistingEvent(eventId, event) {
  db.collection('events').doc(eventId).update({
    code: event['code'],
    name: event['name'],
    frequency: parseInt(event['freq']),
    from:  moment.tz(event['from' ], 'YYYY. MM. DD. HH:mm', 'Europe/Budapest'),
    until: moment.tz(event['until'], 'YYYY. MM. DD. HH:mm', 'Europe/Budapest'),
    duration: event['duration'],
    morning:  event['morning'],
    evening:  event['evening']
  })
  .then(() => {
    return console.log('Existing event updated:', eventId);
  })
  .catch((error) => {
    console.log(error);
  });
}


// EDIT QUESTION functions

function retrieveSingleQuestion(eventId, questionId) {
  console.log('retrieving question data: ' + eventId + '.' + questionId);
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).get()
    .then((questionDoc) => {
      if (!questionDoc.exists)
        throw new Error("Question " + eventId + "." + questionId + " doesn't exist.");
      return questionDoc.data();
    })
}


function addNewQuestion(eventId, question) {
  return db.collection('events').doc(eventId).collection('questions').orderBy('order', 'desc').get()
    .then((querySnapshot) => (querySnapshot.empty ? 0 : 1 + querySnapshot.docs[0].data().order))
    .then((order) => ({
      order: order,
      text:  question['text'],
      type:  question['type'],
    }))
    .then((data) => {
      if (question['type'] === 'wordcloud') {
        data['words'] = [];
        for (var i = 0; i < question['numWords']; i++)
          data['words'].push(data['word_'+i]);
      }
      return data;
    })
    .then(db.collection('events').doc(eventId).collection('questions').doc(question['id']).set)
    .then(() => console.log('New question added:', question['id']))
    .catch(console.log);
}

function updateExistingQuestion(eventId, questionId, question) {
  let data = {
    text:  question['text'],
    type:  question['type'],
  }
  if (question['type'] === 'wordcloud') {
    data['words'] = [];
    for (var i = 0; i < question['numWords']; i++) {
      data['words'].push(question['word_'+i]);
    }
  }
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).update(data)
    .then(() => console.log('Existing question updated: ' + eventId + '.' + questionId))
    .catch(console.log)
}


function deleteEvent(eventId) {
  // NOTE: data is still accessible in console if it had subcollection, only it doesn't show up in queries
  return db.collection('events').doc(eventId).delete();
}

function deleteQuestion(eventId, questionId) {
  // NOTE: data is still accessible in console if it had subcollection, only it doesn't show up in queries
  return db.collection('events').doc(eventId).collection('questions').doc(questionId).delete();
}


function getQuestionRefByOrder(eventId, order) {
  console.log('getting question: ' + eventId + '#' + order);
  return db.collection('events').doc(eventId).collection('questions').where('order', '==', order).get()
    .then((querySnapshot) => {
      if (querySnapshot.empty)
        throw new Error("Question with order " + order + " doesn't exist");
      return querySnapshot.docs[0].ref;
    })
}


function getUserInfos() {
  return db.collection('users').get()
    .then((usersSnapshot) => {
      let users = {}
      usersSnapshot.forEach((user) => { users[user.id] = user.data() })
      return users
    })
}



module.exports = {
  retrieveEventRefs, retrieveQuestionRefs, retrieveAnswerRefs, retrieveEventJSON,
  retrieveEventData, retrieveSingleQuestion, getQuestionRefByOrder,
  addNewEvent, updateExistingEvent, deleteEvent,
  addNewQuestion, updateExistingQuestion, deleteQuestion,
};
