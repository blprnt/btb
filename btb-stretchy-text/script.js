function setup() {
  createCanvas(400, 400);
}

function draw() {
  background("Ivory");
  textSize(24);
  text("this is some text.", 100, 300);
  renderTextByLetter("this is some text", 100, 200, map(mouseX, 0, width, 0, 10));
}

function renderTextByLetter(_string, _x, _y, _space) {
  push();
  translate(_x, _y);
  let letters = _string.split("");
  
  let stack = 0;
  for (let i = 0; i < letters.length; i++) {
    
    text(letters[i], stack, 0);
    stack += textWidth(letters[i]) + _space;
    
  }
  pop();
  
}
