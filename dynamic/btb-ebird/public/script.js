/*

This is an example of using p5.js to get data from the eBird API.

Code for communicating with the API is in the server.js file.

This program uses a proxy which is found at:

https://btb-ebird.glitch.me/history

(We can shorten this to /history)

And can be called with

https://btb-ebird.glitch.me/history?loc={{location}}&date={{date}}

The location is either a code for a location or a region. 
Date is in yyyy/MM/dd format.

The easiest way to find codes for regions is here:

https://ebird.org/explore

  If I search for Kings county, I get this url:

  https://ebird.org/region/US-NY-047?yr=all

  The code for Kings is US-NY-047.

And for hotspots:

https://ebird.org/hotspots

  If I search for Brooklyn Bridge Park and click 'view details' I get this url:

  https://ebird.org/hotspot/L1902982
  
  The code for Brookyln Bridge park is L1902982


Note that using large regions will result in large sets of results!
*/
let loc = 'L1902982';

function setup() {
  //Make a canvas object that takes up the whole window.
  createCanvas(displayWidth, displayHeight);
  //Make it white
  background(255);
  //load some birds
  let url = '/history?loc=' + loc + '&date=2024/2/1';
  loadJSON(url, onBirds);
  
}

function draw() {
  
}

function onBirds(_data) {
  //Spit out the resulting data into the console.
  console.log(_data);
}