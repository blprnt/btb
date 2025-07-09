//Header row
//event-id,visible,timestamp,location-long,location-lat,gps:activity-count,bar:barometric-pressure,cpu-temperature,external-temperature,gps:satellite-count,ground-speed,heading,height-above-ellipsoid,import-marked-outlier,location-error-numerical,tag-voltage,underwater-time,sensor-type,individual-taxon-canonical-name,tag-local-identifier,individual-local-identifier,study-name

let ostrichTable;
let latBounds;
let lonBounds;

//Timeline
let startTime;
let endTime;
let currentTime;
let timeMag = 100000;


function preload() {
  //Preload the data so it's ready in setup
  ostrichTable = loadTable("data/ostrich.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("white");
  
  let id = 600;
  calculateBounds(ostrichTable, id);
  
}

function draw() {
  background(255);
  currentTime = new Date(currentTime.getTime() + (14 * timeMag));
  fill("red");
  text(currentTime, 50, 50);
  
  
  let id = 600;
  noFill();
  drawPaths(ostrichTable, id);
}

function calculateBounds(_table, _id) {
  
  let lats = [];
  let lons = [];
  
  for (let i = 0; i < _table.getRowCount(); i++) {
    if (_table.get(i, "individual-local-identifier") == _id) {
      //Lat/lon
      let lat = _table.get(i, "location-lat");
      lats.push(lat);
      let lon = _table.get(i, "location-long");
      lons.push(lon);
      //Time
      if (lats.length == 1) {
        //First record
        let startStamp = _table.get(i, "timestamp");
        console.log("Start:" + startStamp);
        startTime = new Date(startStamp);
      }
      let endStamp = _table.get(i, "timestamp");
      endTime = new Date(endStamp);
    }
  }
  
  currentTime = startTime;
  
  latBounds = [min(lats),max(lats)];
  lonBounds = [min(lons),max(lons)];
  
  console.log(latBounds)
  
}

function drawPaths(_table, _id) {
  
  beginShape();
  for (let i = 0; i < _table.getRowCount(); i++) {
    
    if (_table.get(i, "individual-local-identifier") == _id) {
      let lat = _table.get(i, "location-lat");
      let lon = _table.get(i, "location-long");

      let x = map(lon, lonBounds[0], lonBounds[1], 0, windowWidth);
      let y = map(lat, latBounds[0], latBounds[1], windowHeight, 0);
      
      let date = new Date(_table.get(i, "timestamp"));
      
      //ellipse(x, y, 3, 3);
      if (date < currentTime) {
        vertex(x,y);
      }
    }
    
  }
  endShape();
  
}
