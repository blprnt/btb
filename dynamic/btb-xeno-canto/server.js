// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("views"));
app.use(cors());

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

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
