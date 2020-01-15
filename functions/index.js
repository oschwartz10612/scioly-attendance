// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
var express = require('express'); // Express web server framework
var app = express();

// The Firebase Admin SDK to access the Firebase Realtime Database.
var admin = require("firebase-admin");

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
