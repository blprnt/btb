let bgColor = "grey"

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupScroll();
}

function draw() {
  background(bgColor);

  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setupScroll() {
  // instantiate the scrollama
  const scroller = scrollama();

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".step",
      debug: false,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);
}

function handleStepEnter(_response) {
  //When an element with the "step" class comes into view
  //Get it's "data-color" attribute and use it to change the bgColor
  bgColor = _response.element.dataset.col;
}

function handleStepExit(_response) {
  
}

