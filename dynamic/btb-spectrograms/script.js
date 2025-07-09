let soundFile = "https://cdn.glitch.global/1c0afb36-0107-4df8-847d-e35c10e5f287/XC872175%20-%20Red-winged%20Blackbird%20-%20Agelaius%20phoeniceus%20gubernator.wav?v=1709670259110";
let birdSound;
let fft;

function preload() {
  birdSound = loadSound(soundFile);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  fft = new p5.FFT();
}

function draw() {
  //background(255);
  let spectrum = fft.analyze();
  let x = map(birdSound.currentTime(), 0, birdSound.duration(), 0, width);
  //colorMode(HSB);
  for (i = 0; i < spectrum.length; i++) {
    let y = map(i, 100, spectrum.length, height, 0);
    let e = spectrum[i];
    //noStroke();
    stroke(0,0,0,5);
    if(e > 200) {
      stroke(255,0,0,20);
    }
    if (e > 100) {
      push();
      translate(x,y);
      rotate(map(e, 0, 255, 0, -PI));
      line(0,0,e/5, 0);
      pop();
    }
  }
}

function mousePressed() {
  togglePlay();
}

function togglePlay() {
  if(birdSound.isPlaying()) {
    birdSound.pause();
  } else {
    birdSound.loop();
  }
}