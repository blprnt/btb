/*

Christmas Bird Count Viz Example

Data processing code lives in cbc.js and comes from this template:

https://glitch.com/~btb-cbc-template
*/

let compareYears = [];

function setup() {
  createCanvas(0,0);
  //loads and processes data, calls a callback 
  loadCBCData("CBC_Brooklyn.csv", onCBC);
}

function draw() {
}

function onCBC(_data) {
  //*
  //Before I wrote this sketch, I wanted to check the weather in each available year so I could find two comparable years.
  //I did it like this:
  
  for (let i = 0; i < _data.weather.getRowCount(); i++) {  
    console.log(
      i + "---" + 
      _data.weather.get(i, "CountYear") + ": " + 
      _data.weather.get(i, "LowTemp") + " " + 
      _data.weather.get(i, "AMCloud")
    );
  }
  //From this, I saw that 1982 and 2021 are comparable - just below freezing and clear.
  //This project will work with any two years, but this way we reduce weather effects
  //*/
  compareYears = [1982, 2021];
  
  //Set the text on the page
  select("#startYear").html(compareYears[0]);
  select("#endYear").html(compareYears[1]);
  
  //Go through every bird and get two count numbers for each
  let birdDiv = select('#birds');
  let birdsToAdd = [];
  _data.birdList.forEach(bird => {
    let startNum = _data.birdMap[bird][compareYears[0]].howMany;
    let endNum = _data.birdMap[bird][compareYears[1]].howMany;
    //make a block for each
    if (startNum && endNum && startNum != "cw" && endNum != "cw") {
      let b = addBirdBlock(bird, parseFloat(startNum), parseFloat(endNum), 110);
      //birdDiv.child(b);
      b.attribute("data-ratio", parseFloat(startNum) / parseFloat(endNum));
      birdsToAdd.push(b);
    }
    
  }) 
  
  birdsToAdd = birdsToAdd.sort(function(_a, _b) {
    return(_a.attribute("data-ratio") - _b.attribute("data-ratio"));
  });
  
  birdsToAdd.forEach(bird => {
    bird.parent(birdDiv);
  });
  
   
}

function addBirdBlock(_birdName, _startNum, _endNum, _size) {
  //Create the parent div
  let block = createElement('div');
  block.class('grid-element bird');
  block.size(_size, _size + 50);
  
  //Create the label div
  let l = createElement('div');
  l.class('birdLabel');
  l.html("<span>" + _birdName + "</span>")
  l.parent(block);
  
  //Make the block divs
  //Block for start year
  let startBlock = createElement('div');
  startBlock.class('birdBlock');
  startBlock.class('start');
  block.child(startBlock);
  let startNum = createDiv();
  startNum.html(_startNum);
  startNum.class("num");
  startBlock.child(startNum);

  //Block for end year
  let endBlock = createElement('div');
  endBlock.class('birdBlock');
  endBlock.class('end');
  let endNum = createDiv();
  endNum.html(_endNum);
  endNum.class("num");
  endBlock.child(endNum);
  block.child(endBlock);
  
  //size the blocks.
  if (_startNum > _endNum) {
    //if the start is bigger than the end, the start is 100% and the end is a ratio of that
    let s = map(sqrt(_endNum), 0, sqrt(_startNum), 0, _size);
    startBlock.size(_size, _size);
    endBlock.position(_size - s, _size - s);
    endBlock.size(s,s);
    endBlock.class("end front");
    startNum.style("text-align", "right");
  } else {
    //if the end is bigger than the start, the end is 100% and the start is a ratio of that
    let s = map(sqrt(_startNum), 0, sqrt(_endNum), 0, _size);
    startBlock.size(s,s);
    
    startBlock.class("start front");
    endBlock.size(_size, _size);
    endNum.style("text-align", "right");
  }
  
  return(block);

}

