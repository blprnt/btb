function setup() {
  //This code happens once
  createCanvas(windowWidth, windowHeight);
  loadTable("merville.tsv", onBirdData);
}

function draw() {}

function onBirdData(_data) {
  console.log("Got bird data!");
  let gcki = _data.getRow(73);
  vizBird(gcki, width, height / 2, false);
  
  push();
  translate(0, height/2);
  let rcki = _data.getRow(72);
  vizBird(rcki, width, height / 2, true);
  pop();
}

function vizBird(_bird, _chartWidth, _chartHeight, _isUp) {
  for (let i = 0; i < 48; i++) {
    let num = _bird.get(i + 1);
    fill(map(num, 0, 1, 0, 255));
    noStroke();
    if (_isUp) {
      rect(
        i * (_chartWidth / 48),
        _chartHeight,
        _chartWidth / 48,
        -num * _chartHeight
      );
    } else {
      rect(
        i * (_chartWidth / 48),
        0,
        _chartWidth / 48,
        num * _chartHeight
      );
    }
  }

  fill(255);
  textFont("Merriweather");
  textSize(24);
  text(_bird.get(0), 50, _chartHeight / 2);
}
