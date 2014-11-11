/*      a fairly simple game, copyrights: Johan "J00nz" Jönsson      */

/* --------- Objects ---------- */

function Ship(x, y) {
    this.x = x;
    this.y = y;
}

function Shot(x, y) {
    this.x = x;
    this.y = y;
}

function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0.5;

    this.tick = function (v, game, i) {
        this.y += v;

        if (this.y > game.height) {
            game.enemies.splice(i, 1);
            game.money -= 100;
            return;
        }

        this.x += (this.vx * v);

        if ((this.vx > 0 && (this.x + game.shipWidth) > game.width) || (this.vx < 0 && this.x < 0)) {
            this.vx = -this.vx;
        }
    };
}

/* --------- Game ---------- */

var sisGame = {
    // Properties
    ships: [],
    shots: [],
    enemies: [],
    gameState: "Running",
    height: 0,
    width: 0,
    shipHeight: 0,
    shipWidth: 0,
    shotWidth: 0,
    enemySpawn: 5000,
    spawnEnemy: false,
    money: 0,

    // Application entry-point
    main: function () {
        this.canvas = document.getElementById("mainCanvas");
        this.canvas.addEventListener("click", this.onCanvasClick.bind(this));

        document.getElementById("addShip").addEventListener("click", this.addShip.bind(this));
        document.getElementById("shoot").addEventListener("click", this.shoot.bind(this));

        this.assets = document.getElementById("assets");

        this.updateCanvasVars();

        this.lastFrame = new Date();

        var self = this;

        this.money = 750;

        setTimeout(this.tick.bind(this), 100);

        setTimeout(this.doSpawnEnemy.bind(this), 10000);
    },

    // Game-Logic
    tick: function () {
        var currentFrame = new Date();
        var delta = (currentFrame - this.lastFrame) * 0.1;


        this.loopThroughArray(this.shots, function (shot, i) {
            var removed = false;

            newY = shot.y - (delta * this.shipHeight * 0.5);

            this.loopThroughArray(this.enemies, function (enemy, j) {
                if (shot.x > enemy.x && (shot.x + 1) < (enemy.x + this.shipWidth) &&
                    (newY + this.shipHeight > enemy.y && shot.y <= (enemy.y + this.shipHeight))) {

                    removed = true;
                    this.shots.splice(i, 1);
                    this.enemies.splice(j, 1);

                    this.money += 50;
                }
            } .bind(this));

            if (!removed && newY < -this.shipHeight) {
                this.shots.splice(i, 1);
            }

            shot.y = newY;
        } .bind(this));

        if (this.spawnEnemy) {
            this.spawnEnemy = false;
            this.enemies.push(new Enemy(Math.random() * this.width, 0));

            this.enemySpawn > 0 && (this.enemySpawn -= 50);
            setTimeout(this.doSpawnEnemy.bind(this), this.enemySpawn);
        }

        i = this.enemies.length;
        while (i--) {
            var enemy = this.enemies[i];
            enemy.tick(delta, this, i);
        }

        this.render();

        this.lastFrame = new Date();

        requestAnimFrame(this.tick.bind(this));
    },

    doSpawnEnemy: function () {
        this.spawnEnemy = true;
    },

    updateCanvasVars: function () {
        this.height = window.innerHeight - 35;

        this.canvas.height = this.height;

        this.width = (this.height / 2) >> 0;

        this.canvas.width = this.width;

        this.shipWidth = (this.width / 10) >> 0; ;
        this.shipHeight = (this.shipWidth / 2) >> 0;
        this.shotWidth = (this.shipHeight / 4) >> 0;
    },

    onCanvasClick: function (event) {
        if (this.gameState == "AddingShip" && this.money > 500) {
            var ship = new Ship(event.offsetX - (this.shipWidth / 2), event.offsetY - (this.shipHeight / 2));

            this.ships.push(ship);

            this.money -= 500;

            this.gameState = "Running";
        }

    },

    addShip: function (event) {
        var state = this.gameState;

        if (state == "Running") {
            if (!this.HasAddedShip) {
                alert("Click on field to place ship!");
                this.HasAddedShip = true;
            }
            this.gameState = "AddingShip";
        } else {
            this.gameState = "Running";
        }
    },

    shoot: function (event) {
        var i = this.ships.length;
        while (this.money > 5 && i--) {
            var ship = this.ships[i];

            this.shots.push(new Shot(ship.x + (this.shipWidth / 2), ship.y));

            this.money -= 5;
        }
    },

    // Rendering functions
    render: function () {
        var ctx = this.canvas.getContext("2d");

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = "#55ff55";
        ctx.font = '15px Courier New';
        ctx.fillText('Funds: ' + this.money + "$", 10, 10);

        this.renderShips(ctx);
        this.renderShots(ctx);
        this.renderEnemies(ctx);
    },

    renderShips: function (ctx) {
        this.loopThroughArray(this.ships, function (ship) {
            ctx.drawImage(this.assets, 0, 20, 14, 7, ship.x, ship.y, this.shipWidth, this.shipHeight);
        } .bind(this));
    },

    renderShots: function (ctx) {
        this.loopThroughArray(this.shots, function (shot) {
            ctx.drawImage(this.assets, 16, 20, 1, 7, shot.x, shot.y, this.shotWidth, this.shipHeight);
        } .bind(this));
    },

    renderEnemies: function (ctx) {
        this.loopThroughArray(this.enemies, function (enemy) {
            ctx.drawImage(this.assets, 0, 0, 21, 15, enemy.x, enemy.y, this.shipWidth, this.shipHeight);
        } .bind(this));
    },

    // Help functions
    loopThroughArray: function (arr, cb) {
        var i = arr.length;

        while (i--) {
            var obj = arr[i];

            cb(obj, i);
        }
    }
};

// Polyfill for animation frame
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function (callback) {
              window.setTimeout(callback, 1000 / 60);
          };
})();

// Invokes main
sisGame.main();
