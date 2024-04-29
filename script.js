var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var width = 900;
var height = 720;
var backgroundColor = '#FFFFFF';
var playerR = 255;
var playerG = 0;
var playerB = 0;
var ballColor = '#000000';
var pauseLoop = true;
var balls = [];
var ballAmount = 1;
var loses = 0;
var score = 0;
var maxScore = 0;
var playerSize = 7;
var playerStartingPosition = 200;
var playerMaxAcceleration = 0.6;
var playerFriction = 0.9;
var ballMinSize = 5;
var ballMaxSize = 10;
var ballMinSpeed = 1;
var ballMaxSpeed = 2;
var inputLeft = false;
var inputRight = false;
var inputTop = false;
var inputBottom = false;
var speedMulti = 0.9;
var ballResetDelay = 750;
var increaseDifficultyRate = .01;
var playerColorAlphaMultiplier = 1;
var lastBallAddedTime = Date.now();
var timeTillNext = 30000;
var imageList = [
    "Image1.jpg",
    "Image2.jpg",
    "Image3.jpg",
    "Image4.jpg",
    "Image5.jpg",
    "Image6.jpg",
    "Image7.jpg",
    // Add more image links as needed
];

canvas.width = width;
canvas.height = height;


function changeBackground() {
    var selectElement = document.getElementById("backgroundSelect");
    var selectedValue = selectElement.value;

    if (selectedValue === "default") {
        document.body.style.backgroundImage = "none";
    } else {
        var imageUrl = selectedValue; // Use the selected value directly
        document.body.style.backgroundImage = "url('" + imageUrl + "')";
        document.body.style.backgroundSize = "cover"; // Optional: Adjust background size
    }
}

function updatePlayerColor() {
    var playerColorInput = document.getElementById('playerColorInput').value;
    var rgb = hexToRgb(playerColorInput);
    playerR = rgb.r;
    playerG = rgb.g;
    playerB = rgb.b;
}

function updateDifficulty(value) {
    timeTillNext = value;
}



function startStopGame() {
    var button = document.getElementById('startStopButton');
    if (pauseLoop) {
        pauseLoop = false;
        button.textContent = 'Stop';
        loop(); 
    } else {
        pauseLoop = true;
        button.textContent = 'Start';
    }
}

function hexToRgb(hex) {
    var bigint = parseInt(hex.substring(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return { r: r, g: g, b: b };
}

function updateBackgroundColor() {
    var backgroundColorInput = document.getElementById('backgroundColorInput').value;
    backgroundColor = backgroundColorInput;
}

function updateBallColor() {
    var BallColorInput = document.getElementById('BallColorInput').value;
    ballColor = BallColorInput;
}

function random() {
    if (arguments.length === 0) {
        return Math.random();
    } else {
        if (typeof arguments[0] == 'object') {
            return arguments[0][Math.floor(Math.random() * arguments[0].length)];
        } else {
            var minimum = (arguments.length === 1) ? 0 : arguments[0];
            var maximum = (arguments.length === 1) ? arguments[0] : arguments[1];

            return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
        }
    }
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
}

function circle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
}

function fill(c) {
    if (c) {
        ctx.fillStyle = c;
    } else {
        ctx.fill();
    }
}

function clearCanvas() {
    fill(backgroundColor);
    rect(0, 0, width, height);
    fill();
}

function increment(a,x){
    a += x
    return a
}


function Ball() {
    this.move = true;
    this.size = random(ballMinSize, ballMaxSize);
    this.posX = width / 1.2;
    this.posY = height / 2;
    this.speedX = random(ballMinSpeed, ballMaxSpeed);
    this.speedY = random(ballMinSpeed, ballMaxSpeed);

    this.update = function () {
        // Update position
        this.posX += this.speedX;
        this.posY += this.speedY; // Reverse  direction for canvas coordinate system

        // Check for collisions with edges
        if ((this.posX <= this.size && this.speedX < 0) || (this.posX >= width - this.size && this.speedX > 0)) {
            this.posX = Math.max(this.size, Math.min(this.posX, width - this.size)); // Clamp position to canvas edges
            this.speedX = -this.speedX; // Reverse horizontal direction
        }
        
        if ((this.posY <= this.size && this.speedY < 0) || (this.posY >= height - this.size && this.speedY > 0)) {
            this.posY = Math.max(this.size, Math.min(this.posY, height - this.size)); // Clamp position to canvas edges
            this.speedY = -this.speedY; // Reverse vertical direction
        }
        

        // Check for collisions with player
        this.checkCollision();
    }

    this.draw = function () {
        fill(ballColor);
        circle(this.posX, this.posY, this.size);
        fill();
    }

    this.checkCollision = function () {
        if (!player.exploded) {
            var circle1 = {
                radius: this.size,
                x: this.posX,
                y: this.posY,
            };
            var circle2 = {
                radius: player.size,
                x: player.posX,
                y: player.posY
            };

            var dx = circle1.x - circle2.x;
            var dy = circle1.y - circle2.y;

            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < circle1.radius + circle2.radius) {
                reset();
                loses++;
            }
        }
    }
}

function Player() {
    this.size = playerSize;
    this.posX = playerStartingPosition;
    this.posY = height / 2;
    this.speedX = 0;
    this.speedY = 0;
    this.acceleration = playerMaxAcceleration;
    this.friction = playerFriction;
    this.exploded = false;
    this.dying = false;

    this.explode = function () {
        if (!this.exploded) {
            this.dying = true;
            this.exploded = true;
        }
    }

    this.die = function () {
        if (this.dying) {
            this.size *= 0.9;
        }
    }

    this.update = function () {
        if (inputRight) {
            this.speedX += this.acceleration;
        } else if (inputLeft) {
            this.speedX -= this.acceleration;
        }

        if (inputBottom) {
            this.speedY += this.acceleration;
        } else if (inputTop) {
            this.speedY -= this.acceleration;
        }

        this.speedX *= this.friction;
        this.speedY *= this.friction;

        this.posX += this.speedX;
        this.posY += this.speedY;

        if (this.posY < 0 - this.size) {
            this.posY = height;
        } else if (this.posY > height + this.size) {
            this.posY = 0;
        }

        if (this.posX < 0 - this.size) {
            this.posX = width;
        } else if (this.posX > width + this.size) {
            this.posX = 0;
        }
    }

    this.draw = function () {
        this.die();
        fill('rgba(' + playerR + ', ' + playerG + ', ' + playerB + ', ' + playerColorAlphaMultiplier + ')');
        circle(this.posX, this.posY, this.size);
        fill();
    }
}

function reset() {
    player.explode();

    setTimeout(function () {
        player = new Player();

        if (score > maxScore) {
            maxScore = score;
        }
        score = 0;
        ballMinSpeed = 2;
        ballMaxSpeed = 4;
        ballAmount = 1;
        
        balls = [];
        start();

        player.posX = playerStartingPosition;
        player.posY = height / 2;
    }, ballResetDelay);
}

var player = new Player();

function start() {
    for (var i = 0; i < ballAmount; i++) {
        var ball = new Ball();
        balls.push(ball);
    }
}

function renderGUI() {
    document.querySelector('.loses').textContent = loses;
    document.querySelector('.score').textContent = score;
    document.querySelector('.maxScore').textContent = maxScore;
}

function increaseDifficulty() {
    var currentTime = Date.now();
    var elapsedTime = currentTime - lastBallAddedTime;

    // Check if 30 seconds have passed since the last ball addition
    if (elapsedTime >= timeTillNext) {
        lastBallAddedTime = currentTime; // Update the last ball added time

        // Increase ball speed
        ballMinSpeed += increaseDifficultyRate;
        ballMaxSpeed += increaseDifficultyRate;
        // Add a new ball
        var ball = new Ball();
        balls.push(ball);
    }
}

function loop() {
    if (!pauseLoop) {
        clearCanvas();

        player.update();
        player.draw();

        for (var i = 0; i < balls.length; i++) {
            balls[i].update();
            balls[i].draw();
        }

        score++;
        renderGUI();

        increaseDifficulty(); 

        requestAnimationFrame(loop);
    }
}



window.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case 39: // Right arrow key
            inputRight = true;
            break;
        case 37: // Left arrow key
            inputLeft = true;
            break;
        case 38: // Up arrow key
            inputTop = true;
            break;
        case 40: // Down arrow key
            inputBottom = true;
            break;
        case 81: // Enter key
            if (!pauseLoop) {
                pauseLoop = true;
            } else {
                pauseLoop = false;
                loop();
            }
            break;
    }
});

window.addEventListener('keyup', function (e) {
    switch (e.keyCode) {
        case 39: // Right arrow key
            inputRight = false;
            break;
        case 37: // Left arrow key
            inputLeft = false;
            break;
        case 38: // Up arrow key
            inputTop = false;
            break;
        case 40: // Down arrow key
            inputBottom = false;
            break;
    }
});

loop();
start();
