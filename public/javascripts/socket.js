var io = io.connect();
var playerID;
var game;

$(document).ready(function(){
	
	io.emit('window_dimensions', { innerWidth: window.innerWidth, innerHeight: window.innerHeight });

	document.onkeydown = function(e) {
		if(e.which == 191) {
			$('#showControls').trigger('click');
		}
	}

	$(document).on('click', '#spawn_button', function(){
		$('#welcome').remove();
		$('#game_wrapper').css('background-image', "url('images/tiles.png')");
		$('#spawn_button').remove();

		io.emit('spawn_button_pressed');
		io.on('new_game', function(data) {
			game = data.current_game;
			$('#game_wrapper').append("<canvas class='players' id='player"+game.playerHTML+"'></canvas>");
			initializeGame();
			io.on('initialized_game', function(){
				gameLoopIntervalID = setInterval(function(){GameLoop()}, 60);
				for(var i=0; i<3;i++) {
					game.spawnEnemy();
				}
				enemySpawnIntervalID = setInterval(function(){game.spawnEnemy()}, game.spawnrateTimer);
			})
		})

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
})

function initializeGame() {
	var player = new Player(game.playerHTML);
	var temp = 'playerSprite'+game.playerHTML;

	game.players.push(player);
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
	game.refreshPlayer();
	player.spriteLoop();

	game.playerHTML++;
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