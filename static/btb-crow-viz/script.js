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

let bird = "American Crow";
let startYear = 1980;
let endYear = 2023;
let currentYear = 1995;

let flyingCount = 0;

let crows = [];

function setup() {
  createCanvas(windowWidth, windowHeight - 100);
  loadCBCData("CBC_Brooklyn.csv");
}

function draw() {
  background("#69F7BE");

  fill(255);
  textSize(24);
  text(currentYear, 50, 50);

  //Update and draw every crow
  crows.forEach((crow) => {
    //update
    crow.x += crow.xSpeed;
    if (crow.y < height - 10 || crow.ySpeed < 0) crow.y += crow.ySpeed;
    //draw body
    fill(0);
    noStroke();
    ellipse(crow.x, crow.y, 5);
    //wings
    if (!crow.landed) {
      //Flying crows
      if (crow.y < height - 10) {
        push();
        translate(crow.x, crow.y);
        let r = random(-PI / 2, PI / 4);
        rotate(r);
        rect(0, 0, 10, 3);
        rotate(-2 * r);
        rect(0, 0, -10, 3);
        pop();
      } else {
        crow.landed = true;
      }
    } else {
      //Landed crows
      if (flyingCount < 5 && random(100) < 0.1) {
        crow.ySpeed = -1;
        flyingCount ++;
      }
      if (crow.landed && crow.ySpeed < 0) {
        push();
        translate(crow.x, crow.y);
        let r = random(-PI / 2, PI / 4);
        rotate(r);
        rect(0, 0, 10, 3);
        rotate(-2 * r);
        rect(0, 0, -10, 3);
        pop();
        //crows that have landed and flew again
        if(random(100) < 0.2) {
          crow.ySpeed = 1;
          flyingCount --;
        }
      }
    }
  });

  //This is the first drop
  if (countData && crows.length == 0) {
    dropCrows(currentYear);
  }
}

function mousePressed() {
  currentYear++;
  if (currentYear > endYear) {
    currentYear = startYear;
  }
  //crows = [];

  dropCrows(currentYear);
}

function dropCrows(_year) {
  //old crows
  crows.forEach((crow) => {
    crow.ySpeed = random(-4, -6);
  });

  //new crows
  if (countData.birdMap["American Crow"][_year]) {
    let crowCount = countData.birdMap["American Crow"][_year].howMany;

    if (crowCount > 0) {
      console.log(crowCount);
      for (let i = 0; i < crowCount; i++) {
        let newCrow = {
          x: random(width),
          y: -random(height),
          xSpeed: 0,
          ySpeed: random(2.7, 4.3),
          landed: false,
        };
        crows.push(newCrow);
      }
    }
  }
}

//Data processing code starts here. I'd normally put this in its own .js file for tidiness
function loadCBCData(_url) {
  loadTable(_url, function (_data) {
    countData = processCBCData(_data);
    console.log(countData);
  });
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
