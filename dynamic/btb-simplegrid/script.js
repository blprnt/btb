// Load data

// Transform

// Mock data here
const data = [{time: 'morning', water: true, count: 3}, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1},, {time: 'afternoon', water: true, count: 1}]
const colCount = 5;
const gridSize = 40; 

// Visualize
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw(){
  
  for (let i = 0; i < data.length; i ++){
    let x = 100 + (i % colCount) * gridSize;
    let y = 100 + floor(i / colCount) * gridSize;
    ellipse(x,y,25,25);
    console.log(x + ":" + y);
    
    /*
    if (data[i].water == true){
      fill('blue');
      circle(i,)
    }
    */
  }
  
}

/*
  This is your site JavaScript code - you can add interactivity!
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"


/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the steps in the TODO 🚧
*/
const btn = document.querySelector("button"); // Get the button from the page
if (btn) { // Detect clicks on the button
  btn.onclick = function () {
    // The 'dipped' class in style.css changes the appearance on click
    btn.classList.toggle("dipped");
  };
}


// ----- GLITCH STARTER PROJECT HELPER CODE -----

// Open file when the link in the preview is clicked
let goto = (file, line) => {
  window.parent.postMessage(
    { type: "glitch/go-to-line", payload: { filePath: file, line: line } }, "*"
  );
};
// Get the file opening button from its class name
const filer = document.querySelectorAll(".fileopener");
filer.forEach((f) => {
  f.onclick = () => { goto(f.dataset.file, f.dataset.line); };
});
