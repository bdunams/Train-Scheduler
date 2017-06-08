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


var trainName, destination, firstTrain, frequency,minutesAway,nextArrival,childData;

  
//Capture Button Click
$("#addData").on("click", function() {
  // Don't refresh the page!
  event.preventDefault();
  
  // Get train data from form
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrain = $("#first-train").val().trim();
  frequency = $("#frequency").val().trim();
  
  minutesAway = moment(firstTrain, 'HH:mm').diff(moment(), 'minutes');
  nextArrival = moment(firstTrain, 'HH:mm');
  
  while(minutesAway < 1){
    
    nextArrival = moment(nextArrival).add(frequency,'m');
    
    minutesAway = moment(nextArrival, 'HH:mm').diff(moment(), 'minutes');
    
    alert(nextArrival+"---"+minutesAway);
  }
  
  nextArrival = moment(nextArrival).format('HH:mm');
  
  console.log(nextArrival,minutesAway);
  
  console.log(moment(nextArrival, 'HH:mm').diff(moment(), 'm'));
  
  database.ref().push({

    trainName: trainName, 
    destination: destination, 
    firstTrain: firstTrain,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway

  })
});

function timeRefresh(childSnapshot){
  
  if(childSnapshot){
    childData = childSnapshot.val();
  }
  else{
    
  }
  
  console.log(childData)
  
  var nextArrivalChild = moment(childData.nextArrival,'HH:mm');
  
  var minutesAwayChild = moment(nextArrivalChild, 'HH:mm').diff(moment(), 'minutes');
  
  while(minutesAwayChild < 1){
    
    nextArrivalChild = moment(nextArrivalChild,'HH:mm').add(childData.frequency,'m');
    
    minutesAwayChild = moment(nextArrivalChild, 'HH:mm').diff(moment(), 'minutes');

  }
  
  nextArrivalChild = moment(nextArrivalChild).format('HH:mm');
  
  //$('#train-data').empty()
  
  var newTrainRow = $('<tr>');
  
  var newTrain = $('<td>').text(childData.trainName).appendTo(newTrainRow);
  var newDestination = $('<td>').text(childData.destination).appendTo(newTrainRow);
  var newFrequency = $('<td>').text(childData.frequency).appendTo(newTrainRow);
  var newMonthsWorked = $('<td>').text(nextArrivalChild).appendTo(newTrainRow);
  var newMonthRate = $('<td>').text(minutesAwayChild).appendTo(newTrainRow);
  
  newTrainRow.appendTo($('#train-data'));
  
}
console.log(childData)

var intervalId = setInterval(timeRefresh, 5000)
  
database.ref().on('child_added', timeRefresh);