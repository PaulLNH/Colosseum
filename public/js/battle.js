const BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },
  preload: function() {
    // load assets
    this.load.spritesheet("player", "assets/RPG_assets.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image("dragonblue", "assets/dragonblue.png");
    this.load.image("dragonorange", "assets/dragonorange.png");
  },
  create: function() {
    this.scene.start("BattleScene");
  }
});

const BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BattleScene() {
    Phaser.Scene.call(this, { key: "BattleScene" });
  },
  create: function() {
    // change the background to green
    this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");

    // player character - warrior
    var warrior = new PlayerCharacter(
      this,
      250,
      50,
      "player",
      1,
      "Warrior",
      100,
      20
    );
    this.add.existing(warrior);

    // player character - mage
    var mage = new PlayerCharacter(this, 250, 100, "player", 4, "Mage", 80, 8);
    this.add.existing(mage);

    var dragonblue = new Enemy(
      this,
      50,
      50,
      "dragonblue",
      null,
      "Dragon",
      50,
      3
    );
    this.add.existing(dragonblue);

    var dragonOrange = new Enemy(
      this,
      50,
      100,
      "dragonorange",
      null,
      "Dragon2",
      50,
      3
    );
    this.add.existing(dragonOrange);

    // array with heroes
    this.heroes = [warrior, mage];
    // array with enemies
    this.enemies = [dragonblue, dragonOrange];
    // array with both parties, who will attack
    this.units = this.heroes.concat(this.enemies);

    // Run UI Scene at the same time
    this.scene.launch("UIScene");
  }
});

const UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function UIScene() {
    Phaser.Scene.call(this, { key: "UIScene" });
  },
  create: function() {
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x031f4c, 1);
    this.graphics.strokeRect(2, 150, 90, 100);
    this.graphics.fillRect(2, 150, 90, 100);
    this.graphics.strokeRect(95, 150, 90, 100);
    this.graphics.fillRect(95, 150, 90, 100);
    this.graphics.strokeRect(188, 150, 130, 100);
    this.graphics.fillRect(188, 150, 130, 100);
  }
});

const Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize: function Unit(scene, x, y, texture, frame, type, hp, damage) {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
    this.type = type;
    this.maxHp = this.hp = hp;
    this.damage = damage; // default damate
  },
  attack: function(target) {
    target.takeDamage(this.damage);
  },
  takeDamage: function(damage) {
    this.hp -= damage;
  }
});

const Enemy = new Phaser.Class({
  Extends: Unit,
  initialize: function Enemy(scene, x, y, texture, frame, type, hp, damage) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
  }
});

const PlayerCharacter = new Phaser.Class({
  Extends: Unit,
  initialize: function PlayerCharacter(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage
  ) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    // flip the image since there is no left looking animation in spritesheet
    this.flipX = true;

    this.setScale(2);
  }
});

const MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,
  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, {
      color: "#ffffff",
      align: "left",
      fontSize: 15
    });
  },
  select: function() {
    this.setColor("#f8ff38");
  },
  deselect: function() {
    this.setColor("#ffffff");
  }
});

const Menu = new Phaser.Class({});

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
      debug: false
    }
  },
  scene: [BootScene, BattleScene, UIScene]
};

const game = new Phaser.Game(config);
