/*

HTCB API examples - eBird and XenoCanto
blprnt@blprnt.com
Spring, 2021

*/

const express = require("express");
const app = express();
const request = require("request");
const { createProxyMiddleware } = require("http-proxy-middleware");


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

//proxy for xeno canto
app.use(
  "/xeno",
  createProxyMiddleware({
    changeOrigin: true,
    cookieDomainRewrite: "localhost",
    secure: false,
    target: "http://xeno-canto.org",
    headers: {
      host: "xeno-canto.org",
      origin: null
    },
    pathRewrite: {
      "/xeno": ""
    },
    onProxyRes: function(proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    }
  })
);

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// get a list of birds near a lat/lon
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
      "X-eBirdApiToken": process.env.EBIRDKEY
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
      "X-eBirdApiToken": process.env.EBIRDKEY
    }
  };
  request(options).pipe(res);
});

//Get a xeno-canto sound list based on species name
app.get("/chirp", (req, res) => {
  var species = req.query.species;
  var options = {
    method: "GET",
    url:
      "https://www.xeno-canto.org/api/2/recordings?query=" +
      species +
      "&q=A"
  };

  request(options).pipe(res);
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
