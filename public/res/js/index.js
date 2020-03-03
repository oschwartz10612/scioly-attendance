try {
    let app = firebase.app()
    let features = ['auth', 'firestore'].filter(feature => typeof app[feature] === 'function')
  } catch (e) {
    console.error(e)
  }

  var provider = new firebase.auth.GoogleAuthProvider()
  var db = firebase.firestore()

  var login = document.getElementById('login')
  var logout = document.getElementById('logout')
  var logout2 = document.getElementById('logout2')
  var logged_in = document.getElementById('logged_in')
  var logged_out = document.getElementById('logged_out')
  var fail = document.getElementById('fail')
  var errorCard = document.getElementById('error')

  login.addEventListener('click', () => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
      firebase.auth().signInWithRedirect(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken
        // The signed-in user info.
        var user = result.user
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        console.log(errorMessage)
        logged_out.style.display = 'none'
        logged_in.style.display = 'none'  
        fail.style.display = 'none'  
        errorCard.style.display = 'block'  
        
      })
    }).catch((error) => {
      console.log(errorMessage)
      logged_out.style.display = 'none'
      logged_in.style.display = 'none'  
      fail.style.display = 'none'  
      errorCard.style.display = 'block'  
    })
  })

  logout.addEventListener('click', () => {
    logoutFire();
  })

  logout2.addEventListener('click', () => {
    logoutFire();
  })

  function logoutFire() {
    firebase.auth().signOut().then(function() {
      logged_out.style.display = 'block'
      logged_in.style.display = 'none' 
      fail.style.display = 'none'  
      errorCard.style.display = 'none' 
    }).catch(function(error) {
      logged_out.style.display = 'none'
      logged_in.style.display = 'none'  
      fail.style.display = 'none'  
      errorCard.style.display = 'block'  
    })
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  let params = new URLSearchParams(location.search)
  var meeting = params.get('m')
  var open = params.get('o')
  var close = params.get('c')
  var late = params.get('l')
  var quarter = params.get('q')

  var status = 'Present'

  var today = new Date()
  var minutes = today.getMinutes()
  var hours = today.getHours()
  var prevMeeting = getCookie('prevMeeting')

  if (open == null || close == null || late == null || quarter == null || open == '' || close == '' || late == '' || quarter == '') {
    fail.style.display = 'block'
  } else {

    if (hours >= open && hours <= close) {
      
      if (hours == (close-1) && minutes > late) {
        status = 'Late'
      }

      if (meeting == '' || meeting == null) {
        var dd = today.getDate()
        var mm = today.getMonth()+1 
        var yyyy = today.getFullYear()

        if(dd<10) {
          dd='0'+dd
        } 
        if(mm<10) {
          mm='0'+mm
        }
        meeting = mm+'-'+dd+'-'+yyyy
      }

      if (prevMeeting != meeting) {
          logoutFire();
          setCookie('prevMeeting', meeting, 30);
      }

      firebase.auth().onAuthStateChanged(user => {
        if(user) {

        logged_out.style.display = 'none'
        logged_in.style.display = 'block'

        db.collection(quarter).doc(user.displayName).set({
              name: user.displayName
        }).catch((error) => {
            console.error("Error writing document: ", error)
            displayError()
        })

        db.collection(quarter).doc(user.displayName).collection('meetings').doc(meeting).set({  
          meeting: meeting,
          status: status
        }).catch((error) => {
            console.error("Error writing document: ", error)
            displayError()
        })

        db.collection(quarter).doc('all-meetings').collection('meetings').doc(meeting).set({  
          meeting: meeting
        }).catch((error) => {
            console.error("Error writing document: ", error)
            displayError()
        })

        db.collection('all-quarters').doc('quarters').update({
          collections: firebase.firestore.FieldValue.arrayUnion(quarter)
        }).catch((error) => {
            console.error("Error writing document: ", error)
            displayError()
        })

        } else {
          logged_out.style.display = 'block'
          logged_in.style.display = 'none'  
        }
      })

    } else {
      fail.style.display = 'block'
    }
  }

  function displayError() {
    logged_out.style.display = 'none'
    logged_in.style.display = 'none'  
    fail.style.display = 'none'  
    errorCard.style.display = 'block' 
  }