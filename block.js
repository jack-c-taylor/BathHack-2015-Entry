var movePlatformsUpAndDown = false;
var movePlatformsSideways = false;
var disappearingPlatforms = false;
var platformsDirection = -1;
var startDisappear1 = false;
var startDisappear2 = false;
var fallingTrees = false;
var i = 0;
var j = 0;
var emitter;
var music = new Audio("resources/jingle_bells.mp3");
music.volume = 0.25;
music.play();
var height = $(window).height();
var width = $(window).width();
var parameter = Math.min(height, width);

var game = new Phaser.Game( 1.08*parameter, 0.6*parameter, Phaser.AUTO);

var mainState = {



	preload: function () {
		//images
		game.load.image("block", "resources/box.png");
		game.load.image("platform", "resources/platform.png");
		game.load.image("tree", "resources/tree.png");
		game.load.image("snowflake", "resources/snowflake.png");

		//audio
		game.load.audio("hitPlatform", "resources/boing.mp3");
		game.load.audio("explosion", "resources/explosion.mp3");
		game.load.audio("fallDeath", "resources/game_over.mp3");
		game.load.audio("levelUp", "resources/level_up.mp3");
		game.load.audio("bckgdMusic", "resources/jingle_bells.mp3");
	},

	create: function () {
		game.colour = 0xFF0000;

		$(window).resize(function () {
			window.resizeGame();
		});

		game.physics.startSystem(Phaser.Physics.ARCADE);

		//block
		this.block = game.add.sprite(game.width / 4, game.height / 2, "block");
		game.physics.arcade.enable(this.block);
		this.block.body.gravity.y = 800 - game.width/200;
		this.block.body.drag.x = 300; //originally 75
		this.block.body.friction.x = 100;
		this.block.anchor.setTo(0.5);
		this.block.scale.setTo(game.width/600);

		this.block.body.collideWorldBounds = true;

		this.block.lastPlatform = 1;
		this.block.platformCount = 1;

		//platforms
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.platform1 = game.add.sprite(game.width / 6, game.height * 3 / 4, "platform", 0, this.platforms);
		this.platform2 = game.add.sprite(game.width * 4 / 6, game.height * 3 / 4, "platform", 0, this.platforms);
		this.platforms.setAll("body.immovable", true);
		this.platforms.setAll("anchor.setTo", 0.5);
		game.physics.arcade.enable(this.platforms);
		this.platform1.scale.setTo(game.width/750);
		this.platform2.scale.setTo(game.width/750);

		//extra
		this.cursors = game.input.keyboard.createCursorKeys();
		emitter = game.add.emitter(0,0,100);
		emitter.makeParticles("snowflake");
		emitter.gravity = 200;

		//trees
		this.trees = game.add.group();
		this.trees.enableBody = true;
		//sounds
		this.hitPlatformSound = game.add.audio("hitPlatform");
		this.explosionSound = game.add.audio("explosion");
		this.fallDeathSound = game.add.audio("fallDeath");
		this.levelUpSound = game.add.audio("levelUp");
		//music = game.add.audio("bckgdMusic");
		//music.loop = true;
		//music.volume = 0.15;
		//music.play();
	},

	update: function () {
		game.physics.arcade.collide(this.block, this.platforms, this.platformCounting());
		this.blockControls();
		if (this.block.body.y > game.height) {
			this.block.body.y = 0;
		}
		if (this.block.body.velocity.y > 500) {
			this.block.body.velocity.y = 500;
		}

		this.levelCheck();

		if (this.block.body.y >= (game.height - this.block.body.height)) {
			this.block.body.velocity = 0;
			disappearingPlatforms = false;
			this.fallDeathSound.play();
			this.fallDeathSound.onEndedHandler(setTimeout(this.restart, 1000));
		}

		if (movePlatformsUpAndDown == true) {
			this.movePlatformsUpAndDownFn();
		}
		if (movePlatformsSideways == true) {
			this.movePlatformsSidewaysFn();
		}
		if (disappearingPlatforms == true) {
			this.disappearingPlatformsFn();
		}
		if (fallingTrees == true){
			this.fallingTreesFn();
		}

		//tree death
		if(game.physics.arcade.overlap(this.block, this.trees)){
			this.block.exists = false;
			particleBurst();
			this.explosionSound.play();
			setTimeout(this.restart, 1000);
		}
	},

	blockControls: function () {
		if (this.cursors.up.isDown && this.block.body.touching.down) {
			this.block.body.velocity.y = -500;
		}
		if (this.cursors.left.isDown) {
			if (this.block.body.velocity.x > -250) {
				this.block.body.velocity.x -= 50;
			}
		}
		if (this.cursors.right.isDown) {
			if (this.block.body.velocity.x < 250) {
				this.block.body.velocity.x += 50;
			}
		}
	},


	platformCounting: function () {
		if(game.physics.arcade.collide(this.block, this.platform2)) {
			if (this.block.lastPlatform == 1) {
				this.block.platformCount += 1;
				this.block.lastPlatform = 2;
				this.platform2.tint = game.colour;
				this.hitPlatformSound.play();

			}

			if(i > 0 && (Math.cos(i*(Math.PI/60)) - Math.cos((i-1)*(Math.PI/60))*50) < 0) {
				this.block.body.y += (Math.cos(i*(Math.PI/60))*50 - Math.cos((i-1)*(Math.PI/60))*50);
			}
			if(disappearingPlatforms) {
				startDisappear2 = true;
			}

		}
		if(game.physics.arcade.collide(this.block, this.platform1)) {
			if (this.block.lastPlatform == 2) {
				this.block.platformCount += 1;
				this.block.lastPlatform = 1;
				this.platform1.tint = game.colour;
				for (j=0;j<1000;j++){
					console.log("test");
				}
				this.hitPlatformSound.play();
				this.levelUpSound.play();
			}

			if(i > 0 && (Math.sin(i*(Math.PI/60)) - Math.sin((i-1)*(Math.PI/60))*50) < 0) {
				this.block.body.y += (Math.sin(i*(Math.PI/60))*50 - Math.sin((i-1)*(Math.PI/60))*50);
			}
			if(disappearingPlatforms) {
				startDisappear1 = true;
			}
		}
	},

	levelCheck: function () {
		if (this.block.platformCount % 3 == 1) {
			this.block.platformCount += 1;
			this.levelUp((this.block.platformCount-2)/3);
		}
	},


	movePlatformsUpAndDownFn: function () {
		this.platform1.body.y = game.height*3/4+(Math.sin(i*(Math.PI/60)))*50;
		this.platform2.body.y = game.height*3/4+(Math.cos(i*(Math.PI/60)))*50;
		i++;

	},

	movePlatformsSidewaysFn: function () {
		this.platform1.body.x = game.width/6+(Math.sin(i*(Math.PI/60)))*50;
		this.platform2.body.x = game.width*4/6+(Math.sin(i*(Math.PI/60)))*50;
		i++;

	},

	disappearingPlatformsFn: function() {

		if(startDisappear1 == true) {
			this.platform1.alpha -=0.01;
			if(this.platform1.alpha <= 0.2){
				this.platform1.exists = false;
				startDisappear1 = false;
			}
		}
		if(this.platform1.exists == false){
			i++;
			if(i>40){
				this.platform1.exists = true;
				this.platform1.alpha = 1;
			}
		}

		if(startDisappear2 == true) {
			this.platform2.alpha -=0.01;
			if(this.platform2.alpha <= 0.2){
				this.platform2.exists = false;
				startDisappear2 = false;
			}
		}
		if(this.platform2.exists == false){
			j++;
			if(j>40){
				this.platform2.exists = true;
				this.platform2.alpha = 1;
			}
		}

	},

	fallingTreesFn: function() {
		if(Math.random()<0.015){
			this.trees.create(game.width/2 + (Math.random()-0.5)*game.width/6, 0, "tree");
			game.physics.arcade.enable(this.trees);
			this.trees.setAll("checkWorldBounds", true);
			this.trees.setAll("outOfBoundsKill", true);
			this.trees.setAll("body.velocity.y", 400);
		}

	},

	nextLevel: function (level) {
		var newColour = Math.random() * 0xFFFFFF;
		while (game.colour == newColour && newColour != 0xFFFFFF) {
			newColour = Math.random() * 0xFFFFFF;
		}
		game.colour = newColour;
		

		switch (level) {
			case 0:
				movePlatformsUpAndDown = false;
				movePlatformsSideways = false;
				break;
			case 1:
				movePlatformsUpAndDown = true;
				break;
			case 2:
				movePlatformsUpAndDown = false;
				movePlatformsSideways=true;
				break;
			case 3:
				movePlatformsSideways = false;
				disappearingPlatforms = true;
				break;
			case 4:
				disappearingPlatforms = false;
				fallingTrees = true;
				break;
			default:
				if (Math.random()>0.5){
					movePlatformsUpAndDown=false;
				}else{
					movePlatformsUpAndDown=true;
				}
				if (Math.random()>0.5){
					movePlatformsSideways=false;
				}else{
					movePlatformsSideways=true;
				}
				if (Math.random()>0.5){
					disappearingPlatforms=false;
				}else{
					disappearingPlatforms=true;
				}
				if (Math.random()>0.5){
					fallingTrees=false;
				}else{
					fallingTrees=true;
				}
				break;
		}
	},

	levelUp: function(level) {
		this.platform1.body.y = game.height*3/4;
		this.platform2.body.y = game.height*3/4;
		this.platform1.body.x = game.width/6;
		this.platform2.body.x = game.width*4/6;

		this.block.body.y = game.height/2;
		this.block.body.x = game.width/4;

		this.block.body.velocity.x = 0;
		this.block.body.velocity.y = 0;

		startDisappear1 = false;
		startDisappear2 = false;
		fallingTrees = false;
		this.platform1.exists = true;
		this.platform2.exists = true;
		this.platform1.alpha = 1;
		this.platform2.alpha = 1;

		i = 0;
		j = 0;
		mainState.nextLevel(level);
	},

	restart: function() {
		//music.stop();
		game.state.restart("main");
	}
};

game.state.add("main", mainState);
game.state.start("main");

function resizeGame() {
	var height = $(window).height();
	var width = $(window).width();

	var parameter = Math.min(height-100, width);
	game.width = 1.08*parameter;
	game.height = 0.6*parameter;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

function particleBurst() {
	emitter.x = mainState.block.body.x;
	emitter.y = mainState.block.body.y;
	emitter.start(true,2000,null,19);
}