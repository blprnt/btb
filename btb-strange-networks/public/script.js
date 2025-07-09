let checkLists = ["S165176426","S157353822","S163125427"];
let nodes = [];
let nodeMap = {}

let codes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadChecklists();
}

function draw() {
  background("white");
  stroke(0);  
  
  codes.forEach(code => {
    connectBirds(code);
  }); 
}

function connectNodes() {
  //Main nodes
  nodes.forEach(node1 => {
    nodes.forEach(node2 => {
      if (node1 != node2) {
        let pos1 = node1.position();
        let pos2 = node2.position();
        line(pos1.x + 50, pos1.y + 50, pos2.x + 50, pos2.y + 50);
      }
    });
  });
}

function connectBirds(_code) {
  stroke("lightgray");
  let birds = selectAll("." + _code);
  birds.forEach(bird1 => {
    birds.forEach(bird2 => {
      if (bird1 != bird2) {
        
        bird1.style("background-color", "yellow");
        
        let pos1 = bird1.position();
        let pos2 = bird2.position();
        
        let p1 = new p5.Element(bird1.parent());
        let p2 = new p5.Element(bird2.parent());
        
        
        let ppos1 = p1.position();
        let ppos2 = p2.position();
        line(pos1.x + ppos1.x, pos1.y + ppos1.y, pos2.x + ppos2.x, pos2.y + ppos2.y);
      }
    });
  });
}

function populateObservations(_e, _obs) {
  let radius = 80;
  for(let i = 0; i < _obs.length; i++) {
    //console.log(_obs[i]);
    let code = _obs[i].speciesCode;
    console.log(code);
    
    let d = createDiv(code);
    d.class("bird " + code);
    _e.child(d);
    
    if (codes.indexOf(code) == -1) {
      codes.push(code);
    }
    
    let theta = map(i, 0, _obs.length, 0, PI * 2);
    let x = (cos(theta) * radius) + 25;
    let y = (sin(theta) * radius) + 35;
    d.position(x,y);
    d.style("transform", "rotate(" + theta + "rad)");
    
  }
}

function loadChecklists() {
  
  checkLists.forEach(list => {
    //Make the element
    let d = createDiv(list);
    d.class("nodey");
    d.position(random(width), random(height));
    makeDraggable(d);
    nodes.push(d);
    
    nodeMap[list] = d;
    
    //Load the data
    loadJSON("/checklist?id=" + list, onBirds); 
  });
}

function onBirds(_data) {
  //Spit out the resulting data into the console.
  let e = nodeMap[_data.subId];
  console.log(_data);
  let obs = _data.obs;
  populateObservations(e, obs);
}


//Drag & Drop Code
function makeDraggable(_e) {
  let elmnt = _e.elt;
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}