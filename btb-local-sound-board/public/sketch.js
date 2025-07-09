/*

BtB API examples - eBird and XenoCanto
Spring, 2024

- Using AudioContext to play sounds
- Loading sounds from XenoCanto using a node server + a proxy

*/

//Place
//You can use these variables instead of the local lat/lon, see below
let lat = 25.26274;
let lon = -80.89976
let dist = 10;

//Audio variables
//This is the object that loads and plays the sounds.
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

//A list of all the birds
let birds;

function preload() {
  //initialize the audio context
 initAudio();
}

function setup() {
  //Get the user's position, call onPosition when we get it
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onPosition);
  } 
}

function draw() {
  
}

//----------------- Audio stuff
function initAudio() {
  audioCtx = new AudioContext();
}

function playSound(_url) {
  let a = new Audio(_url);
  //a.loop = true;
  a.play(); 
}

//----------------- Location trigger
function onPosition(position) {
  console.log(position);
  
  //Use the recent endpoint (see server.js) to get birds near a location
  let eBirdURL = "/recent?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&dist=" + dist;
  console.log("Loading birds from " + eBirdURL);
  //Use the loadJSON method to get the data, call onBirdsLoaded when we have it
  birds = loadJSON(eBirdURL, onBirdsLoaded);
}

function onBirdsLoaded() {
  /*
  loadJSON returns an object with keys:
  {
    1:<first bird object>,
    2:<first bird object>
    ...
  }
  so we can't use a for loop.
  */
  for (let n in birds) {
    let bird = birds[n];
    //make a button for each bird
    let b = createButton(bird.comName);
    //Give it a property for it's common name that we can use
    b.comName = bird.comName;
    //Give it an action when pressed
    b.mousePressed(onBirdButton);
  }
}

function onBirdButton() {
  //The button stores it's common name in the .comName property
  loadJSON("/chirp?species=" + this.comName, onXenoLoaded);
}

function onXenoLoaded(_data) {
  console.log("xeno loaded");
  console.log(_data);
  //Get the first sound
  console.log(_data);
  let first = _data.recordings[0];
  //Play it from the proxy
  let url = first.file.replace("//www.xeno-canto.org", "/xeno");
  playSound(url);
}







