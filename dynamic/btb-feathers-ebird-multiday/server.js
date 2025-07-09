var request = require("request");
const express = require("express");
const app = express();

console.log("STARTING");

app.set('view engine', 'pug')
app.use(express.static("public"));

//Endpoint to get history data from the eBird API
//Example URL: /history?loc=L1902982&date=2024/01/01
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
  console.log(options.url);
  request(options).pipe(res);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
