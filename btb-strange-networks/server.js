var request = require("request");
const express = require("express");
const app = express();

let regionCode = "L1902982";
let year = 2024;
let month = 2;
let day = 1;

console.log("STARTING");

app.set('view engine', 'pug')
app.use(express.static("public"));

//Get historic observations at a location
app.get("/history", (req, res) => {
  
  var d = req.query.date;
  var loc = req.query.loc;

  var options = {
    method: "GET",
    url: "https://api.ebird.org/v2/data/obs/" + loc + "/historic/" + d,
    headers: {
      "x-ebirdapitoken": process.env.eBirdKey,
    },
  };

  request(options).pipe(res);
});

//Get a list of birds near a lat/lon
app.get("/recent", (req, res) => {
  var dist = req.query.dist;
  var lat = req.query.lat;
  var lon = req.query.lon;


  var options = {
    method: "GET",
    url:
      "https://api.ebird.org/v2/data/obs/geo/recent?lat=" +
      lat +
      "&lng=" +
      lon +
      "&sort=species&dist=" + dist,
    headers: {
      "X-eBirdApiToken": process.env.eBirdKey
    }
  };
  request(options).pipe(res);
});

//Get details from a checklist
app.get("/checklist", (req, res) => {

  var id = req.query.id;

  var options = {
    method: "GET",
    url:
      "https://api.ebird.org/v2/product/checklist/view/" +
      id,
    headers: {
      "X-eBirdApiToken": process.env.eBirdKey
    }
  };
  request(options).pipe(res);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
