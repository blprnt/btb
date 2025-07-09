let birds = [{ x: 50, y: 50, stopped: false }];
let center;
let rad = 300;

function setup() {
  createCanvas(800, 800);
  center = { x: 400, y: 400 };
}

function draw() {
  
  //create a new one every 5 frames
  if (frameCount % 1 == 0) {
    
    let theta = random(TAU);
    birds.push({
      x:center.x + (cos(theta) * rad),
      y:center.y + (sin(theta) * rad),
      stopped:false
      
    })
  }
  
  background("black");
  //Draw the center
  noStroke();
  fill(255, 0, 0);
  ellipse(center.x, center.y, 50, 50);

  birds.forEach((b) => {
    if (!b.stopped) {
      //get the angle between the bird and the center
      let theta = atan2(center.y - b.y, center.x - b.x);
      //get the vector speeds on the x and y axes
      let xv = cos(theta);
      let yv = sin(theta);
      //Move it
      b.x += xv;
      b.y += yv;
      
      //Check if the next place is red
      let checkX = b.x + (2 * xv);
      let checkY = b.y + (2 * yv);
      let col = get(checkX, checkY);
      b.stopped = (red(col) == 255);
      
      if (b.stopped) {
        //get the distance to the center
        //if it's within a few px of the radius we're dropping from
        //increase that radius
      }
      
    }
    
    //Draw it
    fill(b.stopped ? "red":"green");
    ellipse(b.x, b.y, 5, 5);
  });
}
