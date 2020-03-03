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
  var main = document.getElementById('main')
  var dashboard = document.getElementById('dashboard')
  var quarterName = document.getElementById('quarterName')
  var meetingsCounterDisplay = document.getElementById('meetingsCounterDisplay')

  let params = new URLSearchParams(location.search)
  var quarter = params.get('q')

  login.addEventListener('click', () => {
    firebase.auth().signInWithRedirect(provider).then(function(result) {
    }).catch(function(error) {
      var errorMessage = error.message
      console.log(errorMessage)
      logged_out.style.display = 'none'
      logged_in.style.display = 'none'  
      fail.style.display = 'none'  
      errorCard.style.display = 'block'  
    })
  })

  logout.addEventListener('click', () => {
    logoutFire()
  })

  logout2.addEventListener('click', () => {
    logoutFire()
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

  firebase.auth().onAuthStateChanged(user => {
    if(user) {
        if (quarter == '' || quarter == null) {
            showTiles()
        } else {
            logged_out.style.display = 'none'
            logged_in.style.display = 'block'
            quarterName.innerText = quarter
            buildName(user.displayName, quarter)
        }

    } else {
      logged_out.style.display = 'block'
      logged_in.style.display = 'none'  
    }
  })

  async function buildName(name, quarter) {
    var doc = await db.collection(quarter).doc(name).collection('meetings').get().catch(error => {
      logged_out.style.display = 'none'
      logged_in.style.display = 'none'  
      fail.style.display = 'none'  
      errorCard.style.display = 'block'
      console.log(error);
    })
    var meetingCounter = 0;
    var meetings = [];
    doc.forEach(doc => {
      meetings.push(doc.data())
      if (doc.data().status == 'Present') {
        meetingCounter++
      }
    })
    meetingsCounterDisplay.innerText = meetingCounter
    var table = buildTable(meetings)
    main.appendChild(table)
  }

  function displayError() {
    logged_out.style.display = 'none'
    logged_in.style.display = 'none'  
    fail.style.display = 'none'  
    errorCard.style.display = 'block' 
  }

  function buildTable(data) {
      var table = document.createElement("table");
      table.className="table table-striped";
      var thead = document.createElement("thead");
      var tbody = document.createElement("tbody");
      var headRow = document.createElement("tr");
      ["Meeting Date","Status"].forEach(function(el) {
        var th=document.createElement("th");
        th.appendChild(document.createTextNode(el));
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead); 
      data.forEach(function(el) {
        var tr = document.createElement("tr");
        if (el.status == 'Present') {
          tr.className='table-success'
        }
        if (el.status == 'Late') {
          tr.className='table-warning'
        }
        for (var o in el) {  
          var td = document.createElement("td");
          td.appendChild(document.createTextNode(el[o]))
          tr.appendChild(td);
        }
        tbody.appendChild(tr);  
      });
      table.appendChild(tbody);             
      return table;
  }

  function showTiles() {
  
    db.collection('all-quarters').doc('quarters').get().then(doc => {
          var quarters = doc.data().collections
          var counter = 0
          var collate = document.createElement('div')
          var row = document.createElement('div')
          row.setAttribute("class", "row mb-5")
          quarters.forEach(collection => {
            counter++
  
            if (counter == 4) {
              collate.appendChild(row)
              row = document.createElement('div')
              row.setAttribute("class", "row mb-5")
              counter = 0
            }
  
            var col = document.createElement('div')
            col.setAttribute("class", "col")
  
            var card = document.createElement('div')
            card.setAttribute("class", "card")
  
            var card_body = document.createElement('div')
            card_body.setAttribute("class", "card-body")
            card_body.setAttribute("id", collection)
  
            var card_heading = document.createElement('h1')
            card_heading.setAttribute("id", collection)
            card_heading.setAttribute("class", "card-title mb-5 text-nowrap")
            card_heading.innerText = collection
            card_body.appendChild(card_heading)
  
            var button = document.createElement('button')
            button.setAttribute('type', 'button')
            button.setAttribute('class', 'btn btn-raised btn-dark mt-5')
            button.setAttribute('id', collection)
            button.setAttribute('onClick', 'goToQuarter(this.id)')
            button.innerText = 'Lets Go!'
  
            card_body.appendChild(button)
            card.appendChild(card_body)
            col.appendChild(card)
            row.appendChild(col)
  
          });
          collate.appendChild(row)
          dashboard.appendChild(collate)
      }).catch(error => {
          logged_out.style.display = 'none'
          logged_in.style.display = 'none'  
          fail.style.display = 'block'  
          errorCard.style.display = 'none'
          console.log(error);
      })
  
    }

    function goToQuarter(id){
        window.location.replace(`/me?q=${id}`);    
    }