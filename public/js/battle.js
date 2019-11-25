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

    this.index = -1;
  },
  nextTurn: function() {
    this.index++;
    // if there are no more units, we start again from the first one
    if (this.index >= this.units.length) {
      this.index = 0;
    }
    if (this.units[this.index]) {
      // if its player hero
      if (this.units[this.index] instanceof PlayerCharacter) {
        this.events.emit("PlayerSelect", this.index);
      } else {
        // else if its enemy unit
        // pick random hero
        var r = Math.floor(Math.random() * this.heroes.length);
        // call the enemy's attack function
        this.units[this.index].attack(this.heroes[r]);
        // add timer for the next turn, so will have smooth gameplay
        this.time.addEvent({
          delay: 3000,
          callback: this.nextTurn,
          callbackScope: this
        });
      }
    }
  },
  receivePlayerSelection: function(action, target) {
    if (action == "attack") {
      this.units[this.index].attack(this.enemies[target]);
    }
    this.time.addEvent({
      delay: 3000,
      callback: this.nextTurn,
      callbackScope: this
    });
  }
});

const UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function UIScene() {
    Phaser.Scene.call(this, { key: "UIScene" });
  },
  create: function() {
    // Draw the boxes
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x031f4c, 1);
    this.graphics.strokeRect(2, 150, 90, 100);
    this.graphics.fillRect(2, 150, 90, 100);
    this.graphics.strokeRect(95, 150, 90, 100);
    this.graphics.fillRect(95, 150, 90, 100);
    this.graphics.strokeRect(188, 150, 130, 100);
    this.graphics.fillRect(188, 150, 130, 100);

    // basic container to hold all menus
    this.menus = this.add.container();

    this.heroesMenu = new HeroesMenu(195, 153, this);
    this.actionsMenu = new ActionsMenu(100, 153, this);
    this.enemiesMenu = new EnemiesMenu(8, 153, this);

    // the currently selected menu
    this.currentMenu = this.actionsMenu;

    // add menus to the container
    this.menus.add(this.heroesMenu);
    this.menus.add(this.actionsMenu);
    this.menus.add(this.enemiesMenu);

    // Battle scene
    this.battleScene = this.scene.get("BattleScene");
    this.remapHeroes();
    this.remapEnemies();
    this.input.keyboard.on("keydown", this.onKeyInput, this);

    this.events.on("SelectEnemies", this.onSelectEnemies, this);
    this.events.on("Enemy", this.onEnemy, this);
    this.battleScene.nextTurn();
  },
  remapHeroes: function() {
    const heroes = this.battleScene.heroes;
    this.heroesMenu.remap(heroes);
  },
  remapEnemies: function() {
    const enemies = this.battleScene.enemies;
    this.enemiesMenu.remap(enemies);
  },
  onKeyInput: function(event) {
    if (this.currentMenu) {
      if (event.code === "ArrowUp") {
        this.currentMenu.moveSelectionUp();
      } else if (event.code === "ArrowDown") {
        this.currentMenu.moveSelectionDown();
      } else if (event.code === "ArrowRight" || event.code === "Shift") {
        // ??
      } else if (event.code === "Space" || event.code === "ArrowLeft") {
        this.currentMenu.confirm();
      }
    }
  },
  onPlayerSelect: function(id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },
  onSelectEnemies: function() {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },
  onEnemy: function(index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection("attack", index);
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

const Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.heroes = heroes;
    this.x = x;
    this.y = y;
  },
  addMenuItem: function(unit) {
    var menuItem = new MenuItem(
      0,
      this.menuItems.length * 20,
      unit,
      this.scene
    );
    this.menuItems.push(menuItem);
    this.add(menuItem);
  },
  moveSelectionUp: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex--;
    if (this.menuItemIndex < 0) this.menuItemIndex = this.menuItems.length - 1;
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex++;
    if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0;
    this.menuItems[this.menuItemIndex].select();
  },
  // select the menu as a whole and an element with index from it
  select: function(index) {
    if (!index) index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    this.menuItems[this.menuItemIndex].select();
  },
  // deselect this menu
  deselect: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
  },
  confirm: function() {
    // wen the player confirms his slection, do the action
  },
  clear: function() {
    if (this.menuItems.length) {
      this.menuItems.forEach(menuItem => {
        menuItem.destroy();
      });
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  remap: function(units) {
    this.clear();
    if (units.length) {
      units.forEach(unit => {
        this.addMenuItem(unit.type);
      });
    }
  }
});

const HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  }
});

const ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
    this.addMenuItem("Attack");
  },
  confirm: function() {
    this.scene.events.emit("SelectEnemies");
  }
});

const EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
  confirm: function() {
    this.scene.events.emit("Enemy", this.menuItemIndex);
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
      debug: false
    }
  },
  scene: [BootScene, BattleScene, UIScene]
};

const game = new Phaser.Game(config);
