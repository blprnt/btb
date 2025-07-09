/*

Christmas Bird Count Data Formatter

(Requires p5.js)

The data that comes from the Audubon archive for the CBC is in an... interesting format.
It's definitely meant to be looked at and not computed on.

Here we make a function that parses the data into a clean(ish) object:

(I am not responsible for the header names)

{
  name: 'L.I.: Brooklyn',
  code: 'NYBR',
  latLon: {lat: '40.6160370000', lon: '40.6160370000'},
  weather: Table object for weather,
  effort: Table object for count totals,
  orgs: Table object for sponsoring orgs,
  checklist: Table with bird data,
  compilers: Table with compiler info,
  participants: Table with participant info,
  birdMap: a dictionary of bird counts, which can be retrieved by [common name][year], returning an object {howMany:NUM, numberByPartyHours:NUM},
  birdList: an array of bird common names
}

Headers for table objects are as follows:

weather          "CountYear,LowTemp,HighTemp,AMCloud,PMClouds,AMRain,PMRain,AMSnow,PMSnow",
effort           "CountYear,CountDate,NumParticipants,NumHours,NumSpecies",
orgs             "CountYear,SponsoringOrg",
checklist        "CommonName,CountYear,HowMany,NumberByPartyHours,Flags",
compilers        "CountYear,FirstName,LastName,Email,IsPrimary",
participants     "CountYear,FirstName,LastName"  
    

*/

let countData;

//You can use a name here, otherwise it'll pick a random bird
//   bird = "American Crow"

let bird = "Double-crested Cormorant";
let startYear = 1980;
let endYear = 2023;

let birdIndex = 0;

let temps = [];

function setup() {
  createCanvas(windowWidth, windowHeight - 100);
  loadCBCData("CBC_Brooklyn.csv");
}

function draw() {
  background("#69F7BE");

  if (countData) {
    if (bird == null) {
      //bird = countData.birdList[floor(random(countData.birdList.length))];
      bird = countData.birdList[birdIndex];
    }
    
    drawChart();
  }
}

function mousePressed() {
  birdIndex++;
  
  console.log(temps[98]);
}

//Chart code
function drawChart() {
  //Title text
  textSize(24);
  fill(255);
  text(countData.name, 50, 50);
  text(bird + " : " + startYear + " - " + endYear, 50, 80);

  //Calculate the max count so we can color that bar orange and size the rest of the bars
  let nums = [];
  for (let i = startYear; i <= endYear; i++) {
    try {
      let num = countData.birdMap[bird][i].howMany;
      if (num != "cw") nums.push(parseInt(num));
    } catch (_e) {}
  }
  let maxNum = max(nums);

  //Draw the graph
  for (let i = startYear; i <= endYear; i++) {
    try {
      let num = countData.birdMap[bird][i].howMany;
      let x = map(i, startYear, endYear, 50, width - 50);
      let y = height - 100;
      let h = -map(num, 0, maxNum, 0, height - 300);
      //The bar
      fill(num == maxNum ? "#FF9900" : 255);
      rect(x, y, 10, h);
      push();

      //The year label
      translate(x, y);
      fill(0);
      rotate(PI / 2);
      textSize(12);
      text(i, 10, 0);
      pop();

      //The count label
      push();
      translate(x, y + h);
      fill(255);
      rotate(-PI / 4);
      textSize(12);
      text(num, 10, 0);
      pop();
    } catch (_e) {}
  }
}

//Data processing code starts here. I'd normally put this in its own .js file for tidiness
function loadCBCData(_url) {
  loadTable(_url, onDataLoaded);
}

function onDataLoaded(_data) {
  countData = processCBCData(_data);
  console.log(countData);

  //populate a weather array
  for (let i = 0; i < countData.weather.getRowCount(); i++) {
    let year = countData.weather.getRow(i).get("CountYear");
    let temp = countData.weather.getRow(i).get("LowTemp"); 
    temps[1900 + int(year)] = temp;
  }
}

function processCBCData(_data) {
  //set the properties of the count
  //L.I.: Brooklyn,NYBR,40.6160370000/-73.9448350000
  let details = _data.getRow(1);
  let count = {
    name: details.get(0),
    code: details.get(1),
    latLon: {
      lat: details.get(2).split("/")[0],
      lon: details.get(2).split("/")[0],
    },
    birdMap: {},
    birdList: [],
  };

  //Go through the data and create a series of Table objects
  let order = [
    "weather",
    "effort",
    "orgs",
    "checklist",
    "compilers",
    "participants",
  ];
  let cleanHeaders = [
    "CountYear,LowTemp,HighTemp,AMCloud,PMClouds,AMRain,PMRain,AMSnow,PMSnow",
    "CountYear,CountDate,NumParticipants,NumHours,NumSpecies",
    "CountYear,SponsoringOrg",
    "CommonName,CountYear,HowMany,NumberByPartyHours,Flags",
    "CountYear,FirstName,LastName,Email,IsPrimary",
    "CountYear,FirstName,LastName",
  ];
  let tcount = 0;
  let table;
  for (let i = 3; i < _data.getRowCount(); i++) {
    let row = _data.getRow(i);
    if (!table) {
      table = new p5.Table();
      //console.log("---");
      let colNames = cleanHeaders[tcount].split(",");
      for (let j = 0; j < colNames.length; j++) {
        //console.log("SET COLUMN:" + colNames[j]);
        table.addColumn(colNames[j]);
      }
      count[order[tcount]] = table;
    } else if (row.arr.join("").indexOf("CountYear") != -1) {
      table = null;
      tcount++;
    } else {
      let r = table.addRow();

      for (let j = 0; j < table.getColumnCount(); j++) {
        r.set(j, row.get(j));
      }

      //If we're in the checklist object, populate the birdmap
      if (tcount == 3) {
        let birdName = row.get(0).split(/\r?\n/)[0];
        let year = row.get(1).split(/\r?\n/)[0].split(" ")[0];
        if (!count.birdMap[birdName]) {
          count.birdMap[birdName] = {};
          count.birdList.push(birdName);
        }
        count.birdMap[birdName][year] = {
          howMany: parseInt(row.get(2)),
          numberByPartyHours: parseFloat(row.get(3)),
        };
        //let
      }
    }
  }

  return count;
}
