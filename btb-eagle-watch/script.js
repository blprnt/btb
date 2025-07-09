/*

BtB - Eagle Watch
Loads Google Images satellite views for points along a Golden Eagle's path.

*/


//This key is restricted to use for this project. 
//You'll need to get your own: https://developers.google.com/maps/documentation/maps-static/get-api-key
//You'll want to restrict it to the url of the project - ie. YOUR-PROJECT.glitch.me
let apiKey = "AIzaSyANx1vHNtv8MFdGKfAefR92K-F0xO_xSus";
let baseURL = "https://maps.googleapis.com/maps/api/staticmap?";
//Note that this can cost $$ if you get A LOT of traffic.

//All of the Hawk path data
let hawkData;
//A path from the data
let hawkPath;

let maxHeight = 25000;

function setup() {
  createCanvas(0,0);
  loadTable("hawks.csv", "csv", "header", onData);
}

function draw() {
  
}

function hawkGrid(_path, _cols) {
  //Grid setup
  let rows = floor(_path.length / _cols);
  let w = windowWidth / _cols;
  let h = maxHeight / rows;
  
  for(let i = 0; i < _path.length; i++) {
    //Grid position
    let x = (i % _cols) * w;
    let y = floor(i / _cols) * h;
    //Lat/lon
    let lat = _path[i].obj["location-lat"];
    let lon = _path[i].obj["location-long"];
    
    console.log(lat + ":" + lon);
    
    //Get the URL for the sattelite image. Needs ints for the sizes.
    let url = getGoogleURL(lat, lon, floor(w), floor(h));
    console.log(url);
    
    let img = createImg(
      url,
      "Image ALT text goes here"
    );
    img.position(x,y)
    
    
  }
}

function getGoogleURL(_lat, _lon, _w, _h) {
  //Explain zoom level here
  return(baseURL + "key=" + apiKey + "&maptype=satellite&center=" + _lat + "," + _lon + "&zoom=14&size=" + _w + "x" + _h + "&jnk=.jpg");
}

function onData(_data) {
  hawkData = _data;
  //Get a path for a specific individual
  //You can try another ID from the CSV
  hawkPath = getPath("71526",400);
  //Draw a grid of images
  hawkGrid(hawkPath, 3);
}

function getPath(_id, _maxRows) {
  let rows = hawkData.findRows(_id,'tag-local-identifier');
  let filteredRows = [];
  //If there are more rows than our max, sample down
  if (rows.length > _maxRows) {
    let skip = floor(rows.length / _maxRows);
    for(let i = 0; i < rows.length; i+= skip) {
      if (filteredRows.length < _maxRows) {
        filteredRows.push(rows[i]);
      }
    }
  } else {
    filteredRows = rows;
  }
  
  return(filteredRows);
}