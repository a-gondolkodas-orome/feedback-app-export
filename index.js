var firebase = require("firebase");
const express = require('express');
const app = express();

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

app.get('/', (req, res) => {
  var response = ["<!DOCTYPE html><html><head>",
    "<style>table {width: 75%; border: 1px solid black; border-collapse: collapse; }</style>",
    "</head><body><table><tr><th>question</th><th>name</th><th>answer</th></tr>"];
  Object.keys(answers).forEach((key) => {
    answers[key].forEach((ans) => {
      response.push(
        "<tr>",
        "<td>" + key + "</td>",
        "<td>" + ans["name"] + "</td>",
        "<td>" + ans["answer"] + "</td>",
        "<td>" + ans["timestamp"].toDate().toLocaleString() + "</td>",
        "</tr>",
      );
    });
  });
  response.push("</table></body></html>");
  res.send(response.join(""));
});

app.listen(8000, () => {
  console.log('export app listening on port 8000')
});






