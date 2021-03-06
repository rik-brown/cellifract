// cell Class
function Cell(pos, vel, cellStartSize_, lifespan_, level_) {

  // GROWTH & REPRODUCTION
  this.level = level_;
  this.age = 0; //
  this.growth = p.growth * random (0.009, 0.011); // Growth Factor is determined by GUI with some random variation
  this.lifespan = lifespan_ * random (0.9, 1.1); // Lifespan is determined by GUI with some random variation
  this.branchiness = (100-p.branchiness) * random (0.009, 0.011); // Branchiness is determined by GUI with some random variation
  this.life = this.lifespan; // Life is a copy of the initial value for lifespan (since lifespan value is needed later)


  // FILL COLOR
  this.fill_H = hue(p.fillColor)
  this.fill_S = saturation(p.fillColor)
  this.fill_B = brightness(p.fillColor)
  this.fillColor = color(this.fill_H, this.fill_S, this.fill_B); // Initial color is set
  this.fillAlpha = p.fillAlpha

  //STROKE COLOR
  this.stroke_H = hue(p.strokeColor)
  this.stroke_S = saturation(p.strokeColor)
  this.stroke_B = brightness(p.strokeColor)
  this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B); // Initial color is set
  this.strokeAlpha = p.strokeAlpha

  // SIZE AND SHAPE
  this.cellStartSize = cellStartSize_;
  this.cellEndSize = 0.5;
  this.r = this.cellStartSize; // Initial value for radius
  this.size = map(this.r, this.cellStartSize, this.cellEndSize, 1, 0); // Size is a measure of progress from starting to final radius


  // MOVEMENT
  this.position = pos.copy(); //cell has position
  this.velocityLinear = vel.copy(); //cell has velocity
  this.noisePercent = p.noisePercent;
  this.spiral = p.spiral;
  this.vMax = random(0,4); //Maximum magnitude in velocity components generated by noise
  this.xoff = random(1000); //Seed for noise
  this.yoff = random(1000); //Seed for noise
  this.step = random(0.001, 0.006); //Step-size for noise

  this.run = function() {
    this.live();           // Cells age and mature
    this.updatePosition(); // Cells move
    this.updateSize();     // Cells change size
    this.updateColor();    // Cells change color
    //this.cellDebugger(); // Uncomment to enable debug mode for cell
  }

  this.live = function() {
    this.age += 1; // Age starts at 0 and increases by one for every drawcycle
    this.maturity = map(this.age, 0, this.lifespan, 0, 1); // Maturity increases from 0 at spawn to 1 when age = lifespan
  }

  this.updatePosition = function() {
    var vx = map(noise(this.xoff), 0, 1, -this.vMax, this.vMax); // get new vx value from Perlin noise function
    var vy = map(noise(this.yoff), 0, 1, -this.vMax, this.vMax); // get new vy value from Perlin noise function
    var velocityNoise = createVector(vx, vy); // create new velocity vector based on new vx, vy components
    this.xoff += this.step; // increment x offset for next vx value
    this.yoff += this.step; // increment x offset for next vy value
    this.velocity = p5.Vector.lerp(this.velocityLinear, velocityNoise, p.noisePercent*0.01);
    var screwAngle = map(this.maturity, 1, 0, 0, this.spiral * TWO_PI); // maturity is used (instead of size) to give twist even when size is constant
    this.velocity.rotate(screwAngle);
    this.position.add(this.velocity);
  }

  this.updateSize = function() {
    this.r += this.growth;
    this.size = map(this.r, p.cellStartSize, this.cellEndSize, 1, 0);
  }

  this.updateColor = function() {
    if (p.fill_STwist > 0) {this.fill_S = map(this.size, 1, 0, (255-p.fill_STwist), 255); this.fillColor = color(this.fill_H, this.fill_S, this.fill_B);} // Modulate fill saturation by radius
    if (p.fill_BTwist > 0) {this.fill_B = map(this.size, 1, 0, (255-p.fill_BTwist), 255); this.fillColor = color(this.fill_H, this.fill_S, this.fill_B);} // Modulate fill brightness by radius
    if (p.fill_HTwist > 0) { // Modulate fill hue by radius. Does not change original hue value but replaces it with a 'twisted' version
      this.fill_Htwisted = map(this.size, 1, 0, this.fill_H, this.fill_H+p.fill_HTwist);
      if (this.fill_Htwisted > 360) {this.fill_Htwisted -= 360;}
      this.fillColor = color(this.fill_Htwisted, this.fill_S, this.fill_B); //fill colour is updated with new hue value
    }
    if (p.stroke_STwist > 0) {this.stroke_S = map(this.size, 1, 0, (255-p.stroke_STwist), 255); this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B);} // Modulate stroke saturation by radius
    if (p.stroke_BTwist > 0) {this.stroke_B = map(this.size, 1, 0, (255-p.stroke_BTwist), 255); this.strokeColor = color(this.stroke_H, this.stroke_S, this.stroke_B);} // Modulate stroke brightness by radius
    if (p.stroke_HTwist > 0) { // Modulate stroke hue by radius
      this.stroke_Htwisted = map(this.size, 1, 0, this.stroke_H, this.stroke_H+p.stroke_HTwist);
      if (this.stroke_Htwisted > 360) {this.stroke_Htwisted -= 360;}
      this.strokeColor = color(this.stroke_Htwisted, this.stroke_S, this.stroke_B); //stroke colour is updated with new hue value
    }
  }

  this.timeToBranch = function() {
    this.life--;
    if (this.maturity > this.branchiness) { // when life has counted down to zero, the cell will divide
      return true;
    } else {
      return false;
    }
  }

  this.spawn = function(angle) {
    // What is my current heading
    var theta = this.velocity.heading();
    // What is my current speed
    var m = this.velocity.mag();
    // Turn me
    theta += radians(angle);
    // Look, polar coordinates to cartesian!!
    var newvel = createVector(m * cos(theta), m * sin(theta));
    // Return a new Branch
    return new Cell(this.position, newvel, this.r, this.lifespan * 0.9, this.level); // Lifespan gets progressively shorter for each generation
  }


  // Display the cell using ellipse
  this.displayEllipse = function() {
    stroke(hue(this.strokeColor), saturation(this.strokeColor), brightness(this.strokeColor), this.strokeAlpha);
    fill(hue(this.fillColor), saturation(this.fillColor), brightness(this.fillColor), this.fillAlpha);
    var angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    ellipse(0, 0, this.r, this.r);
    pop();
  }


  // Display the cell using points
  this.displayPoint = function() {
    noFill();
    strokeWeight(3);
    stroke(hue(this.strokeColor), saturation(this.strokeColor), brightness(this.strokeColor), this.strokeAlpha);
    point(this.position.x, this.position.y);
  }

  // Death
  this.dead = function() {
    if (this.r < 0 || this.r > this.cellStartSize * 4) {return true;} // Death by size
    if (this.maturity > 1) {return true;} // Death by old age (regardless of size, which may remain constant)
    if (this.position.x > width + this.r*this.flatness || this.position.x < -this.r*this.flatness || this.position.y > height + this.r*this.flatness || this.position.y < -this.r*this.flatness) {return true;} // Death if move beyond canvas boundary
    else {return false; }
  }

  this.cellDebugger = function() { // Displays cell parameters as text at cell position (for debug only)
    var rowHeight = 15;
    fill(255);
    textSize(rowHeight);
    // RADIUS
    //text("r:" + this.r, this.position.x, this.position.y + rowHeight*0);
    //text("cellStartSize:" + this.cellStartSize, this.position.x, this.position.y + rowHeight*2);
    //text("cellEndSize:" + this.cellEndSize, this.position.x, this.position.y + rowHeight*3);

    // GROWTH
    //text("growth:" + this.growth, this.position.x, this.position.y + rowHeight*5);
    text("Level:" + this.level, this.position.x, this.position.y + rowHeight*0);
    text("maturity:" + this.maturity, this.position.x, this.position.y + rowHeight*1);
    text("lifespan:" + this.lifespan, this.position.x, this.position.y + rowHeight*2);
    text("age:" + this.age, this.position.x, this.position.y + rowHeight*3);
    text("Branchiness:" + this.branchiness, this.position.x, this.position.y + rowHeight*4);

    // MOVEMENT
    //text("vel.x:" + this.velocity.x, this.position.x, this.position.y + rowHeight*4);
    //text("vel.y:" + this.velocity.y, this.position.x, this.position.y + rowHeight*5);
    //text("vel.heading():" + this.velocity.heading(), this.position.x, this.position.y + rowHeight*3);
    //text("Noise%:" + p.noisePercent, this.position.x, this.position.y + rowHeight*1);
    //text("screw amount:" + p.spiral, this.position.x, this.position.y + rowHeight*2);
  }




}
