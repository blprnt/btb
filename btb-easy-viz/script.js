function setup() {
  //Code here happens once per frame
  createCanvas(400, 400);
}

function draw() {
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255,0,0);
  }
  ellipse(mouseX, mouseY, 80, 80);
}