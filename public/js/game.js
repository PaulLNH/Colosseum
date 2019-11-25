const BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },
  preload: function() {
    // map tiles
    this.load.image("tiles", "assets/map/spritesheet.png");
    // map in json format
    this.load.tilemapTiledJSON("map", "assets/map/map.json");
    // our two characters
    this.load.spritesheet("player", "assets/RPG_assets.png", {
      frameWidth: 16,
      frameHeight: 16
    });
  },
  create: function() {
    this.scene.start("WorldScene");
  }
});

const WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: "WorldScene" });
  },
  preload: function() {},
  /*
  * @create
  */
  create: function() {
    // key: "map" references the first argument of the BootScene.preload this.load.tilemapTiledJSON
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("spritesheet", "tiles");

    const grass = map.createStaticLayer("Grass", tiles, 0, 0);
    const obstacles = map.createStaticLayer("Obstacles", tiles, 0, 0);
    obstacles.setCollisionByExclusion([-1]);

    // Create our player sprite
    this.player = this.physics.add.sprite(50, 100, "player", 6);

    // Set the world bounds
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    // prevent player from walking off the map
    this.player.setCollideWorldBounds(true);

    // user keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set camera, stay within world map and follow player sprite
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    // Prevents tile bleeding by showing border lines on tiles
    this.cameras.main.roundPixels = true;

    // animation with key 'left'
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });
    // animation with key 'right' - NOTE: This is the same as left, the sprite sheet has no "right"
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [1, 7, 1, 13]
      }),
      frameRate: 10,
      repeat: -1
    });
    // animation with key 'up'
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [2, 8, 2, 14]
      }),
      frameRate: 10,
      repeat: -1
    });
    // animation with key 'down'
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [0, 6, 0, 12]
      }),
      frameRate: 10,
      repeat: -1
    });

    // Set collision between player and obstacles
    this.physics.add.collider(this.player, obstacles);
  },
  update: function(time, delta) {
    this.player.body.setVelocity(0);
    // Horizontal movmenet
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80);
    }
    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80);
    }

    // Player animations
    // NOTE: not combined with movement, so we can move at angles
    if (this.cursors.left.isDown) {
      this.player.anims.play("left", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.anims.play("right", true);
      this.player.flipX = false;
    } else if (this.cursors.up.isDown) {
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play("down", true);
    } else {
      this.player.anims.stop();
    }
  }
});

const config = {
  type: Phaser.AUTO,
  parent: "content",
  width: 320,
  height: 240,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      // if debug: true then show bounding boxes
      debug: true
    }
  },
  scene: [BootScene, WorldScene]
};

const game = new Phaser.Game(config);