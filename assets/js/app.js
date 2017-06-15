// Initialize Firebase
var config = {
  apiKey: "AIzaSyDSO3YFeCHGFGw7bzCG_FjzAGFaYNH4P44",
  authDomain: "train-scheduler-d8a87.firebaseapp.com",
  databaseURL: "https://train-scheduler-d8a87.firebaseio.com",
  projectId: "train-scheduler-d8a87",
  storageBucket: "train-scheduler-d8a87.appspot.com",
  messagingSenderId: "627375460007"
};

firebase.initializeApp(config);

var database = firebase.database();

// google OAuth
$(document).ready(function(){
  // Using a popup.
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
firebase.auth().signInWithPopup(provider).then(function(result) {
 // This gives you a Google Access Token.
 var token = result.credential.accessToken;
 // The signed-in user info.
 var user = result.user;
  console.log(user);
});

})

// initial variables
var trainName, destination, firstTrain, frequency,minutesAway,nextArrival,childData;

  
// Add Train Data Button Click
$("#addData").on("click", function() {
  // Don't refresh the page!
  event.preventDefault();
  
  // Get train data from form
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrain = $("#first-train").val().trim();
  frequency = $("#frequency").val().trim();
  
  // calulate the initial minutes till the first train
  minutesAway = moment(firstTrain, 'HH:mm').diff(moment(), 'minutes');
  // initialize nextArrival to first train
  nextArrival = moment(firstTrain, 'HH:mm');
  
  // if the train has already come, jump to next scheduled departure using the frequency
  while(minutesAway < 1){
    
    nextArrival = moment(nextArrival).add(frequency,'m');
    
    minutesAway = moment(nextArrival, 'HH:mm').diff(moment(), 'minutes');
  }
  // get nextArrival time in correct format to for db
  nextArrival = moment(nextArrival).format('HH:mm');
  // create a new entry for each train using push
  database.ref().push({

    trainName: trainName, 
    destination: destination, 
    firstTrain: firstTrain,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway

  })
});

// function to show the current time 
function currentTime(){
  var currentTime = moment().format('hh: mm A')
  $('#current-time').text(currentTime);
}

// function to both update nextArrival/minutesAway for all scheduled trains and display them on refresh of page
function timeRefresh(childSnapshot){
  
  // if childSnapShot exists
  if(childSnapshot){
    childData = childSnapshot.val();
  }
  
  // next arrival child data
  var nextArrivalChild = moment(childData.nextArrival,'HH:mm');
  // 
  var minutesAwayChild = moment(nextArrivalChild, 'HH:mm').diff(moment(), 'minutes');
  
  // if the train has already come, jump to next scheduled departure using the frequency
  while(minutesAwayChild < 1){
    
    nextArrivalChild = moment(nextArrivalChild,'HH:mm').add(childData.frequency,'m');
    
    minutesAwayChild = moment(nextArrivalChild, 'HH:mm').diff(moment(), 'minutes');

  }
  
  // get nextArrival time in correct format to for db
  nextArrivalChild = moment(nextArrivalChild).format('h:mm A');
  
  //$('#train-data').empty()
  
  // structure for data entry into train table
  var newTrainRow = $('<tr>');
  
  var newTrain = $('<td>').text(childData.trainName).appendTo(newTrainRow);
  var newDestination = $('<td>').text(childData.destination).appendTo(newTrainRow);
  var newFrequency = $('<td>').text(childData.frequency).appendTo(newTrainRow);
  var newMonthsWorked = $('<td>').text(nextArrivalChild).appendTo(newTrainRow);
  var newMonthRate = $('<td>').text(minutesAwayChild).appendTo(newTrainRow);
  
  newTrainRow.appendTo($('#train-data'));
  
}
currentTime();

var intervalId = setInterval(currentTime, 5000)
  
// on child_added run function to refresh train times 
database.ref().on('child_added', timeRefresh);