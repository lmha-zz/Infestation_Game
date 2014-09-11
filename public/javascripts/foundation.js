var game;
var gameLoopIntervalID;
var enemySpawnIntervalID;
$(document).foundation();

$(document).ready(function(){
	document.onkeydown = function(e) {
		if(e.which == 191) {
			$('#showControls').trigger('click');
		}
	}
	$(document).on('click', '#spawn_button', function(){
		$('#welcome').remove();
		$('#game_wrapper').css('background-image', "url('images/tiles.png')");
		$('#spawn_button').remove();

		game = new Game();
		$('#game_wrapper').append("<canvas class='players' id='player"+game.playerHTML+"'></canvas>");
		game.initializeGame();

		gameLoopIntervalID = setInterval(function(){GameLoop()}, 60);
		for(var i=0; i<3;i++) {
			game.spawnEnemy();
		}
		enemySpawnIntervalID = setInterval(function(){game.spawnEnemy()}, game.spawnrateTimer);
	})
	$('#game_over_modal').on('closed', function() {
		$('#controls_modal').append("<button id='spawn_button' class='close-reveal-modal'>Click to Start!</button>");
		$('#game_wrapper').css('background-image', "none");
		html = "<div id='welcome' class='row'>"+
			  		"<div class='small-12 columns text-center'>"+
			  			"<h1>Infestiation!</h1>"+
			  			"<h3>Press the forward-slash, '/', key to begin!</h3>"+
			  		"</div>"+
			  	"</div>";
		$('body').prepend(html);
	})
})

function GameLoop()
{
	for (player in game.players) {
		if (game.players[player].keyMap[32]) {
			game.fireBullet();
		}
	}
	game.refreshEnemies();
	game.refreshBullets();
	game.detectCollision();
}

function Player(id) {
	this.x = (window.innerWidth/2)-20,
	this.y = (window.innerHeight/2)-20,
	this.html = id,
	this.start = 0;
	var playerSprite;
	var playerImage;
	var self = this;

	this.keyMap = {
		37: false, // left key
		38: false, // up key
		39: false, // right key
		40: false, // down key
		32: false, // space key
		191: false, // forward-slash key
	}

	this.spriteLoop = function(timestamp) {
		if (self.start < 6) {
			setTimeout(function() {
				requestAnimationFrame(self.spriteLoop);
			}, 50)
			self.playerSprite.update();
			self.playerSprite.render();
			self.start += 1;
		}
		else
		{
			self.start = 0;
		}
	}
	this.sprite = function (options) {
		var that = {},
			frameIndex = 0,
			tickCount = 0,
			ticksPerFrame = options.ticksPerFrame || 0,
			numberOfFrames = options.numberOfFrames || 1;

		that.direction = options.direction;
		that.context = options.context;
		that.width = options.width;
		that.height = options.height;
		that.image = options.image;

		that.update = function() {
			// tickCount += 2;
			// if (tickCount > ticksPerFrame) {
			// 	tickCount = 0;
				// If the current frame index is in range
				if (frameIndex < numberOfFrames - 1) {
					// go to the next frame
					frameIndex += 1;
				}
				else {
					frameIndex = 0;
				}
			// }
		};
		that.render = function() {
			// Clear the canvas
			that.context.clearRect(0, 0, that.width, that.height);
			// Draw the animation
			// context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
			that.context.drawImage(
				that.image, // source image object, sprite sheet img
				frameIndex * that.width / numberOfFrames, // source x, frame index times frame width
				that.direction, // source y, 0
				that.width, // source width, frame width
				that.height, // source height, frame height
				0, // destination x, 0
				0, // destination y, 0
				that.width, // destination width, frame width
				that.height // destination height, frame height
			);
		};
		return that;
	}
}

function Enemy() {
	this.x = Math.random()*window.innerWidth;
	this.y = Math.random()*window.innerHeight;
	this.target = player;
	function randBorder() {
		border = Math.floor(Math.rand*4);
	}
}

function Game() {
	this.players = [];
	this.playerHTML = 0;
	this.bullets = [];
	this.bulletHTML = 0;
	this.enemies = [];
	this.enemyHTML = 0;
	this.spawnrateTimer = 3000;
	var isGameOver;
	var self = this;

	this.initializeGame = function() {
		var player = new Player(self.playerHTML);
		var temp = 'playerSprite'+self.playerHTML;

		self.players.push(player);
		// Get canvas
		canvas = document.getElementById("player"+player.html);
		canvas.width = 32;
		canvas.height = 64;
		// Create sprite sheet
		player.playerImage = new Image();
		// Create sprite
		player.playerSprite = player.sprite({
			context: canvas.getContext("2d"),
			width: 192,
			height: 256,
			image: player.playerImage,
			numberOfFrames: 6,
			ticksPerFrame: 1,
			direction: 0
		});		
		// Load sprite sheet
		player.playerImage.src = "images/sprites/sprite_sheet.png";
		self.refreshPlayer();
		player.spriteLoop();

		self.playerHTML++;
	}
	
	document.onkeydown = function(e){
		if(game != undefined) {
			for (player in game.players) {
				if (e.which in game.players[player].keyMap && e.which != 32) {
					game.players[player].keyMap[e.which] = true;
					if (game.players[player].keyMap[37]) {
						game.players[player].playerSprite.direction = 128;
						if(game.players[player].x > 0) {
							game.players[player].x -= 10;
						} else {
							game.players[player].x = 0;
						}
						requestAnimationFrame(game.players[player].spriteLoop);
					}
					if (game.players[player].keyMap[38]) {
						game.players[player].playerSprite.direction = 64;
						if(game.players[player].y > 0) {
							game.players[player].y -= 10;
						} else {
							game.players[player].y = 0;
						}
						requestAnimationFrame(game.players[player].spriteLoop);
					}
					if (game.players[player].keyMap[39]) {
						game.players[player].playerSprite.direction = 192;
						if(game.players[player].x+32 < window.innerWidth) {
							game.players[player].x += 10;
						} else {
							game.players[player].x = window.innerWidth-32;
						}
						requestAnimationFrame(game.players[player].spriteLoop);
					}
					if (game.players[player].keyMap[40]) {
						game.players[player].playerSprite.direction = 0;
						if(game.players[player].y+62 < window.innerHeight) {
							game.players[player].y += 10;
						} else {
							game.players[player].y = window.innerHeight-62;
						}
						requestAnimationFrame(game.players[player].spriteLoop);
					}
				} else if (e.which in game.players[player].keyMap && e.which == 32) {
					if (game.players[player].keyMap[32] == true) {
						game.players[player].keyMap[32] = false;
					} else {
						game.players[player].keyMap[32] = true;
					}
				}
			}
			game.refreshPlayer();
		} else {
			if(e.which == 191) {
				$('#showControls').trigger('click');
			}
		}
	}
	document.onkeyup = function(e) {
		if(game != undefined) {
			for (player in game.players) {
				if(e.which in game.players[player].keyMap && e.which != 32) {
					game.players[player].keyMap[e.which] = false;
				}
			}
		}
	}

	this.spawnEnemy = function() {
		var x,
			y,
			target;
		var border = {
			0: "left",
			1: "top",
			2: "right",
			3: "bottom"
		}
		randNum = Math.floor(Math.random()*4);
		switch(border[randNum]) {
			case "left":
				x = 0;
				y = Math.floor(Math.random()*(window.innerHeight-7))
				break;
			case "top":
				y = 0;
				x = Math.floor(Math.random()*(window.innerWidth-7))
				break;
			case "right":
				x = (window.innerWidth-7);
				y = Math.floor(Math.random()*(window.innerHeight-7))
				break;
			case "bottom":
				y = (window.innerHeight-7);
				x = Math.floor(Math.random()*(window.innerWidth-7))
				break;
		}
		this.enemies.push({
			x: x,
			y: y,
			html: this.enemyHTML,
			target: this.players[0]
		})
		$('#game_wrapper').append("<span class='enemies' id='enemy"+this.enemyHTML+"' style='top:"+y+"px; left:"+x+"px;'></span>");
		this.enemyHTML++;
	}

	this.fireBullet = function() {
		for(player in this.players) {
			if (this.players[player].keyMap[32]) {
				var x = this.players[player].x+16,
					y = this.players[player].y+31,
					dir = this.players[player].playerSprite.direction;
				
				this.bullets.push({
					x: x,
					y: y,
					html: this.bulletHTML,
					direction: dir
				})

				$('#game_wrapper').append("<span class='bullets' id='bullet"+this.bulletHTML+"' style='top:"+x+"px; left:"+y+"px; '></span>");
				if (dir == 128 || dir == 192) {
					$('#bullet'+this.bulletHTML).css('width', '6px').css('height', '2px')
				} else {
					$('#bullet'+this.bulletHTML).css('width', '2px').css('height', '6px')
				}
				this.bulletHTML++;
			}
		}
	}

	this.detectCollision = function() {
		for (enemy in this.enemies) {
			for (player in this.players) {
				var minPlayerDistance = 16+7;
				var actualPlayerDistance = Math.sqrt(Math.pow(((this.enemies[enemy].x-14+7)-(this.players[player].x)), 2) + Math.pow(((this.enemies[enemy].y-24+7)-(this.players[player].y)), 2))
				if (actualPlayerDistance <= minPlayerDistance) {
					$('#player'+this.players[player].html).remove();
					this.players[player] = this.players[this.players.length-1];
					this.players.pop();
					if (this.players.length == 0) {
						GameOver();
					}
					$('#enemy'+this.enemies[enemy].html).remove();
					this.enemies[enemy] = this.enemies[this.enemies.length-1];
					this.enemies.pop();
				}
			}

			for(bullet in this.bullets) {
				var minBulletDistance = 2+7;
				var actualBulletDistance = Math.sqrt(Math.pow(((this.enemies[enemy].x+7)-(this.bullets[bullet].x)), 2) + Math.pow(((this.enemies[enemy].y+7)-(this.bullets[bullet].y)), 2))
				if(actualBulletDistance <= minBulletDistance) {
					$('#enemy'+this.enemies[enemy].html).remove();
					this.enemies[enemy] = this.enemies[this.enemies.length-1];
					this.enemies.pop();
					$('#bullet'+this.bullets[bullet].html).remove();
					this.bullets[bullet] = this.bullets[this.bullets.length-1];
					this.bullets.pop();
					return;
				}
			}
		}

		for (bullet in this.bullets) {
			if(this.bullets[bullet].x < 0 || this.bullets[bullet].x > window.innerWidth ) {
				$('#bullet'+this.bullets[bullet].html).remove();
				this.bullets[bullet] = this.bullets[this.bullets.length-1];
				this.bullets.pop();
				return;
			}
			if(this.bullets[bullet].y < 0 || this.bullets[bullet].y > window.innerHeight ) {
				$('#bullet'+this.bullets[bullet].html).remove();
				this.bullets[bullet] = this.bullets[this.bullets.length-1];
				this.bullets.pop();
				return;
			}
		}

	}

	this.refreshPlayer = function() {
		for (player in this.players) {
			$('#player'+this.players[player].html).css('left', this.players[player].x).css('top', this.players[player].y);
		}
	}

	this.refreshEnemies = function() {
		for (enemy in this.enemies) {
			if(this.enemies[enemy].target.x+16 > this.enemies[enemy].x) {
				this.enemies[enemy].x+=5;
			} else {
				this.enemies[enemy].x-=5;
			}
			if(this.enemies[enemy].target.y+20 > this.enemies[enemy].y) {
				this.enemies[enemy].y+=5;
			} else {
				this.enemies[enemy].y-=5;
			}
			$("#enemy"+this.enemies[enemy].html).css('left', this.enemies[enemy].x).css('top', this.enemies[enemy].y);
		}
	}

	this.refreshBullets = function() {
		for (bullet in this.bullets) {
			switch(this.bullets[bullet].direction) {
				case 128:
					this.bullets[bullet].x -= 20
					break;
				case 64:
					this.bullets[bullet].y -= 20
					break;
				case 192:
					this.bullets[bullet].x += 20
					break;
				case 0:
					this.bullets[bullet].y += 20
					break;
			}
			$("#bullet"+this.bullets[bullet].html).css('left', this.bullets[bullet].x).css('top', this.bullets[bullet].y);
		}
	}
}

function GameOver() {
	$('.enemies').remove();
	$('.bullets').remove();

	game = undefined;
	clearInterval(gameLoopIntervalID);
	clearInterval(enemySpawnIntervalID);

	$('#gameOver').trigger('click');
}