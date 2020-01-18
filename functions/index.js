// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
var express = require('express'); // Express web server framework
var app = express();

// The Firebase Admin SDK to access the Firebase Realtime Database.
var admin = require("firebase-admin");
const firebase_tools = require('firebase-tools');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qr-attendance-ac87d.firebaseio.com"
});

app.get('/import',(req,res) => {
    var meeting = req.query.m
    var name = req.query.n
    var quarter = req.query.q
    var status = req.query.s
  
    admin.firestore().collection(quarter).doc(name).set({
        name: name
    }).catch((error) => {
        console.error("Error writing document: ", error)
    })

    admin.firestore().collection(quarter).doc(name).collection('meetings').doc(meeting).set({  
    meeting: meeting,
    status: status
    }).catch((error) => {
        console.error("Error writing document: ", error)
    })

    admin.firestore().collection(quarter).doc('all-meetings').collection('meetings').doc(meeting).set({  
    meeting: meeting
    }).catch((error) => {
        console.error("Error writing document: ", error)
    })

    res.redirect('back')
})

exports.app = functions.https.onRequest(app)

//Delete Collection
exports.recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall((data, context) => {
    // Only allow admin users to execute this function.
    if (!(context.auth.token.email == 'leadership@roboscienceolympiad.org')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an administrative user to initiate delete.'
      );
    }

    const path = data.path;
    console.log(
      `User ${context.auth.uid} has requested to delete path ${path}`
    );

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    return firebase_tools.firestore
      .delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
      })
      .then(() => {
        return {
          path: path 
        };
      });
  });