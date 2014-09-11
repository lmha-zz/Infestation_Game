$(document).foundation();
$(document).ready(function(){
	document.onkeydown = function(e) {
		if(e.which == 191) {
			$('#welcome').remove();
			$('#showControls').trigger('click');
		}
	}
	$('#spawn_button').click(function(){
		$('#game_wrapper').css('background-image', "url('images/tiles.png')");
		$('#game_wrapper').html("<canvas id='playerAnimation'></canvas>");
		game = new Game();
		$('#spawn_button').remove();
		setInterval(function(){GameLoop()}, 100);
		for(var i=0; i<3;i++) {
			game.spawnEnemy();
		}
		setInterval(function(){game.spawnEnemy()}, 3000);
	})
})

function GameLoop()
{
	game.refreshEnemies();
	game.detectCollision();
}

function Player() {
	this.x = (window.innerWidth/2)-20,
	this.y = (window.innerHeight/2)-20,
	this.start = 0;
	this.keyMap = {
		37: false, // left key
		38: false, // up key
		39: false, // right key
		40: false, // down key
		32: false, // space key
		191: false, // forward-slash key
	}

	this.spriteLoop = function(timestamp) {
		if (player.start < 6) {
			setTimeout(function() {
				requestAnimationFrame(player.spriteLoop);
			}, 50)
			playerSprite.update();
			playerSprite.render();
			player.start += 1;
		}
		else
		{
			player.start = 0;
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
		console.log(border)
	}
}

function Game() {
	this.players = [];
	this.bullets = [];
	this.enemies = {};
	this.enemyHTML = 0;
	var self = this;

	function initializeGame() {
		window.player = new Player();
		// Get canvas
		canvas = document.getElementById("playerAnimation");
		canvas.width = 32;
		canvas.height = 64;
		// Create sprite sheet
		playerImage = new Image();
		// Create sprite
		playerSprite = player.sprite({
			context: canvas.getContext("2d"),
			width: 192,
			height: 256,
			image: playerImage,
			numberOfFrames: 6,
			ticksPerFrame: 1,
			direction: 0
		});		
		// Load sprite sheet
		playerImage.src = "images/sprites/sprite_sheet.png";
		self.refreshPlayer();
		player.spriteLoop();
	}
	
	document.onkeydown = function(e){
		if (e.which in player.keyMap && e.which != 32) {
			player.keyMap[e.which] = true;
			if (player.keyMap[37]) {
				playerSprite.direction = 128;
				if(player.x > 0) {
					player.x -= 10;
				} else {
					player.x = 0;
				}
				requestAnimationFrame(player.spriteLoop);
			}
			if (player.keyMap[38]) {
				playerSprite.direction = 64;
				if(player.y > 0) {
					player.y -= 10;
				} else {
					player.y = 0;
				}
				requestAnimationFrame(player.spriteLoop);
			}
			if (player.keyMap[39]) {
				playerSprite.direction = 192;
				if(player.x+32 < window.innerWidth) {
					player.x += 10;
				} else {
					player.x = window.innerWidth-32;
				}
				requestAnimationFrame(player.spriteLoop);
			}
			if (player.keyMap[40]) {
				playerSprite.direction = 0;
				if(player.y+62 < window.innerHeight) {
					player.y += 10;
				} else {
					player.y = window.innerHeight-62;
				}
				requestAnimationFrame(player.spriteLoop);
			}
			if (player.keyMap[191]) {
				$('#showControls').trigger('click');
			}
		} else if (e.which in player.keyMap && e.which == 32) {
			if (player.keyMap[32] == true) {
				player.keyMap[32] = false;
			} else {
				player.keyMap[32] = true;
			}
		}
		game.refreshPlayer();
	}
	document.onkeyup = function(e) {
		if(e.which in player.keyMap && e.which != 32) {
			player.keyMap[e.which] = false;
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
		this.enemies[this.enemyHTML] = {
			x: x,
			y: y,
			html: this.enemyHTML,
			target: player
		}
		$('#game_wrapper').append("<span class='enemies' id='enemy"+this.enemyHTML+"' style='top:"+y+"px; left:"+x+"px;'></span>");
		this.enemyHTML++;
	}

	this.detectCollision = function() {
		for (enemy in this.enemies) {
			var minDistance = (16) + (7);
			var actualDistance = Math.sqrt(Math.pow((this.enemies[enemy].x-(player.x+16)), 2) + Math.pow((this.enemies[enemy].y-(player.y+31)), 2));

			if(actualDistance <= minDistance) {
				$('#enemy'+this.enemies[enemy].html).remove();
				delete this.enemies[this.enemies[enemy].html];
			}
		}
	}

	this.refreshPlayer = function() {
		$('#playerAnimation').css('left', player.x).css('top', player.y);
	}

	this.refreshEnemies = function() {
		for (enemy in this.enemies) {
			if(this.enemies[enemy].target.x+16 > this.enemies[enemy].x) {
				this.enemies[enemy].x+=5;
			} else {
				this.enemies[enemy].x-=5;
			}
			if(this.enemies[enemy].target.y+26 > this.enemies[enemy].y) {
				this.enemies[enemy].y+=5;
			} else {
				this.enemies[enemy].y-=5;
			}
			$("#enemy"+this.enemies[enemy].html).css('left', this.enemies[enemy].x).css('top', this.enemies[enemy].y);
		}
	}

	initializeGame();
}