class Ball {
  constructor(x, y, radius) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.radius = radius;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  edges() {
    if (this.position.y + this.radius > height) {
      this.position.y = height - this.radius;
      this.velocity.y *= -0.8;
    }
    if (this.position.x + this.radius > width) {
      this.position.x = width - this.radius;
      this.velocity.x *= -0.8;
    }
    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.velocity.x *= -0.8;
    }
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -0.8;
    }

    if (this.velocity.mag() < 0.1) {
      this.velocity.set(0, 0);
    }
  }

  display() {
    fill(255);
    noStroke();
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }
}

class Goal {
  constructor(x, y, w, h) {
    this.position = createVector(x, y);
    this.w = w;
    this.h = h;
    this.direction = 1;
    this.speed = 1.5;
  }

  update() {
    this.position.y += this.speed * this.direction;
    if (this.position.y < 30 || this.position.y > height - this.h - 30) {
      this.direction *= -1;
    }
  }

  display() {
    fill(0, 255, 0, 230);
    stroke(0, 150, 0);
    strokeWeight(6);
    rect(this.position.x, this.position.y, this.w, this.h, 10);

    noStroke();
    fill(0, 120, 0);
    textSize(26);
    textAlign(CENTER, CENTER);
    text('GOAL', this.position.x + this.w / 2, this.position.y + this.h / 2);
  }
  
  contains(ball) {
    let px = ball.position.x;
    let py = ball.position.y;
    return (
      px + ball.radius > this.position.x &&
      px - ball.radius < this.position.x + this.w &&
      py + ball.radius > this.position.y &&
      py - ball.radius < this.position.y + this.h
    );
  }
}

class Bot {
  constructor(x, y, radius, goal) {
    this.position = createVector(x, y);
    this.radius = radius;
    this.speed = 10; // faster bot speed
    this.goal = goal;
  }

  update(ball) {
    
    let targetY = constrain(ball.position.y, this.goal.position.y + this.radius, this.goal.position.y + this.goal.h - this.radius);
    let diffY = targetY - this.position.y;
    

    this.position.y += constrain(diffY, -this.speed, this.speed);
    this.position.x = this.goal.position.x - this.radius - 5;

    
    if (
      ball.position.x > this.position.x - this.radius &&
      ball.position.x < this.position.x + this.radius &&
      abs(ball.position.y - this.position.y) < this.radius + ball.radius
    ) {
      
      let push = createVector(-6, 0);
      ball.velocity.add(push);

    
      showNiceTryMessage();

      
      resetBall();
    }
  }

  display() {
    fill(255, 0, 0);
    stroke(150, 0, 0);
    strokeWeight(2);
    ellipse(this.position.x, this.position.y, this.radius * 2);
    noStroke();
  }
}

let ball;
let goal;
let bot;
let isDragging = false;
let dragStart = null;
let dragEnd = null;
let score = 0;
let rounds = 10;
let roundTimer = 60;
let startTime;
let showMessage = true;
let showGoalMessage = false;
let goalMessageTimer = 0;
let showNiceTry = false;
let niceTryTimer = 0;

function setup() {
  createCanvas(800, 600);
  ball = new Ball(width / 2, height / 2, 20);
  goal = new Goal(width - 130, height / 2 - 70, 110, 160); // bigger goal
  bot = new Bot(goal.position.x - 30, height / 2, 30, goal);
  startTime = millis();
  textFont('Arial', 20);
}

function draw() {
  background(50, 150, 50);

  goal.update();
  goal.display();

  bot.update(ball);
  bot.display();

  ball.update();
  ball.edges();
  ball.display();

  if (isDragging) {
    stroke(0, 255, 0);
    strokeWeight(2);
    line(dragStart.x, dragStart.y, mouseX, mouseY);
  }

  if (goal.contains(ball)) {
    score++;
    showGoalMessage = true;
    goalMessageTimer = 120; // 2 seconds
    resetRound();
  }

  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10);
  text(`Rounds left: ${rounds}`, 10, 40);

  let elapsedSeconds = floor((millis() - startTime) / 1000);
  let timeLeft = max(0, roundTimer - elapsedSeconds);
  text(`Time left: ${timeLeft}`, 10, 70);

  if (timeLeft <= 0) {
    noLoop();
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 0, 0);
    text("Game Over!", width / 2, height / 2);
  }

  if (showGoalMessage) {
    fill(255, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GOAL!!!", width / 2, height / 2 - 100);
    goalMessageTimer--;
    if (goalMessageTimer <= 0) {
      showGoalMessage = false;
    }
  }

  if (showNiceTry) {
    fill(255, 200, 0);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("Nice try!", width / 2, height / 2 - 50);
    niceTryTimer--;
    if (niceTryTimer <= 0) {
      showNiceTry = false;
    }
  }

  if (showMessage) {
    if (millis() - startTime < 5000) {
      fill(255, 255, 0);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Drag and release the ball to shoot at the green goal!", width / 2, height - 50);
    } else {
      showMessage = false;
    }
  }
}

function resetRound() {
  rounds--;
  resetBall();
  startTime = millis();

  if (rounds <= 0) {
    noLoop();
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Game Over!", width / 2, height / 2);
  }
}

function resetBall() {
  ball.position.set(width / 2, height / 2);
  ball.velocity.set(0, 0);
  ball.acceleration.set(0, 0);
}

function mousePressed() {
  let d = dist(mouseX, mouseY, ball.position.x, ball.position.y);
  if (d < ball.radius) {
    isDragging = true;
    dragStart = createVector(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (isDragging) {
    dragEnd = createVector(mouseX, mouseY);
    let direction = p5.Vector.sub(dragStart, dragEnd);
    let strength = direction.mag();
    direction.normalize();
    
    
    direction.mult(strength / 15); 
    
    ball.velocity = direction;

    isDragging = false;
    dragStart = null;
    dragEnd = null;
  }
}

function showNiceTryMessage() {
  showNiceTry = true;
  niceTryTimer = 90; 
}
