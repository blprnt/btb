function setup() {
  
  let url = "/xeno/api/2/recordings?query=american+goldfinch+q:A";
  getXenoCanto(url);
  
  url = "/xeno/api/2/recordings?query=american+kestrel+q:A";
  getXenoCanto(url);

}

function draw() {
  
}

function getXenoCanto(_url) {
  loadJSON(_url, function(_data) {
    console.log(_data);
    makePlayer(_data.recordings[0]);
  });
  
}

function makePlayer(_recording) {
  let figure = createElement("figure");
  let caption = createElement("figcaption", _recording.en);
  figure.child(caption);
  
  let player = createElement("audio");
  player.attribute("controls", true);
  player.attribute("src", _recording.file.replace("https://xeno-canto.org","/xeno"));
  figure.child(player);

}
