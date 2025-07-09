/*

BtB example - Sound and Images for bird species from eBird codes

To Do:

Loading indicator when the sound is loading
Checklist details on screen
More graceful load of images

*/

//Checklist ID
//this is the ID appended on an URL, like:
//https://ebird.org/checklist/S163336502
let id = "S237610680";

//Audio variables
//This is the object that loads and plays the sounds.
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

//A list of all the birds
let birds = [];
//A list of all the eBird codes
let birdCodes = [];

//Bird in the center
let focusBird;

//Sound object
let sound;

function preload() {
  //initialize the audio context
  initAudio();
}

function setup() {
  
  //Get the data from the /checklist endpoint
  loadJSON("/checklist?id=" + id, onChecklist);
}

function draw() {
  
  //Update the positions of the birds. This does the animation
  birds.forEach(bird => {
    bird.pos.x += (bird.pos.tx - bird.pos.x) * 0.1;
    bird.pos.y += (bird.pos.ty - bird.pos.y) * 0.1;
  })
  
  //Set an object for the center point
  let center = {
    x: windowWidth / 2,
    y: windowHeight / 2,
  };
  
  //Set the radius of the circle
  let radius = windowHeight * 0.45;
  
  //Loop through the birds and position them
  for (let i = 0; i < birds.length; i++) {
    let b = birds[i];
    //All the non-focus birds go in a circle
    if (b != focusBird) {
      let theta = map(i, 0, birds.length, 0, TAU);
      let thetaAdjust = theta + frameCount / 1000;
      let x = center.x + cos(thetaAdjust) * radius;
      let y = center.y + sin(thetaAdjust) * radius;
      b.pos.tx = x;
      b.pos.ty = y;
      b.style("z-index", floor(map(thetaAdjust % TAU, 0, TAU, 0, 500)));
    } else {
      //The focus bird goes in the center
      b.pos.tx = center.x;
      b.pos.ty = center.y;
    }
    
    //Position all of them
    b.position(b.pos.x, b.pos.y);
  }
}

function mousePressed() {
  //When we click, change the bird.
  changeFocusBird();
}

function changeFocusBird() {
  //stop and playing sound
  if (sound) sound.pause();
  //Pick a random bird
  let bird = birds[floor(random(birds.length))];
  focusBird = bird;
  //Request sounds
  console.log("/chirp?species=" + bird.name);
  loadJSON("/chirp?species=" + bird.name, onXenoLoaded);
}

function onChecklist(_data) {
  //The data return is an object with a pile of things returned.
  //See:  https://documenter.getpostman.com/view/664302/S1ENwy59#2ee89672-4211-4fc1-8493-5df884fbb386
  //
  //The important bit to us is the 'obs' object which lists the species by the 6 letter eBird code
  //We need these codes so let's put them into a list of objects which we'll populate more later (declared at the top of the code)
  _data.obs.forEach((obs) => {
    birdCodes.push(obs.speciesCode);
  });
  console.log(birdCodes);
  //We want to do two things with these.
  //First, get images and English names for the birds. We get this from wikiData.
  getBirdInfo(birdCodes);
}

function getBirdInfo(_codes) {
  let wikiCall = getWikiBirds(_codes, "en");
  //The function returns a promise, so we don't have to use a callback.
  wikiCall.then((wikiBirds) => {
    wikiBirds.forEach((wb) => {
      //We get two things out of here:
      //wb.url.value - the URL for the image
      //wb.name - The english common name of the bird

      //Make a figure
      let fig = createElement("figure");
      //Add the image
      let img = createImg(wb.url.value, wb.name);
      //And the caption
      let caption = createElement("figcaption");
      caption.html(wb.name);
      fig.child(img);
      fig.child(caption);
      
      //Set some data objects to use. This one holds the bird's common name.
      fig.name = wb.name;
      
      //This one sets the position for placement and animation
      fig.pos = {
        x:0,
        y:0,
        tx:0,
        ty:0
      }

      //Add the figures to the bird array
      birds.push(fig);
    });
  });
  
}

//----------------- Audio stuff
function initAudio() {
  audioCtx = new AudioContext();
}

function playSound(_url) {
  sound = new Audio(_url);
  sound.loop = true;
  sound.play();
}

function onXenoLoaded(_data) {
  console.log("xeno loaded");
  console.log(_data);
  //Get the first sound
  let first = _data.recordings[0];
  //Play it from the proxy
  let url = first.file.replace("//www.xeno-canto.org", "/xeno");
  playSound(url);
}

/************** BEGIN WIKIDATA STUFF***********/

const endpointUrl = "https://query.wikidata.org/sparql";
let sparqlQuery = `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/> 
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX v: <http://www.wikidata.org/prop/statement/>

SELECT ?item ?itemLabel ?image ?ebird WHERE {
  VALUES ?BIRDS { {{birdlist}} }
  ?item wdt:P3444 ?BIRDS.
  
  OPTIONAL {?item wdt:P18 ?image.}
  OPTIONAL {?item wdt:P3444 ?ebird.}
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language {{lang}} .
   }
}`;

async function getWikiBirds(_birds, _lang) {
  //build space-delimited bird list
  let birdList = "";
  _birds.forEach((bird) => {
    birdList += '"' + bird + '" ';
  });
  console.log(birdList);

  let results = [];

  //Get common names(translated) and images from wikidata
  const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
  await queryDispatcher
    .query(
      sparqlQuery
        .replace("{{birdlist}}", birdList)
        .replace("{{lang}}", '"' + _lang + '"')
    )
    .then((wikis) => {
      console.log(wikis);
      let blist = wikis.results.bindings;
      blist.forEach((b) => {
        results.push({
          name: b.itemLabel.value,
          url: b.image,
        });
      });
    });

  return results;
}

class SPARQLQueryDispatcher {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    console.log(sparqlQuery);
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    const headers = {
      Accept: "application/sparql-results+json",
    };

    return fetch(fullUrl, { headers }).then((body) => body.json());
  }
}
