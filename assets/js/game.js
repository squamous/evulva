var canvas;
var context;
var player;
var bullets;
var enemyEvulvas;
var enemies;
var enemySpawner;
var gems;
var particleEffects;
var title;

var hAxis = 0;
var vAxis = 0;
var keyDrop = 2.0;
var keyRise = 5.0;

var flyHeight = 24;
var ShadowColor = "#887e63";

var FPS = 30;
var DeltaTime = 1 / FPS;

var gameOver = false;
var gameStarted = false;

jaws.preventDefaultKeys(['left', 'right', 'space', 'up', 'down']);

var Range = function(min, max) {
  return function() {
    return min + Math.random() * (max - min);
  }
};

var Ranges = { 
  width: Range(1, 8),
  height: Range(3, 15),
  firePeriod: Range(0.005, 0.4),
  exitSpeed: Range(100, 300),
  acceleration: Range(100, 1900),
  angle: Range(0, Math.PI / 3),
  growth: Range(-10, 10),
  fade: Range(1, 1),
  burstSize: Range(1, 100),
  red: Range(0, 1),
  green: Range(0, 1),
  blue: Range(0, 1),
};

function hexColor() {
  var result = "#";
  for (var i = 0; i < 3; i++) {
    var s = (Math.round(arguments[i] * 255)).toString(16);
    if (s.length == 1) result += "0";
    result += s;
  }
  return result;
}

function setup() {
  canvas = document.getElementById('game');
  context = canvas.getContext('2d');
  bullets = new jaws.SpriteList();
  enemyEvulvas = new jaws.SpriteList();
  enemies = new jaws.SpriteList();
  gems = new jaws.SpriteList();
  level = new Level(200, 800);
  particleEffects = new jaws.SpriteList();
  player = createShip('assets/img/plane-1.png', 320, 240, 100, 0.7);
  player.addGun(new Gun(player));
  player.bullets = bullets;
  enemySpawner = new EnemySpawner();

  title = new jaws.Sprite({image: 'assets/img/title.png', x: 0, y: 0, context:context});
};

function startGame() {
}

function update() {

  if (gameStarted == false && jaws.pressed("v")) {
    console.log("START GAME!");
    startGame();
    gameStarted = true;
  }

  if (gameStarted == true && gameOver == false) {
    var x = 0, y = 0;
    if (jaws.pressed("left"))  x--;
    if (jaws.pressed("right")) x++;
    if (jaws.pressed("up"))    y--;
    if (jaws.pressed("down"))  y++;

    hAxis = Math.moveTowards(hAxis, x,
        ((x == 0) ? keyDrop : keyRise) * DeltaTime);

    vAxis = Math.moveTowards(vAxis, y,
        ((y == 0) ? keyDrop : keyRise) * DeltaTime);

    var scale = DeltaTime * 200;
    player.move(hAxis * scale, vAxis * scale);

    player.setFiring(jaws.pressed("v"));
    player.update();
    enemySpawner.update();
  }

  level.update();

  if (gameStarted) {
    bullets.forEach(function(b) { b.update() });
    enemyEvulvas.forEach(function(b) { b.update() });
    enemies.forEach(function(b) { b.update() });
    gems.forEach(function(b) { b.update() });
    particleEffects.forEach(function(b) { b.update() });

    checkCollisions();
    cullDeadObjects();
  }

  if (gameOver == false && player.health < 0) {
    player.destroy();
    gameOver = true;
  }
}

function checkCollisions() {
  bullets.forEach(function(b) {
    enemies.forEach(function(e) {
      // check for collision between bullet and enemy
      if (b.getRect().collideRect(e.getRect())) {
        b.shouldDestroy = true;
        e.health -= b.damage;
        b.destroy();
      }
    });
  });

  var playerRect = player.getRect();
  enemyEvulvas.forEach(function(b) {
      // check for collision between bullet and player
    if (b.getRect().collideRect(playerRect)) {
      b.shouldDestroy = true;
      player.health -= b.damage;
      b.destroy();
    }
  });

  gems.forEach(function(gem) {
      // check for collision between bullet and player
    if (gem.getRect().collideRect(playerRect)) {
      gem.shouldDestroy = true;
      gem.affectGun(player.getGun());
    }
  });
};

function cullDeadObjects() {
  enemies.deleteIf(function(e) {
    if (e.y > jaws.height + 32 || e.health <= 0) {
      e.destroy();
      return true;
    }
    return false;
  });

  bullets.deleteIf(function(b) {
    return b.shouldDestroy || b.y < -32;
  });

  particleEffects.deleteIf(function(p) {
    return p.shouldDestroy;
  });

  enemyEvulvas.deleteIf(function(b) {
    return b.shouldDestroy || b.y > jaws.height + 32;
  });

  gems.deleteIf(function(b) {
    return b.shouldDestroy || isOutsideCanvas(b);
  });
};

function isOutsideCanvas(item) {
  return (item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height);
};

function draw() {
  jaws.clear();
  level.draw();
  enemies.forEach(function(e) { e.drawShadow(); });
  if (gameStarted == false) {
    title.draw();
  } else if (gameOver == false) {
    player.drawShadow();
  }
  bullets.forEach(function(e) { e.drawShadow(); });
  enemyEvulvas.forEach(function(e) { e.drawShadow(); });


  bullets.draw();
  /* TODO
  bullets.forEach(function(b) {
    b.getRect().draw();
  });
  */
  enemyEvulvas.draw();
  enemies.draw();
  if (gameStarted == true && gameOver == false) {
    player.draw();
  }
  gems.draw();
  particleEffects.draw();
}

jaws.assets.add('assets/img/plane-2.png');
jaws.assets.add('assets/img/plane-1.png');
jaws.assets.add('assets/img/title.png');
jaws.start(null, {fps: FPS});
